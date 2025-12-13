"use client";

import { AlertCircle, CheckCircle2, Wifi, WifiOff, Loader2 } from "lucide-react";
import type { ConnectionStatus } from "@/app/page";

interface StatusIndicatorProps {
  status: ConnectionStatus;
  error: string | null;
}

export default function StatusIndicator({ status, error }: StatusIndicatorProps) {
  const statusConfig = {
    disconnected: {
      icon: WifiOff,
      text: "연결 끊김",
      color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    },
    connecting: {
      icon: Loader2,
      text: "연결 중...",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      animate: true,
    },
    connected: {
      icon: CheckCircle2,
      text: "연결됨",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    recording: {
      icon: Wifi,
      text: "녹음 중",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      pulse: true,
    },
    error: {
      icon: AlertCircle,
      text: "오류",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div
        className={`
          ${config.color}
          rounded-lg p-4 flex items-center gap-3
          transition-all duration-200
        `}
      >
        <Icon
          className={`
            w-5 h-5
            ${"animate" in config && config.animate ? "animate-spin" : ""}
            ${"pulse" in config && config.pulse ? "animate-pulse" : ""}
          `}
        />
        <span className="font-medium">{config.text}</span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-400">에러 발생</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
