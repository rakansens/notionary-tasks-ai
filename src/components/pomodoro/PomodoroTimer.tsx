import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { TimerControls } from "./TimerControls";
import { TimerDisplay } from "./TimerDisplay";
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

  const formatTime = (time: number): string => {
    return time < 10 ? `0${time}` : time.toString();
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
          <div className="flex items-center">
            <TimerDisplay
              minutes={minutes}
              seconds={seconds}
              isRunning={isRunning}
              isBreak={isBreak}
              formatTime={formatTime}
              onTimeClick={handleTimeClick}
            />
            <TimerControls
              isRunning={isRunning}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
            />
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