import React from "react";

export interface LoadingScreenProps {
  message?: string;
  description?: string;
  className?: string;
}

export function LoadingScreen({
  message = "Bảo mật kết nối",
  description = "Xác thực quyền truy cập...",
  className = "",
}: LoadingScreenProps) {
  return (
    <div className={`relative flex h-screen w-screen items-center justify-center bg-background/95 overflow-hidden ${className}`}>
      {/* Soft atmospheric background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-5 p-8 rounded-2xl border border-primary/10 bg-card/45 backdrop-blur-md shadow-2xl shadow-primary/[0.02] max-w-xs w-full mx-4 transition-all duration-300">
        {/* Custom pulsing loading animation with glow */}
        <div className="relative flex items-center justify-center w-12 h-12">
          {/* Pulsing ring outer */}
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-75" />
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />
          {/* Inner pulsing core */}
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold tracking-tight text-foreground/90">{message}</p>
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        </div>
      </div>
    </div>
  );
}
