import { Clock, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PomodoroTimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  pomodoroCount: number;
  totalMinutes: number;
  toggleTimer: () => void;
  resetTimer: () => void;
}

const PRESET_TIMES = [
  { label: "5分", value: 5 },
  { label: "10分", value: 10 },
  { label: "15分", value: 15 },
  { label: "25分", value: 25 },
  { label: "60分", value: 60 },
  { label: "90分", value: 90 },
];

const BREAK_TIMES = [
  { label: "3分", value: 3 },
  { label: "5分", value: 5 },
  { label: "10分", value: 10 },
  { label: "15分", value: 15 },
];

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
  const [isBreak, setIsBreak] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(5);
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
    if (/^\d*$/.test(value) && parseInt(value) <= 90) {
      setEditMinutes(value);
    }
  };

  const updateTimer = (newMinutes: number) => {
    if (newMinutes > 0 && newMinutes <= 90) {
      resetTimer();
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
  };

  const handleTimeSubmit = () => {
    const newMinutes = parseInt(editMinutes);
    updateTimer(newMinutes);
    setIsEditing(false);
  };

  const handlePresetSelect = (minutes: number) => {
    updateTimer(minutes);
    setIsEditing(false);
  };

  const handleBreakSelect = (minutes: number) => {
    setBreakMinutes(minutes);
    toast({
      title: "休憩時間を更新しました",
      description: `${minutes}分に設定しました。`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTimeSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditMinutes(minutes.toString());
    }
  };

  const startBreak = () => {
    setIsBreak(true);
    updateTimer(breakMinutes);
    toast({
      title: "休憩時間開始",
      description: `${breakMinutes}分の休憩を開始します。`,
    });
  };

  const endBreak = () => {
    setIsBreak(false);
    updateTimer(25);
    toast({
      title: "作業時間開始",
      description: "25分の作業時間を開始します。",
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-notion-secondary">
        <Clock className="h-4 w-4" />
        <span>{pomodoroCount}回</span>
        <span>({totalMinutes}分)</span>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <div 
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-200 cursor-pointer",
              isBreak ? "bg-green-50 text-green-500" : isRunning ? "bg-red-50 text-red-500" : "hover:bg-notion-hover"
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
                className="text-sm font-medium min-w-[54px]"
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
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">作業時間</h4>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TIMES.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePresetSelect(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">休憩時間</h4>
              <div className="grid grid-cols-2 gap-2">
                {BREAK_TIMES.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    className={cn(
                      "w-full",
                      breakMinutes === preset.value && "bg-green-50 text-green-500"
                    )}
                    onClick={() => handleBreakSelect(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};