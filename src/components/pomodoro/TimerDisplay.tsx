import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isBreak: boolean;
  formatTime: (time: number) => string;
  onTimeClick: () => void;
}

export const TimerDisplay = ({
  minutes,
  seconds,
  isRunning,
  isBreak,
  formatTime,
  onTimeClick,
}: TimerDisplayProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-200",
        isBreak ? "bg-green-50 text-green-500" : isRunning ? "bg-red-50 text-red-500" : "hover:bg-notion-hover"
      )}
      onClick={onTimeClick}
    >
      <span className="text-sm font-medium min-w-[54px]">
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </Button>
  );
};