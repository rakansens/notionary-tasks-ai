import { useState, useCallback } from 'react';

export const useCollapsedState = () => {
  const [collapsedTasks, setCollapsedTasks] = useState<Set<number>>(new Set());

  const toggleCollapse = useCallback((taskId: number) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const isCollapsed = useCallback((taskId: number) => {
    return collapsedTasks.has(taskId);
  }, [collapsedTasks]);

  return {
    isCollapsed,
    toggleCollapse,
  };
};