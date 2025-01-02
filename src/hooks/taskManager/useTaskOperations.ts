import { Task } from "./types";

export const useTaskOperations = () => {
  const findTaskById = (tasks: Task[], id: number): Task | undefined => {
    for (const task of tasks) {
      if (task.id === id) return task;
      if (task.subtasks) {
        const found = findTaskById(task.subtasks, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const createNewTask = (
    title: string,
    groupId?: number,
    parentId?: number,
    order?: number
  ): Task => ({
    id: Date.now(),
    title,
    completed: false,
    groupId,
    parentId,
    order: order || 0,
    addedAt: new Date(),
  });

  return {
    findTaskById,
    createNewTask,
  };
};