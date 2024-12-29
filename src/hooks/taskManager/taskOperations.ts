import { Task } from './types';

export const addTaskToState = (
  prevTasks: Task[],
  newTask: Task,
  parentId?: number
): Task[] => {
  if (parentId) {
    return prevTasks.map(t => 
      t.id === parentId 
        ? { ...t, subtasks: [...(t.subtasks || []), newTask] }
        : t
    );
  }
  return [...prevTasks, newTask];
};

export const toggleTaskInState = (
  prevTasks: Task[],
  id: number,
  parentId?: number
): Task[] => {
  if (parentId) {
    return prevTasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: task.subtasks?.map(subtask =>
            subtask.id === id
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          ),
        };
      }
      return task;
    });
  }
  return prevTasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
};

export const updateTaskTitleInState = (
  prevTasks: Task[],
  id: number,
  title: string,
  parentId?: number
): Task[] => {
  if (parentId) {
    return prevTasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: task.subtasks?.map(subtask =>
            subtask.id === id ? { ...subtask, title } : subtask
          ),
        };
      }
      return task;
    });
  }
  return prevTasks.map(task =>
    task.id === id ? { ...task, title } : task
  );
};

export const updateTaskOrderInState = (
  prevTasks: Task[],
  taskId: number,
  newGroupId?: number,
  newIndex?: number
): Task[] => {
  const taskToMove = prevTasks.find(t => t.id === taskId);
  if (!taskToMove) return prevTasks;

  const remainingTasks = prevTasks.filter(t => t.id !== taskId);
  
  const updatedTask = {
    ...taskToMove,
    groupId: newGroupId ?? taskToMove.groupId,
  };

  if (typeof newIndex === 'number') {
    const tasksInTargetGroup = remainingTasks.filter(t => t.groupId === newGroupId);
    const beforeTasks = tasksInTargetGroup.slice(0, newIndex);
    const afterTasks = tasksInTargetGroup.slice(newIndex);
    
    return [
      ...remainingTasks.filter(t => t.groupId !== newGroupId),
      ...beforeTasks,
      updatedTask,
      ...afterTasks,
    ];
  }

  return [...remainingTasks, updatedTask];
};