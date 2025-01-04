import { Task } from '@/types/models';
import { useTaskCreation } from './useTaskCreation';
import { useTaskModification } from './useTaskModification';
import { useTaskDeletion } from './useTaskDeletion';

export const useTaskOperations = (
  tasks: Task[], 
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
) => {
  const taskCreation = useTaskCreation(tasks, setTasks);
  const taskModification = useTaskModification(tasks, setTasks);
  const taskDeletion = useTaskDeletion(tasks, setTasks);

  return {
    ...taskCreation,
    ...taskModification,
    ...taskDeletion,
  };
};