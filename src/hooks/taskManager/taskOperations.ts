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

export const updateTaskOrderInState = (tasks: Task[], taskId: number, newGroupId?: number, newIndex?: number): Task[] => {
  const updatedTasks = [...tasks];
  const taskToMove = updatedTasks.find(t => t.id === taskId);
  
  if (!taskToMove) return tasks;

  // タスクを現在の位置から削除
  const filteredTasks = updatedTasks.filter(t => t.id !== taskId);

  // 新しい位置を計算
  const targetTasks = filteredTasks.filter(t => {
    if (newGroupId) {
      return t.groupId === newGroupId && !t.parentId;
    } else {
      return !t.groupId && !t.parentId;
    }
  });

  // タスクのグループIDを更新
  taskToMove.groupId = newGroupId;

  // 新しい位置にタスクを挿入
  if (typeof newIndex === 'number') {
    targetTasks.splice(newIndex, 0, taskToMove);
    
    // 順序を更新
    targetTasks.forEach((task, index) => {
      task.order = index;
    });

    // 更新されたタスクを元の配列に統合
    return [
      ...filteredTasks.filter(t => {
        if (newGroupId) {
          return t.groupId !== newGroupId || t.parentId;
        } else {
          return t.groupId || t.parentId;
        }
      }),
      ...targetTasks,
    ];
  } else {
    // インデックスが指定されていない場合は最後に追加
    return [...filteredTasks, { ...taskToMove, order: filteredTasks.length }];
  }
};