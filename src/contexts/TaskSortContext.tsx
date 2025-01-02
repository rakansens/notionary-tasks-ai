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
    console.log('Reordering tasks:', { startIndex, endIndex, parentId });
    
    const targetTasks = parentId
      ? tasks.filter(task => task.parentId === parentId)
      : tasks.filter(task => !task.parentId && !task.groupId);

    const orderedTasks = [...targetTasks].sort((a, b) => a.order - b.order);
    const [movedTask] = orderedTasks.splice(startIndex, 1);
    orderedTasks.splice(endIndex, 0, movedTask);

    const updatedTasks = tasks.map(task => {
      if (parentId) {
        if (task.parentId === parentId) {
          const index = orderedTasks.findIndex(t => t.id === task.id);
          return index !== -1 ? { ...task, order: index } : task;
        }
      } else if (!task.parentId && !task.groupId) {
        const index = orderedTasks.findIndex(t => t.id === task.id);
        return index !== -1 ? { ...task, order: index } : task;
      }
      return task;
    });

    console.log('Updated tasks:', updatedTasks);
    updateTaskOrder(updatedTasks);
  }, [tasks, updateTaskOrder]);

  const reorderSubtasks = useCallback((startIndex: number, endIndex: number, parentId: number) => {
    reorderTasks(startIndex, endIndex, parentId);
  }, [reorderTasks]);

  return (
    <TaskSortContext.Provider value={{ reorderTasks, reorderSubtasks }}>
      {children}
    </TaskSortContext.Provider>
  );
};