import { Task } from "../taskManager/types";

export const handleTaskDragEnd = (
  tasks: Task[],
  activeTaskId: number,
  overTaskId: number,
  newGroupId?: number
): Task[] => {
  const updatedTasks = [...tasks];
  const activeTask = findTaskDeep(updatedTasks, activeTaskId);
  
  if (!activeTask) return tasks;

  // グループへのドロップ処理
  if (newGroupId !== undefined) {
    const oldGroupId = activeTask.groupId;
    activeTask.groupId = newGroupId;
    activeTask.order = updatedTasks
      .filter(t => t.groupId === newGroupId && !t.parentId)
      .length;

    // 元のグループ内のタスクの順序を更新
    if (oldGroupId) {
      const tasksInOldGroup = updatedTasks
        .filter(t => t.groupId === oldGroupId && !t.parentId)
        .sort((a, b) => a.order - b.order);
      tasksInOldGroup.forEach((task, index) => {
        task.order = index;
      });
    }

    return removeTaskFromOldParent(updatedTasks, activeTaskId);
  }

  const overTask = findTaskDeep(updatedTasks, overTaskId);
  if (!overTask) return tasks;

  // サブタスク間の移動処理
  if (overTask.parentId || activeTask.parentId) {
    const parentTask = overTask.parentId 
      ? findTaskDeep(updatedTasks, overTask.parentId)
      : null;

    if (parentTask) {
      // 既存の親タスクから削除
      removeTaskFromOldParent(updatedTasks, activeTaskId);

      // 新しい親タスクに追加
      activeTask.parentId = parentTask.id;
      if (!parentTask.subtasks) parentTask.subtasks = [];
      
      const siblingTasks = parentTask.subtasks;
      const targetIndex = siblingTasks.findIndex(t => t.id === overTaskId);
      
      if (targetIndex >= 0) {
        siblingTasks.splice(targetIndex, 0, activeTask);
      } else {
        siblingTasks.push(activeTask);
      }

      // 順序を更新
      siblingTasks.forEach((task, index) => {
        task.order = index;
      });

      return updatedTasks;
    }
  }

  // グループ外へのドロップ処理
  if (overTaskId === -1) {
    removeTaskFromOldParent(updatedTasks, activeTaskId);
    activeTask.groupId = undefined;
    activeTask.parentId = undefined;
    activeTask.order = updatedTasks
      .filter(t => !t.groupId && !t.parentId)
      .length;

    return updatedTasks;
  }

  // 同じエリア内での並び替え
  const tasksInTargetArea = updatedTasks.filter(task => {
    if (overTask.groupId) {
      return task.groupId === overTask.groupId && !task.parentId;
    }
    return !task.groupId && !task.parentId;
  }).sort((a, b) => a.order - b.order);

  const currentIndex = tasksInTargetArea.findIndex(t => t.id === activeTaskId);
  const targetIndex = tasksInTargetArea.findIndex(t => t.id === overTaskId);

  if (targetIndex >= 0) {
    // 現在の位置から削除
    removeTaskFromOldParent(updatedTasks, activeTaskId);
    if (currentIndex >= 0) {
      tasksInTargetArea.splice(currentIndex, 1);
    }

    // 新しい位置に挿入
    const insertIndex = currentIndex < targetIndex ? targetIndex : targetIndex;
    tasksInTargetArea.splice(insertIndex, 0, activeTask);

    // グループIDを更新
    activeTask.groupId = overTask.groupId;
    activeTask.parentId = undefined;

    // 順序を更新
    tasksInTargetArea.forEach((task, index) => {
      task.order = index;
    });
  }

  return updatedTasks;
};

// 再帰的にタスクを検索する補助関数
const findTaskDeep = (tasks: Task[], taskId: number): Task | null => {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.subtasks && task.subtasks.length > 0) {
      const found = findTaskDeep(task.subtasks, taskId);
      if (found) return found;
    }
  }
  return null;
};

// タスクを古い親から削除する補助関数
const removeTaskFromOldParent = (tasks: Task[], taskId: number): Task[] => {
  return tasks.map(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      return {
        ...task,
        subtasks: task.subtasks.filter(subtask => {
          if (subtask.id === taskId) return false;
          if (subtask.subtasks && subtask.subtasks.length > 0) {
            subtask.subtasks = removeTaskFromOldParent([subtask], taskId)[0].subtasks;
          }
          return true;
        }),
      };
    }
    return task;
  });
};