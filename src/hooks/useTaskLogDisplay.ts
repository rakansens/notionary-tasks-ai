import { useState, useEffect } from "react";
import type { PomodoroSession } from "@/types/pomodoro";

export const useTaskLogDisplay = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);

  useEffect(() => {
    // Here we would normally fetch the sessions from an API or local storage
    // For now, we'll just use mock data
    setSessions([]);
  }, []);

  return {
    sessions,
  };
};