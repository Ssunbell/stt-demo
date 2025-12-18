"use client";

import { Timer, Zap, TrendingUp, BarChart3 } from "lucide-react";

export interface LatencyData {
  firstResponseMs: number | null;  // Time to first response
  lastResponseMs: number | null;   // Most recent response latency
  avgResponseMs: number;           // Average response latency
  minResponseMs: number;           // Minimum latency
  maxResponseMs: number;           // Maximum latency
  totalResponses: number;          // Total number of responses
  interimCount: number;            // Number of interim results
  finalCount: number;              // Number of final results
}

interface LatencyStatsProps {
  stats: LatencyData;
  isRecording: boolean;
}

export default function LatencyStats({ stats, isRecording }: LatencyStatsProps) {
  const formatMs = (ms: number | null) => {
    if (ms === null) return "-";
    return `${ms.toFixed(0)}ms`;
  };

  const getLatencyColor = (ms: number | null) => {
    if (ms === null) return "text-gray-400";
    if (ms <= 2000) return "text-green-500";   // < 2s is good for STT
    if (ms <= 4000) return "text-yellow-500"; // 2-4s is acceptable
    return "text-red-500";                     // > 4s is slow
  };

  const getLatencyBadge = (ms: number | null) => {
    if (ms === null) return null;
    if (ms <= 2000) return "🟢 빠름";
    if (ms <= 4000) return "🟡 보통";
    return "🔴 느림";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          실시간 벤치마크
        </h3>
        {isRecording && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            측정 중
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* First Response Time */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Zap className="w-3 h-3" />
            첫 응답 지연
          </div>
          <div className={`text-xl font-bold ${getLatencyColor(stats.firstResponseMs)}`}>
            {formatMs(stats.firstResponseMs)}
          </div>
          <div className="text-xs text-gray-400">녹음시작→첫텍스트</div>
        </div>

        {/* Last Response Time */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Timer className="w-3 h-3" />
            응답 간격
          </div>
          <div className={`text-xl font-bold ${getLatencyColor(stats.lastResponseMs)}`}>
            {formatMs(stats.lastResponseMs)}
          </div>
          {stats.lastResponseMs !== null && (
            <div className="text-xs mt-1">{getLatencyBadge(stats.lastResponseMs)}</div>
          )}
        </div>

        {/* Average Response Time */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp className="w-3 h-3" />
            평균
          </div>
          <div className={`text-xl font-bold ${getLatencyColor(stats.avgResponseMs || null)}`}>
            {stats.totalResponses > 0 ? formatMs(stats.avgResponseMs) : "-"}
          </div>
        </div>

        {/* Min/Max */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            최소 / 최대
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stats.totalResponses > 0 
              ? `${formatMs(stats.minResponseMs)} / ${formatMs(stats.maxResponseMs)}`
              : "- / -"
            }
          </div>
        </div>
      </div>

      {/* Response Count */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">총 응답 수</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {stats.totalResponses}개 
            <span className="text-xs text-gray-400 ml-1">
              (interim: {stats.interimCount}, final: {stats.finalCount})
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
