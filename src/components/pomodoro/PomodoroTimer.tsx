import { Clock, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  pomodoroCount: number;
  totalMinutes: number;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export const PomodoroTimer = ({
  minutes,
  seconds,
  isRunning,
  pomodoroCount,
  totalMinutes,
  toggleTimer,
  resetTimer,
}: PomodoroTimerProps) => {
  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="flex items-center gap-3">
      {/* タイマー統計情報 */}
      <div className="flex items-center gap-2 text-sm text-notion-secondary">
        <Clock className="h-4 w-4" />
        <span>{pomodoroCount}回</span>
        <span>({totalMinutes}分)</span>
      </div>

      {/* タイマーコントロール */}
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-200",
          isRunning ? "bg-red-50 text-red-500" : "hover:bg-notion-hover"
        )}
      >
        <span className="text-sm font-medium min-w-[54px]">
          {formatTime(minutes)}:{formatTime(seconds)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-notion-hover"
            onClick={toggleTimer}
          >
            {isRunning ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-notion-hover"
            onClick={resetTimer}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};