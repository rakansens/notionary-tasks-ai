import { useState, useEffect } from 'react';
import type { CompletedTask } from '@/types/pomodoro';

export const useTaskLogs = () => {
  const [logs, setLogs] = useState<CompletedTask[]>([]);

  useEffect(() => {
    // Load logs from localStorage on mount
    const savedLogs = localStorage.getItem('taskLogs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const addLog = (log: CompletedTask) => {
    const newLogs = [...logs, log];
    setLogs(newLogs);
    localStorage.setItem('taskLogs', JSON.stringify(newLogs));
  };

  return { logs, addLog };
};