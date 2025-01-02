import { useState } from 'react';

export const useTaskCollapse = () => {
  const [collapsedTasks, setCollapsedTasks] = useState<Set<number>>(new Set());

  const toggleTaskCollapse = (taskId: number) => {
    setCollapsedTasks(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(taskId)) {
        newCollapsed.delete(taskId);
      } else {
        newCollapsed.add(taskId);
      }
      return newCollapsed;
    });
  };

  const isTaskCollapsed = (taskId: number) => {
    return collapsedTasks.has(taskId);
  };

  return {
    collapsedTasks,
    toggleTaskCollapse,
    isTaskCollapsed,
  };
};