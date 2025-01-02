import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { PomodoroSession, CompletedTask } from "@/types/pomodoro";

export const useSessionManager = () => {
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const { toast } = useToast();

  const createNewSession = (pomodoroCount: number) => {
    const newSession: PomodoroSession = {
      id: Date.now(),
      name: `ポモドーロ #${pomodoroCount + 1}`,
      startTime: new Date(),
      completedTasks: [],
    };
    setCurrentSession(newSession);
    setSessions(prev => [...prev, newSession]);
    setSessionName(newSession.name);
  };

  const endCurrentSession = () => {
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

  return {
    currentSession,
    sessions,
    isEditingName,
    sessionName,
    setIsEditingName,
    setSessionName,
    createNewSession,
    endCurrentSession,
    updateSessionName,
    addCompletedTask
  };
};