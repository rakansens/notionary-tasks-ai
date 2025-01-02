import { Task } from './types';

export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void): Promise<void> => {
  try {
    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    setTasks(updatedTasks);
  } catch (error) {
    console.error('Error updating task order:', error);
  }
};

export const findTaskById = (tasks: Task[], id: number): Task | undefined => {
  for (const task of tasks) {
    if (task.id === id) return task;
    if (task.subtasks) {
      const found = findTaskById(task.subtasks, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const createNewTask = (
  title: string,
  groupId?: number,
  parentId?: number,
  order?: number
): Task => ({
  id: Date.now(),
  title,
  completed: false,
  order: order || 0,
  groupId,
  parentId,
  addedAt: new Date(),
});

export const updateTaskTitle = async (
  tasks: Task[],
  id: number,
  title: string,
  parentId?: number
): Promise<Task[]> => {
  const updateTaskTitleRecursive = (tasks: Task[]): Task[] => {
    return tasks.map(task => {
      if (task.id === id) {
        return { ...task, title };
      }
      if (task.subtasks) {
        return {
          ...task,
          subtasks: updateTaskTitleRecursive(task.subtasks),
        };
      }
      return task;
    });
  };

  return updateTaskTitleRecursive(tasks);
};

export const deleteTask = async (
  tasks: Task[],
  id: number,
  parentId?: number
): Promise<Task[]> => {
  const deleteTaskRecursive = (tasks: Task[]): Task[] => {
    if (parentId) {
      return tasks.map(task => {
        if (task.id === parentId) {
          return {
            ...task,
            subtasks: task.subtasks?.filter(subtask => subtask.id !== id) || [],
          };
        }
        if (task.subtasks) {
          return {
            ...task,
            subtasks: deleteTaskRecursive(task.subtasks),
          };
        }
        return task;
      });
    }
    return tasks.filter(task => task.id !== id);
  };

  return deleteTaskRecursive(tasks);
};