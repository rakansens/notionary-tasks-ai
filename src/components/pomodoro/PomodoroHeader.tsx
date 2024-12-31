import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PomodoroTimer } from "./PomodoroTimer";
import { PomodoroStats } from "./PomodoroStats";
import { CompletedTasks } from "./CompletedTasks";
import { PomodoroSessionName } from "./PomodoroSessionName";
import { createLogEvent } from "@/utils/logEvents";
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
  const [isBreak, setIsBreak] = useState(false);
  const { toast } = useToast();

  const addCompletedTask = (task: CompletedTask) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        completedTasks: [...currentSession.completedTasks, task],
      };
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
    }
  };

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

    if (!isBreak) {
      setIsBreak(true);
      setMinutes(5);
      setSeconds(0);
      
      // Dispatch break started event
      window.dispatchEvent(new CustomEvent('taskAdded', {
        detail: createLogEvent('break_started', '休憩開始', '5分間の休憩を開始しました'),
        bubbles: true,
        composed: true
      }));

      toast({
        title: "ポモドーロ完了！",
        description: "5分間の休憩を始めましょう。",
      });
    } else {
      setIsBreak(false);
      setMinutes(25);
      setSeconds(0);

      // Dispatch break ended event
      window.dispatchEvent(new CustomEvent('taskAdded', {
        detail: createLogEvent('break_ended', '休憩終了', '次のポモドーロを始めましょう'),
        bubbles: true,
        composed: true
      }));

      toast({
        title: "休憩完了！",
        description: "次のポモドーロを始めましょう。",
      });
    }
  };

  const toggleTimer = () => {
    if (!isRunning && minutes === 25 && seconds === 0 && !isBreak) {
      const newSession: PomodoroSession = {
        id: Date.now(),
        name: `ポモドーロ #${pomodoroCount + 1}`,
        startTime: new Date(),
        completedTasks: [],
      };
      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
      setSessionName(newSession.name);

      // Dispatch pomodoro started event
      window.dispatchEvent(new CustomEvent('taskAdded', {
        detail: createLogEvent('pomodoro_started', 'ポモドーロ開始', '25分のタイマーを開始しました'),
        bubbles: true,
        composed: true
      }));
      
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

  useEffect(() => {
    const handleUpdateTimer = (event: CustomEvent<{ minutes: number }>) => {
      setMinutes(event.detail.minutes);
      setSeconds(0);
    };

    window.addEventListener('updateTimer', handleUpdateTimer as EventListener);
    
    return () => {
      window.removeEventListener('updateTimer', handleUpdateTimer as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleTaskCompleted = (event: CustomEvent<CompletedTask>) => {
      if (currentSession) {
        addCompletedTask(event.detail);
      }
    };

    window.addEventListener('taskCompleted', handleTaskCompleted as EventListener);
    
    return () => {
      window.removeEventListener('taskCompleted', handleTaskCompleted as EventListener);
    };
  }, [currentSession]);

  return (
    <div className="flex items-center gap-3 ml-auto relative">
      {currentSession && (
        <div className="flex items-center gap-2">
          <PomodoroSessionName
            currentSession={currentSession}
            isEditingName={isEditingName}
            sessionName={sessionName}
            setSessionName={setSessionName}
            setIsEditingName={setIsEditingName}
            updateSessionName={updateSessionName}
          />
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

      <CompletedTasks 
        sessions={sessions}
        currentSession={currentSession}
        onAddCompletedTask={addCompletedTask}
      />
      <PomodoroStats
        pomodoroCount={pomodoroCount}
        totalMinutes={totalMinutes}
        sessions={sessions}
      />
    </div>
  );
};