import { Task } from "../taskManager/types";

export const handleTaskDragEnd = (
  tasks: Task[],
  activeTaskId: number,
  overTaskId: number,
  newGroupId?: number
): Task[] => {
  const updatedTasks = [...tasks];
  
  // まずルートレベルで検索
  let activeTask = updatedTasks.find(task => task.id === activeTaskId);
  
  // ルートレベルで見つからない場合は再帰的に検索
  if (!activeTask) {
    activeTask = findTaskDeep(updatedTasks, activeTaskId);
  }
  
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

  // まずルートレベルで検索
  let overTask = updatedTasks.find(task => task.id === overTaskId);
  
  // ルートレベルで見つからない場合は再帰的に検索
  if (!overTask && overTaskId !== -1) {
    overTask = findTaskDeep(updatedTasks, overTaskId);
  }
  
  if (!overTask && overTaskId !== -1) return tasks;

  // サブタスク間の移動処理
  if (overTask && (overTask.parentId || activeTask.parentId)) {
    const targetParentId = overTask.parentId;
    const parentTask = targetParentId 
      ? findTaskDeep(updatedTasks, targetParentId)
      : null;

    if (parentTask) {
      // 既存の親タスクから削除
      const updatedTasksWithoutActive = removeTaskFromOldParent(updatedTasks, activeTaskId);
      
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

      return updatedTasksWithoutActive;
    }

    return updatedTasks;
  }

  // グループ外へのドロップ処理
  if (overTaskId === -1) {
    const updatedTasksWithoutActive = removeTaskFromOldParent(updatedTasks, activeTaskId);
    activeTask.groupId = undefined;
    activeTask.parentId = undefined;
    activeTask.order = updatedTasksWithoutActive
      .filter(t => !t.groupId && !t.parentId)
      .length;

    return [...updatedTasksWithoutActive, activeTask];
  }

  // 同じエリア内での並び替え
  const tasksInTargetArea = updatedTasks.filter(task => {
    if (overTask?.groupId) {
      return task.groupId === overTask.groupId && !task.parentId;
    }
    return !task.groupId && !task.parentId;
  }).sort((a, b) => a.order - b.order);

  const currentIndex = tasksInTargetArea.findIndex(t => t.id === activeTaskId);
  const targetIndex = tasksInTargetArea.findIndex(t => t.id === overTaskId);

  if (targetIndex >= 0) {
    // 現在の位置から削除
    const updatedTasksWithoutActive = removeTaskFromOldParent(updatedTasks, activeTaskId);
    
    // グループIDを更新
    activeTask.groupId = overTask?.groupId;
    activeTask.parentId = undefined;

    // 新しい位置に挿入
    const insertIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
    const tasksInSameArea = updatedTasksWithoutActive.filter(task => {
      if (overTask?.groupId) {
        return task.groupId === overTask.groupId && !task.parentId;
      }
      return !task.groupId && !task.parentId;
    }).sort((a, b) => a.order - b.order);

    tasksInSameArea.splice(insertIndex, 0, activeTask);

    // 順序を更新
    tasksInSameArea.forEach((task, index) => {
      task.order = index;
    });

    // 更新されたタスクを元の配列に統合
    return [
      ...updatedTasksWithoutActive.filter(task => {
        if (overTask?.groupId) {
          return task.groupId !== overTask.groupId || task.parentId;
        }
        return task.groupId || task.parentId;
      }),
      ...tasksInSameArea,
    ];
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
      const filteredSubtasks = task.subtasks.filter(subtask => {
        if (subtask.id === taskId) return false;
        if (subtask.subtasks && subtask.subtasks.length > 0) {
          subtask.subtasks = removeTaskFromOldParent([subtask], taskId)[0].subtasks;
        }
        return true;
      });

      // サブタスクの順序を更新
      filteredSubtasks.forEach((subtask, index) => {
        subtask.order = index;
      });

      return {
        ...task,
        subtasks: filteredSubtasks,
      };
    }
    return task;
  }).filter(task => task.id !== taskId);
};