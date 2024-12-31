import { Task } from './types';

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
  const toggleTask = (tasks: Task[]): Task[] => {
    return tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: toggleTask(task.subtasks),
        };
      }
      return task;
    });
  };

  return toggleTask(prevTasks);
};

export const updateTaskTitleInState = (
  prevTasks: Task[],
  id: number,
  title: string,
  parentId?: number
): Task[] => {
  return prevTasks.map(task => {
    // If this is the task we want to update
    if (task.id === id) {
      return { ...task, title };
    }

    // If this task has subtasks, recursively search them
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: updateTaskTitleInState(task.subtasks, id, title, parentId),
      };
    }

    // If this task has the same groupId as the task we're updating
    if (task.groupId && task.id === parentId) {
      return {
        ...task,
        subtasks: (task.subtasks || []).map(subtask =>
          subtask.id === id ? { ...subtask, title } : subtask
        ),
      };
    }

    return task;
  });
};

export const updateTaskOrderInState = (
  prevTasks: Task[],
  taskId: number,
  newGroupId?: number,
  newIndex?: number
): Task[] => {
  const updatedTasks = [...prevTasks];
  const oldIndex = updatedTasks.findIndex(t => t.id === taskId);
  if (oldIndex === -1) return prevTasks;

  const [removed] = updatedTasks.splice(oldIndex, 1);
  
  const updatedTask = {
    ...removed,
    groupId: newGroupId,
  };

  let targetIndex = typeof newIndex === 'number' ? newIndex : updatedTasks.length;
  updatedTasks.splice(targetIndex, 0, updatedTask);

  return updatedTasks;
};