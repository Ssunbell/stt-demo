"use client";

import { useState, useRef, useCallback } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import TranscriptView from "@/components/TranscriptView";
import StatusIndicator from "@/components/StatusIndicator";
import LatencyStats, { LatencyData } from "@/components/LatencyStats";

export type TranscriptItem = {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
  confidence?: number;
};

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "recording" | "error";

const initialLatencyStats: LatencyData = {
  firstResponseMs: null,
  lastResponseMs: null,
  avgResponseMs: 0,
  minResponseMs: Infinity,
  maxResponseMs: 0,
  totalResponses: 0,
  interimCount: 0,
  finalCount: 0,
};

export default function Home() {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentInterim, setCurrentInterim] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [latencyStats, setLatencyStats] = useState<LatencyData>(initialLatencyStats);
  const recordingStartTimeRef = useRef<number | null>(null);
  const latencySamplesRef = useRef<number[]>([]);

  const handleTranscriptUpdate = useCallback((transcript: TranscriptItem & { latencyMs?: number }) => {
    const prefix = transcript.isFinal ? '✅' : '💬';
    console.log(`${prefix} 실시간: "${transcript.text}"`);
    
    // Update latency stats if latency is provided
    if (transcript.latencyMs !== undefined) {
      const latency = transcript.latencyMs;
      latencySamplesRef.current.push(latency);
      
      setLatencyStats(prev => {
        const newTotal = prev.totalResponses + 1;
        const samples = latencySamplesRef.current;
        const avgMs = samples.reduce((a, b) => a + b, 0) / samples.length;
        
        return {
          firstResponseMs: prev.firstResponseMs === null ? latency : prev.firstResponseMs,
          lastResponseMs: latency,
          avgResponseMs: avgMs,
          minResponseMs: Math.min(prev.minResponseMs === Infinity ? latency : prev.minResponseMs, latency),
          maxResponseMs: Math.max(prev.maxResponseMs, latency),
          totalResponses: newTotal,
          interimCount: prev.interimCount + (transcript.isFinal ? 0 : 1),
          finalCount: prev.finalCount + (transcript.isFinal ? 1 : 0),
        };
      });
    }
    
    if (transcript.isFinal) {
      // Final: add to transcripts list and clear interim
      setTranscripts((prev) => [...prev, transcript]);
      setCurrentInterim(null);
    } else {
      // Interim: just update the current interim text (no accumulation)
      setCurrentInterim(transcript.text);
    }
  }, []);

  const handleStatusChange = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    if (newStatus !== "error") {
      setError(null);
    }
    
    // Reset latency stats when starting recording
    if (newStatus === "recording") {
      recordingStartTimeRef.current = Date.now();
      latencySamplesRef.current = [];
      setLatencyStats(initialLatencyStats);
      setCurrentInterim(null);
    }
    
    // Clear interim when disconnected
    if (newStatus === "disconnected") {
      setCurrentInterim(null);
    }
  }, []);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setStatus("error");
  };

  const handleClear = () => {
    setTranscripts([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎤 실시간 음성-텍스트 변환
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Google Cloud Speech-to-Text 기반 실시간 음성 인식
          </p>
        </header>

        {/* Status Indicator */}
        <div className="mb-6">
          <StatusIndicator status={status} error={error} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                녹음 컨트롤
              </h2>
              <AudioRecorder
                onTranscriptUpdate={handleTranscriptUpdate}
                onStatusChange={handleStatusChange}
                onError={handleError}
              />
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleClear}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  전체 지우기
                </button>
              </div>

              {/* Latency Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <LatencyStats 
                  stats={latencyStats} 
                  isRecording={status === "recording"} 
                />
              </div>
            </div>
          </div>

          {/* Transcript View */}
          <div className="lg:col-span-2">
            <TranscriptView transcripts={transcripts} currentInterim={currentInterim} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by Google Cloud Speech-to-Text v2 (Chirp 3) • 한국어 최적화
          </p>
        </footer>
      </div>
    </div>
  );
}
