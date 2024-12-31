import { Clock, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(minutes.toString());
  const { toast } = useToast();

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  const handleTimeClick = () => {
    if (!isRunning) {
      setIsEditing(true);
      setEditMinutes(minutes.toString());
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && parseInt(value) <= 60) {
      setEditMinutes(value);
    }
  };

  const handleTimeSubmit = () => {
    const newMinutes = parseInt(editMinutes);
    if (newMinutes > 0 && newMinutes <= 60) {
      // Call parent's resetTimer to stop the timer if it's running
      resetTimer();
      // Update the minutes in the parent component through props
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('updateTimer', { 
          detail: { minutes: newMinutes },
          bubbles: true,
          composed: true
        }));
      }
      toast({
        title: "タイマー時間を更新しました",
        description: `${newMinutes}分に設定しました。`,
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTimeSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditMinutes(minutes.toString());
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-notion-secondary">
        <Clock className="h-4 w-4" />
        <span>{pomodoroCount}回</span>
        <span>({totalMinutes}分)</span>
      </div>

      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-200",
          isRunning ? "bg-red-50 text-red-500" : "hover:bg-notion-hover"
        )}
      >
        {isEditing ? (
          <Input
            type="text"
            value={editMinutes}
            onChange={handleTimeChange}
            onBlur={handleTimeSubmit}
            onKeyDown={handleKeyDown}
            className="h-6 w-16 text-sm font-medium text-center"
            autoFocus
          />
        ) : (
          <span 
            className="text-sm font-medium min-w-[54px] cursor-pointer"
            onClick={handleTimeClick}
          >
            {formatTime(minutes)}:{formatTime(seconds)}
          </span>
        )}
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