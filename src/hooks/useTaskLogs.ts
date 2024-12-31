import { useState, useEffect } from "react";

interface TaskLog {
  id: number;
  timestamp: Date;
  eventType: "pomodoro_started" | "pomodoro_completed" | "task_completed";
  taskTitle?: string;
  pomodoroSessionId?: number;
}

export const useTaskLogs = () => {
  const [logs, setLogs] = useState<TaskLog[]>([]);

  useEffect(() => {
    const handlePomodoroStarted = () => {
      setLogs(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date(),
        eventType: "pomodoro_started"
      }]);
    };

    const handlePomodoroCompleted = () => {
      setLogs(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date(),
        eventType: "pomodoro_completed"
      }]);
    };

    const handleTaskCompleted = (event: CustomEvent) => {
      setLogs(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date(),
        eventType: "task_completed",
        taskTitle: event.detail.title,
        pomodoroSessionId: event.detail.pomodoroSessionId
      }]);
    };

    window.addEventListener('pomodoroStarted', handlePomodoroStarted);
    window.addEventListener('pomodoroCompleted', handlePomodoroCompleted);
    window.addEventListener('taskCompleted', handleTaskCompleted as EventListener);

    return () => {
      window.removeEventListener('pomodoroStarted', handlePomodoroStarted);
      window.removeEventListener('pomodoroCompleted', handlePomodoroCompleted);
      window.removeEventListener('taskCompleted', handleTaskCompleted as EventListener);
    };
  }, []);

  return { logs };
};