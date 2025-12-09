"use client";

import { useEffect, useState } from "react";
import { useInactivity } from "@/hooks/use-inactivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function InactivityTimer() {
  const { getLastActivity, timeout } = useInactivity();
  const [timeInactive, setTimeInactive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const lastActivity = getLastActivity();
      const diff = now - lastActivity;
      setTimeInactive(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [getLastActivity]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const remainingTime = timeout > 0 ? Math.max(0, timeout * 1000 - timeInactive) : 0;
  const isWarning = timeout > 0 && remainingTime < 30000; // Warning if less than 30 seconds

  if (timeout === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactivity Timer</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">Disabled</div>
          <p className="text-xs text-muted-foreground">
            Inactivity monitoring is disabled
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Inactivity Timer</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${isWarning ? "text-red-500" : ""}`}
        >
          {formatTime(timeInactive)}
        </div>
        <p className="text-xs text-muted-foreground">
          Time since last activity
        </p>
        <div className="mt-2 text-xs">
          Auto-logout in:{" "}
          <span className={isWarning ? "text-red-500 font-bold" : ""}>
            {formatTime(remainingTime)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
