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

export const buildTaskHierarchy = (tasks: Task[]): Task[] => {
  const taskMap = new Map<number, Task>();
  const rootTasks: Task[] = [];

  // まず、すべてのタスクをマップに追加
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, subtasks: [] });
  });

  // 階層構造を構築
  tasks.forEach(task => {
    const currentTask = taskMap.get(task.id);
    if (currentTask) {
      if (task.parentId && taskMap.has(task.parentId)) {
        const parentTask = taskMap.get(task.parentId);
        if (parentTask && parentTask.subtasks) {
          parentTask.subtasks.push(currentTask);
          parentTask.subtasks.sort((a, b) => a.order - b.order);
        }
      } else {
        rootTasks.push(currentTask);
      }
    }
  });

  // ルートタスクを順序で並び替え
  return rootTasks.sort((a, b) => a.order - b.order);
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
): Task => {
  const hierarchyLevel = parentId ? 1 : 0;
  
  return {
    id: Date.now(),
    title,
    completed: false,
    order: order || 0,
    groupId,
    parentId,
    hierarchyLevel,
    addedAt: new Date(),
    subtasks: [],
  };
};

export const updateTaskTitle = (
  tasks: Task[],
  id: number,
  title: string,
  parentId?: number
): Task[] => {
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

export const deleteTask = (
  tasks: Task[],
  id: number,
  parentId?: number
): Task[] => {
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