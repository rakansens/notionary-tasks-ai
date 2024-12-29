import { Task } from './types';

const findTaskAndUpdate = (
  tasks: Task[],
  taskId: number,
  updateFn: (task: Task) => Task
): Task[] => {
  return tasks.map(task => {
    if (task.id === taskId) {
      return updateFn(task);
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: findTaskAndUpdate(task.subtasks, taskId, updateFn),
      };
    }
    return task;
  });
};

export const addTaskToState = (
  prevTasks: Task[],
  newTask: Task,
  parentId?: number
): Task[] => {
  if (!parentId) {
    return [...prevTasks, newTask];
  }

  return prevTasks.map(task => {
    if (task.id === parentId) {
      return {
        ...task,
        subtasks: [...(task.subtasks || []), newTask],
      };
    }
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: addTaskToState(task.subtasks, newTask, parentId),
      };
    }
    return task;
  });
};

export const toggleTaskInState = (
  prevTasks: Task[],
  id: number,
  parentId?: number
): Task[] => {
  return findTaskAndUpdate(prevTasks, id, task => ({
    ...task,
    completed: !task.completed,
  }));
};

export const updateTaskTitleInState = (
  prevTasks: Task[],
  id: number,
  title: string,
  parentId?: number
): Task[] => {
  return findTaskAndUpdate(prevTasks, id, task => ({
    ...task,
    title,
  }));
};