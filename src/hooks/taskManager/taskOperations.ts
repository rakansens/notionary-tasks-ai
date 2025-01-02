import { Task } from './types';

export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
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
): Omit<Task, "id"> => ({
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
): Task[] => {
  return tasks.map(task => {
    if (task.id === id) {
      return { ...task, title };
    }
    if (task.subtasks) {
      return {
        ...task,
        subtasks: updateTaskTitle(task.subtasks, id, title, parentId),
      };
    }
    return task;
  });
};

export const deleteTask = async (
  tasks: Task[],
  id: number,
  parentId?: number
): Task[] => {
  if (parentId) {
    return tasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: task.subtasks?.filter(subtask => subtask.id !== id),
        };
      }
      if (task.subtasks) {
        return {
          ...task,
          subtasks: deleteTask(task.subtasks, id, parentId),
        };
      }
      return task;
    });
  }
  return tasks.filter(task => task.id !== id);
};