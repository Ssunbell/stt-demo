"use client";

import { useState } from "react";
import AudioRecorder from "@/components/AudioRecorder";
import TranscriptView from "@/components/TranscriptView";
import StatusIndicator from "@/components/StatusIndicator";

export type TranscriptItem = {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
  confidence?: number;
};

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "recording" | "error";

export default function Home() {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  const handleTranscriptUpdate = (transcript: TranscriptItem) => {
    console.log(`📝 실시간 텍스트: "${transcript.text}"`);
    
    setTranscripts((prev) => {
      // Always add new transcript to accumulate all updates
      console.log(`  → 새 텍스트 추가 (총 ${prev.length + 1}개)`);
      return [...prev, transcript];
    });
  };

  const handleStatusChange = (newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    if (newStatus !== "error") {
      setError(null);
    }
  };

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

              {/* Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  사용 방법
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 녹음 시작 버튼 클릭</li>
                  <li>• 마이크에 대고 말하기</li>
                  <li>• 실시간으로 텍스트 변환 확인</li>
                  <li>• 녹음 중지로 종료</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transcript View */}
          <div className="lg:col-span-2">
            <TranscriptView transcripts={transcripts} />
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
