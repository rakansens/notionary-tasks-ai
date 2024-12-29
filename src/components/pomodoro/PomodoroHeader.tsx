import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { PomodoroTimer } from "./PomodoroTimer";
import { PomodoroStats } from "./PomodoroStats";
import { CompletedTasks } from "./CompletedTasks";
import type { PomodoroSession, CompletedTask } from "@/types/pomodoro";

export const PomodoroHeader = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const { toast } = useToast();

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

  const handlePomodoroComplete = () => {
    setIsRunning(false);
    setPomodoroCount(prev => prev + 1);
    setTotalMinutes(prev => prev + 25);
    setMinutes(25);
    setSeconds(0);

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
      };
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
      setCurrentSession(null);
    }

    toast({
      title: "ポモドーロ完了！",
      description: "25分経過しました。休憩を取りましょう。",
    });
  };

  const toggleTimer = () => {
    if (!isRunning && minutes === 25 && seconds === 0) {
      const newSession: PomodoroSession = {
        id: Date.now(),
        name: `ポモドーロ #${pomodoroCount + 1}`,
        startTime: new Date(),
        completedTasks: [],
      };
      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
      setSessionName(newSession.name);
      
      toast({
        title: "タイマー開始",
        description: "25分のタイマーを開始しました。",
      });
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
      };
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
      setCurrentSession(null);
    }
    toast({
      title: "タイマーリセット",
      description: "タイマーをリセットしました。",
    });
  };

  const updateSessionName = () => {
    if (currentSession && sessionName.trim()) {
      const updatedSession = {
        ...currentSession,
        name: sessionName,
      };
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
      setIsEditingName(false);
    }
  };

  return (
    <div className="flex items-center gap-3 ml-auto relative">
      {currentSession && (
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onBlur={updateSessionName}
              onKeyPress={(e) => e.key === "Enter" && updateSessionName()}
              className="h-6 text-sm"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm">{currentSession.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-notion-hover"
                onClick={() => setIsEditingName(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      <PomodoroTimer
        minutes={minutes}
        seconds={seconds}
        isRunning={isRunning}
        pomodoroCount={pomodoroCount}
        totalMinutes={totalMinutes}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
      />

      <CompletedTasks sessions={sessions} />
      <PomodoroStats
        pomodoroCount={pomodoroCount}
        totalMinutes={totalMinutes}
        sessions={sessions}
      />
    </div>
  );
};