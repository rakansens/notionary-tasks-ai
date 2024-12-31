import { Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export const TimerControls = ({
  isRunning,
  toggleTimer,
  resetTimer,
}: TimerControlsProps) => {
  return (
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
  );
};