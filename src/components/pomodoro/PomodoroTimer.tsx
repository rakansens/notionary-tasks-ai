import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { TimerControls } from "./TimerControls";
import { TimerDisplay } from "./TimerDisplay";
import { TimerSettings, PRESET_TIMES, BREAK_TIMES } from "./TimerSettings";

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

  const handleBreakSelect = (minutes: number) => {
    setBreakMinutes(minutes);
    toast({
      title: "休憩時間を更新しました",
      description: `${minutes}分に設定しました。`,
    });
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
          <div>
            <TimerDisplay
              minutes={minutes}
              seconds={seconds}
              isRunning={isRunning}
              isBreak={isBreak}
              formatTime={formatTime}
              onTimeClick={handleTimeClick}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <TimerSettings
            onPresetSelect={updateTimer}
            onBreakSelect={handleBreakSelect}
            breakMinutes={breakMinutes}
          />
        </PopoverContent>
      </Popover>

      <TimerControls
        isRunning={isRunning}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
      />
    </div>
  );
};