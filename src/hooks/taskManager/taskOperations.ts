import { Task } from './types';

export const addTaskToState = (tasks: Task[], newTask: Task, parentId?: number): Task[] => {
  if (!parentId) {
    return [...tasks, newTask];
  }

  return tasks.map(task => {
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

export const toggleTaskInState = (tasks: Task[], id: number, parentId?: number): Task[] => {
  if (parentId) {
    return tasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: task.subtasks?.map(subtask =>
            subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
          ),
        };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: toggleTaskInState(task.subtasks, id, parentId),
        };
      }
      return task;
    });
  }
  return tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
};

export const updateTaskTitleInState = (
  tasks: Task[],
  id: number,
  title: string,
  parentId?: number
): Task[] => {
  if (parentId) {
    return tasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: task.subtasks?.map(subtask =>
            subtask.id === id ? { ...subtask, title } : subtask
          ),
        };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: updateTaskTitleInState(task.subtasks, id, title, parentId),
        };
      }
      return task;
    });
  }
  return tasks.map(task => (task.id === id ? { ...task, title } : task));
};

export const updateTaskOrderInState = (tasks: Task[]): Task[] => {
  console.log('Initial tasks:', tasks);
  const updatedTasks = tasks.map(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: task.subtasks.map((subtask, index) => {
          if (subtask.subtasks && subtask.subtasks.length > 0) {
            return {
              ...subtask,
              subtasks: subtask.subtasks.map((grandchild, grandchildIndex) => ({
                ...grandchild,
                order: grandchildIndex,
              })),
            };
          }
          return {
            ...subtask,
            order: index,
          };
        }),
      };
    }
    return task;
  });
  console.log('Updated tasks:', updatedTasks);
  return updatedTasks;
};