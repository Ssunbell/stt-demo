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
  const recordingStartTimeRef = useRef<number>(0);
  const lastResponseTimeRef = useRef<number>(0);
  const speechStartTimeRef = useRef<number>(0);  // When user started speaking (first non-silent audio)
  const hasSpeechRef = useRef<boolean>(false);

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
        const receiveTime = performance.now();
        
        try {
          const data = JSON.parse(event.data);

          if (data.type === "transcript") {
            // Calculate latency based on interim results
            // For interim: time since last interim (or recording start if first)
            // For final: time since last interim
            let latencyMs: number;
            
            if (lastResponseTimeRef.current === 0) {
              // First response: measure from recording start
              latencyMs = Math.round(receiveTime - recordingStartTimeRef.current);
            } else {
              // Subsequent: measure from last response
              latencyMs = Math.round(receiveTime - lastResponseTimeRef.current);
            }
            
            // Only update lastResponseTime for interim results (to measure interim-to-interim interval)
            if (!data.is_final) {
              lastResponseTimeRef.current = receiveTime;
            }
            
            // Reset tracking after final result for next phrase
            if (data.is_final) {
              hasSpeechRef.current = false;
              speechStartTimeRef.current = 0;
              lastResponseTimeRef.current = 0;  // Reset so next phrase measures from recording
            }
            
            const now = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
            const prefix = data.is_final ? '✅ FINAL' : '💬 interim';
            console.log(`[${now}] ${prefix}: "${data.transcript}" (⏱️ ${latencyMs}ms)`);
            
            const transcript: TranscriptItem & { latencyMs: number } = {
              id: `${data.timestamp}-${Math.random()}`,
              text: data.transcript,
              isFinal: data.is_final,
              timestamp: data.timestamp,
              confidence: data.confidence,
              latencyMs: latencyMs,
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

  // Resample audio from source sample rate to target sample rate (16000Hz)
  const resampleAudio = (inputData: Float32Array, fromRate: number, toRate: number): Float32Array => {
    if (fromRate === toRate) {
      return inputData;
    }
    
    const ratio = fromRate / toRate;
    const outputLength = Math.floor(inputData.length / ratio);
    const output = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, inputData.length - 1);
      const t = srcIndex - srcIndexFloor;
      
      // Linear interpolation
      output[i] = inputData[srcIndexFloor] * (1 - t) + inputData[srcIndexCeil] * t;
    }
    
    return output;
  };

  const startMediaRecorder = async (stream: MediaStream) => {
    try {
      // Create AudioContext (browser uses system default sample rate)
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Resume AudioContext if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const browserSampleRate = audioContext.sampleRate;
      console.log(`🎤 AudioContext state: ${audioContext.state}, browser sample rate: ${browserSampleRate}Hz`);
      console.log(`🎤 Will resample to ${SAMPLE_RATE}Hz for server`);
      
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create ScriptProcessor with buffer size adjusted for resampling
      // Use larger buffer (4096) to ensure smooth resampling
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      let audioChunkCount = 0;
      let firstChunk = true;
      
      processor.onaudioprocess = (e) => {
        if (firstChunk) {
          console.log("🎵 First audio chunk received, starting to send data");
          firstChunk = false;
        }
        
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Resample from browser's sample rate to 16000Hz
          const resampledData = resampleAudio(inputData, browserSampleRate, SAMPLE_RATE);
          
          // Convert Float32Array to Int16Array (LINEAR16 PCM)
          const pcmData = new Int16Array(resampledData.length);
          for (let i = 0; i < resampledData.length; i++) {
            // Clamp to [-1, 1] and convert to 16-bit integer
            const s = Math.max(-1, Math.min(1, resampledData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          
          // Convert Int16Array to Uint8Array for proper byte transmission
          // (recommended by Google STT documentation)
          const byteArray = new Uint8Array(pcmData.buffer);
          
          // Detect speech start (simple energy-based detection)
          const energy = resampledData.reduce((sum, sample) => sum + Math.abs(sample), 0) / resampledData.length;
          if (energy > 0.01 && !hasSpeechRef.current) {
            hasSpeechRef.current = true;
            speechStartTimeRef.current = performance.now();
            console.log(`🗣️ Speech detected! Energy: ${energy.toFixed(4)}`);
          }
          
          // Send PCM data as Uint8Array (byte array)
          wsRef.current.send(byteArray);
          
          audioChunkCount++;
          // Log every 20 chunks for visibility
          if (audioChunkCount % 20 === 0) {
            console.log(`🎵 Sent ${audioChunkCount} chunks (${pcmData.length} samples @ ${SAMPLE_RATE}Hz)`);
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
      recordingStartTimeRef.current = performance.now();
      lastResponseTimeRef.current = 0;  // Reset for first response measurement
      hasSpeechRef.current = false;
      speechStartTimeRef.current = 0;
      
      console.log(`🎤 Recording started: ${browserSampleRate}Hz → ${SAMPLE_RATE}Hz resampling`);
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
