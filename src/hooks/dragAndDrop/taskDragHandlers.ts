import { Task } from "../taskManager/types";

export const handleTaskDragEnd = (
  tasks: Task[],
  activeTaskId: number,
  overTaskId: number,
  newGroupId?: number
): Task[] => {
  const updatedTasks = [...tasks];
  const activeTask = updatedTasks.find(task => task.id === activeTaskId);
  
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

    return updatedTasks;
  }

  const overTask = updatedTasks.find(task => task.id === overTaskId);
  
  if (!overTask && overTaskId !== -1) return tasks;

  // サブタスク間の移動処理
  if (overTask?.parentId || activeTask.parentId) {
    const targetParentId = overTask?.parentId;
    const parentTask = targetParentId 
      ? updatedTasks.find(t => t.id === targetParentId)
      : null;

    if (parentTask) {
      // 既存の親タスクからの削除
      if (activeTask.parentId) {
        const oldParent = updatedTasks.find(t => t.id === activeTask.parentId);
        if (oldParent && oldParent.subtasks) {
          oldParent.subtasks = oldParent.subtasks.filter(t => t.id !== activeTask.id);
          oldParent.subtasks.forEach((task, index) => {
            task.order = index;
          });
        }
      }

      // 新しい親タスクのsubtasksを初期化（必要な場合）
      if (!parentTask.subtasks) {
        parentTask.subtasks = [];
      }

      // activeTaskの親を更新
      activeTask.parentId = parentTask.id;
      activeTask.groupId = parentTask.groupId;

      // 新しい位置を特定
      const siblingTasks = parentTask.subtasks;
      const targetIndex = siblingTasks.findIndex(t => t.id === overTaskId);
      
      // 新しい位置に挿入
      if (targetIndex >= 0) {
        siblingTasks.splice(targetIndex, 0, activeTask);
      } else {
        siblingTasks.push(activeTask);
      }

      // サブタスクの順序を更新
      siblingTasks.forEach((task, index) => {
        task.order = index;
      });

      return updatedTasks;
    }
  }

  // グループ外へのドロップ処理
  if (overTaskId === -1) {
    if (activeTask.parentId) {
      const oldParent = updatedTasks.find(t => t.id === activeTask.parentId);
      if (oldParent && oldParent.subtasks) {
        oldParent.subtasks = oldParent.subtasks.filter(t => t.id !== activeTask.id);
        oldParent.subtasks.forEach((task, index) => {
          task.order = index;
        });
      }
    }
    
    activeTask.groupId = undefined;
    activeTask.parentId = undefined;
    activeTask.order = updatedTasks
      .filter(t => !t.groupId && !t.parentId)
      .length;

    return updatedTasks;
  }

  // 同じエリア内での並び替え
  const tasksInTargetArea = updatedTasks.filter(task => {
    if (overTask?.parentId) {
      return task.parentId === overTask.parentId;
    }
    if (overTask?.groupId) {
      return task.groupId === overTask.groupId && !task.parentId;
    }
    return !task.groupId && !task.parentId;
  }).sort((a, b) => a.order - b.order);

  const currentIndex = tasksInTargetArea.findIndex(t => t.id === activeTaskId);
  const targetIndex = tasksInTargetArea.findIndex(t => t.id === overTaskId);

  if (targetIndex >= 0) {
    // 現在の位置から削除
    if (activeTask.parentId) {
      const oldParent = updatedTasks.find(t => t.id === activeTask.parentId);
      if (oldParent && oldParent.subtasks) {
        oldParent.subtasks = oldParent.subtasks.filter(t => t.id !== activeTask.id);
      }
    }
    
    // グループIDと親IDを更新
    activeTask.groupId = overTask?.groupId;
    activeTask.parentId = overTask?.parentId;

    // 新しい位置に挿入
    const insertIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
    tasksInTargetArea.splice(insertIndex, 0, activeTask);

    // 順序を更新
    tasksInTargetArea.forEach((task, index) => {
      task.order = index;
    });

    // 更新されたタスクを親タスクに追加
    if (overTask?.parentId) {
      const parentTask = updatedTasks.find(t => t.id === overTask.parentId);
      if (parentTask) {
        parentTask.subtasks = tasksInTargetArea;
      }
    }
  }

  return updatedTasks;
};