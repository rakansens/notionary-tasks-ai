import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { PomodoroSession } from "@/types/pomodoro";

export const usePomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const { toast } = useToast();

  const handlePomodoroComplete = () => {
    setIsRunning(false);
    setPomodoroCount(prev => prev + 1);
    setTotalMinutes(prev => prev + 25);
    setMinutes(25);
    setSeconds(0);

    if (!isBreak) {
      setIsBreak(true);
      setMinutes(5);
      setSeconds(0);
      toast({
        title: "ポモドーロ完了！",
        description: "5分間の休憩を始めましょう。",
      });
    } else {
      setIsBreak(false);
      setMinutes(25);
      setSeconds(0);
      toast({
        title: "休憩完了！",
        description: "次のポモドーロを始めましょう。",
      });
    }

    return null;
  };

  const toggleTimer = (currentSession: PomodoroSession | null, createNewSession: () => void) => {
    if (!isRunning && minutes === 25 && seconds === 0 && !isBreak) {
      createNewSession();
      toast({
        title: "タイマー開始",
        description: "25分のタイマーを開始しました。",
      });
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (isBreak) {
      setMinutes(5);
    } else {
      setMinutes(25);
    }
    setSeconds(0);
    toast({
      title: "タイマーリセット",
      description: "タイマーをリセットしました。",
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handlePomodoroComplete();
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds]);

  return {
    minutes,
    seconds,
    isRunning,
    pomodoroCount,
    totalMinutes,
    isBreak,
    setMinutes,
    setSeconds,
    toggleTimer,
    resetTimer,
    handlePomodoroComplete
  };
};