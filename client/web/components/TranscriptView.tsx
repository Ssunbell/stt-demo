"use client";

import { useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { TranscriptItem } from "@/app/page";

interface TranscriptViewProps {
  transcripts: TranscriptItem[];
  currentInterim?: { text: string; translation?: string } | null;
}

export default function TranscriptView({ transcripts, currentInterim }: TranscriptViewProps) {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const copyToClipboard = async () => {
    // Copy all transcript texts, joined by newlines
    const text = transcripts.map(t => t.text).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatTimestamp = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          인식 결과
        </h2>
        <button
          onClick={copyToClipboard}
          disabled={transcripts.length === 0}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-colors
            ${
              transcripts.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              복사됨!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              복사
            </>
          )}
        </button>
      </div>

      {/* Transcript List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        {transcripts.length === 0 && !currentInterim ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-center">
              녹음을 시작하면 여기에 텍스트가 표시됩니다.
            </p>
          </div>
        ) : (
          <>
            {/* Final transcripts */}
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className="p-4 rounded-lg border-l-4 bg-green-50 dark:bg-green-900/20 border-green-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                    ✅ 확정
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(transcript.timestamp)}
                  </span>
                </div>
                <p className="text-lg leading-relaxed text-gray-900 dark:text-white font-medium">
                  {transcript.text}
                </p>
                {transcript.translation && (
                  <p className="mt-2 text-base leading-relaxed text-blue-700 dark:text-blue-300 italic">
                    🌐 {transcript.translation}
                  </p>
                )}
                {transcript.confidence && (
                  <div className="mt-2 text-xs text-gray-500">
                    신뢰도: {(transcript.confidence * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
            
            {/* Current interim (only one, always updating) */}
            {currentInterim && (
              <div className="p-4 rounded-lg border-l-4 bg-blue-50 dark:bg-blue-900/20 border-blue-500 animate-pulse">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                    🎤 인식 중...
                  </span>
                </div>
                <p className="text-lg leading-relaxed text-gray-900 dark:text-white font-medium">
                  {currentInterim.text}
                </p>
                {currentInterim.translation && (
                  <p className="mt-2 text-base leading-relaxed text-blue-700 dark:text-blue-300 italic">
                    🌐 {currentInterim.translation}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      {transcripts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              총 {transcripts.length}개 텍스트
            </span>
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              인식 중
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
