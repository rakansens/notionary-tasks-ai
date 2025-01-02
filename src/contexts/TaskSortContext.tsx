import { createContext, useContext, useCallback } from 'react';
import { Task } from '@/hooks/taskManager/types';

interface TaskSortContextType {
  reorderTasks: (startIndex: number, endIndex: number, parentId?: number) => void;
  reorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
}

const TaskSortContext = createContext<TaskSortContextType | undefined>(undefined);

export const useTaskSort = () => {
  const context = useContext(TaskSortContext);
  if (!context) {
    throw new Error('useTaskSort must be used within a TaskSortProvider');
  }
  return context;
};

interface TaskSortProviderProps {
  children: React.ReactNode;
  updateTaskOrder: (tasks: Task[]) => void;
  tasks: Task[];
}

export const TaskSortProvider = ({ children, updateTaskOrder, tasks }: TaskSortProviderProps) => {
  const reorderTasks = useCallback((startIndex: number, endIndex: number, parentId?: number) => {
    const targetTasks = tasks.filter(task => 
      parentId ? task.parentId === parentId : !task.parentId
    ).sort((a, b) => a.order - b.order);

    const [movedTask] = targetTasks.splice(startIndex, 1);
    targetTasks.splice(endIndex, 0, movedTask);

    const updatedTasks = tasks.map(task => {
      const index = targetTasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        return { ...task, order: index };
      }
      return task;
    });

    updateTaskOrder(updatedTasks);
  }, [tasks, updateTaskOrder]);

  const reorderSubtasks = useCallback((startIndex: number, endIndex: number, parentId: number) => {
    const parent = tasks.find(t => t.id === parentId);
    if (!parent || !parent.subtasks) return;

    const updatedSubtasks = [...parent.subtasks];
    const [movedTask] = updatedSubtasks.splice(startIndex, 1);
    updatedSubtasks.splice(endIndex, 0, movedTask);

    const updatedTasks = tasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: updatedSubtasks.map((subtask, index) => ({
            ...subtask,
            order: index,
          })),
        };
      }
      return task;
    });

    updateTaskOrder(updatedTasks);
  }, [tasks, updateTaskOrder]);

  return (
    <TaskSortContext.Provider value={{ reorderTasks, reorderSubtasks }}>
      {children}
    </TaskSortContext.Provider>
  );
};