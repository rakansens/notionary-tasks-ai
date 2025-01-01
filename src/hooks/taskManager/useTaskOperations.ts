import { Task } from './types';

export const useTaskOperations = () => {
  const findTaskById = (tasks: Task[], targetId: number): Task | undefined => {
    for (const task of tasks) {
      if (task.id === targetId) {
        return task;
      }
      if (task.subtasks) {
        const found = findTaskById(task.subtasks, targetId);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  const createNewTask = (title: string, groupId?: number, parentId?: number, order?: number): Task => {
    return {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      groupId,
      parentId,
      subtasks: [],
      order: order ?? 0,
      addedAt: new Date(),
    };
  };

  return {
    findTaskById,
    createNewTask,
  };
};