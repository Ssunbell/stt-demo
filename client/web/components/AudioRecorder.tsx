"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import type { TranscriptItem, ConnectionStatus } from "@/app/page";

interface AudioRecorderProps {
  onTranscriptUpdate: (transcript: TranscriptItem) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onError: (error: string) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/stt";
const SAMPLE_RATE = 16000;

export default function AudioRecorder({
  onTranscriptUpdate,
  onStatusChange,
  onError,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up function
  const cleanup = () => {
    // Disconnect audio processor
    if (mediaRecorderRef.current) {
      try {
        (mediaRecorderRef.current as any).disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    mediaRecorderRef.current = null;

    // Close WebSocket if still open (cleanup handles unexpected closures)
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.warn("⚠️ Error closing WebSocket:", e);
        }
      }
      wsRef.current = null;
    }

    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setIsConnecting(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      setIsConnecting(true);
      onStatusChange("connecting");

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      
      // Log stream info
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();
      console.log("🎤 Microphone settings:", settings);

      // Connect WebSocket
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        onStatusChange("connected");
        setIsConnecting(false);

        // Start recording after connection
        startMediaRecorder(stream);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "transcript") {
            const now = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
            const prefix = data.is_final ? '✅ FINAL' : '💬 interim';
            console.log(`[${now}] ${prefix}: "${data.transcript}"`);
            
            const transcript: TranscriptItem = {
              id: `${data.timestamp}-${Math.random()}`,
              text: data.transcript,
              isFinal: data.is_final,
              timestamp: data.timestamp,
              confidence: data.confidence,
            };
            
            // Update UI immediately
            onTranscriptUpdate(transcript);
          } else if (data.type === "error") {
            console.error("❌ STT Error:", data.message);
            onError(data.message);
          }
        } catch (error) {
          console.error("❌ Error parsing message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        onError("WebSocket 연결 오류가 발생했습니다.");
        cleanup();
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket closed");
        if (isRecording) {
          onStatusChange("disconnected");
        }
      };

    } catch (error: any) {
      console.error("❌ Error starting recording:", error);
      
      let errorMessage = "녹음 시작 중 오류가 발생했습니다.";
      if (error.name === "NotAllowedError") {
        errorMessage = "마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "마이크를 찾을 수 없습니다.";
      }
      
      onError(errorMessage);
      cleanup();
    }
  };

  const startMediaRecorder = async (stream: MediaStream) => {
    try {
      // Create AudioContext for PCM audio processing (use browser's default sample rate)
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Resume AudioContext if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const actualSampleRate = audioContext.sampleRate;
      console.log(`🎤 AudioContext state: ${audioContext.state}, sample rate: ${actualSampleRate}Hz`);
      
      if (actualSampleRate !== SAMPLE_RATE) {
        console.warn(`⚠️ Using ${actualSampleRate}Hz instead of requested ${SAMPLE_RATE}Hz. Audio will be resampled on server.`);
      }
      
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create ScriptProcessor with smaller buffer (2048) for more frequent updates
      // This sends audio chunks more often to get faster interim results
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      
      let audioChunkCount = 0;
      let firstChunk = true;
      processor.onaudioprocess = (e) => {
        if (firstChunk) {
          console.log("🎵 First audio chunk received, starting to send data");
          firstChunk = false;
        }
        
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Convert Float32Array to Int16Array (LINEAR16 PCM)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            // Clamp to [-1, 1] and convert to 16-bit integer
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          
          // Send PCM data as binary
          wsRef.current.send(pcmData.buffer);
          
          audioChunkCount++;
          // Log every 20 chunks (about every 200ms at 2048 samples) for better visibility
          if (audioChunkCount % 20 === 0) {
            console.log(`🎵 Sent ${audioChunkCount} audio chunks (${pcmData.length * 2} bytes each)`);
          }
        } else if (wsRef.current) {
          console.warn(`⚠️ WebSocket not open: ${wsRef.current.readyState}`);
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      // Store reference to cleanup later
      mediaRecorderRef.current = processor as any;
      
      setIsRecording(true);
      onStatusChange("recording");
      
      console.log("🎤 Recording started with AudioContext");
    } catch (error) {
      console.error("❌ Error starting AudioContext:", error);
      onError("오디오 처리 시작 실패");
      cleanup();
    }
  };

  const stopRecording = () => {
    console.log("⏹ Stopping recording and closing connection");
    
    // Send any pending data and close WebSocket gracefully
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("🔌 Closing WebSocket connection");
      wsRef.current.close(1000, "Recording stopped by user");
    }
    
    onStatusChange("disconnected");
    cleanup();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={toggleRecording}
        disabled={isConnecting}
        className={`
          w-full p-6 rounded-lg font-semibold text-white text-lg
          transition-all duration-200 transform
          ${isRecording 
            ? "bg-red-500 hover:bg-red-600 active:scale-95" 
            : "bg-blue-500 hover:bg-blue-600 active:scale-95"
          }
          ${isConnecting ? "opacity-50 cursor-not-allowed" : ""}
          flex items-center justify-center gap-2
        `}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            연결 중...
          </>
        ) : isRecording ? (
          <>
            <MicOff className="w-6 h-6" />
            녹음 중지
          </>
        ) : (
          <>
            <Mic className="w-6 h-6" />
            녹음 시작
          </>
        )}
      </button>

      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          녹음 중입니다...
        </div>
      )}
    </div>
  );
}
