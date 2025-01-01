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
    const oldParentId = activeTask.parentId;
    
    // 元の親タスクからサブタスクを削除
    if (oldParentId) {
      const oldParent = updatedTasks.find(t => t.id === oldParentId);
      if (oldParent && oldParent.subtasks) {
        oldParent.subtasks = oldParent.subtasks.filter(t => t.id !== activeTask.id);
        oldParent.subtasks.forEach((task, index) => {
          task.order = index;
        });
      }
    }

    activeTask.groupId = newGroupId;
    activeTask.parentId = undefined;
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
    const oldParentId = activeTask.parentId;
    
    // 元の親タスクからサブタスクを削除
    if (oldParentId) {
      const oldParent = updatedTasks.find(t => t.id === oldParentId);
      if (oldParent && oldParent.subtasks) {
        oldParent.subtasks = oldParent.subtasks.filter(t => t.id !== activeTask.id);
        oldParent.subtasks.forEach((task, index) => {
          task.order = index;
        });
      }
    }

    // 新しい親タスクにサブタスクを追加
    if (targetParentId) {
      const newParent = updatedTasks.find(t => t.id === targetParentId);
      if (newParent) {
        if (!newParent.subtasks) {
          newParent.subtasks = [];
        }

        activeTask.parentId = newParent.id;
        activeTask.groupId = newParent.groupId;

        const insertIndex = newParent.subtasks.findIndex(t => t.id === overTaskId);
        if (insertIndex >= 0) {
          newParent.subtasks.splice(insertIndex, 0, activeTask);
        } else {
          newParent.subtasks.push(activeTask);
        }

        newParent.subtasks.forEach((task, index) => {
          task.order = index;
        });
      }
    } else {
      // サブタスクをルートレベルに移動
      activeTask.parentId = undefined;
      activeTask.groupId = overTask?.groupId;
      
      const tasksInSameArea = updatedTasks.filter(task => {
        if (overTask?.groupId) {
          return task.groupId === overTask.groupId && !task.parentId;
        }
        return !task.groupId && !task.parentId;
      }).sort((a, b) => a.order - b.order);

      const insertIndex = tasksInSameArea.findIndex(t => t.id === overTaskId);
      if (insertIndex >= 0) {
        tasksInSameArea.splice(insertIndex, 0, activeTask);
      } else {
        tasksInSameArea.push(activeTask);
      }

      tasksInSameArea.forEach((task, index) => {
        task.order = index;
      });
    }

    return updatedTasks;
  }

  // 同じエリア内での並び替え
  const tasksInSameArea = updatedTasks.filter(task => {
    if (overTask?.groupId) {
      return task.groupId === overTask.groupId && !task.parentId;
    }
    return !task.groupId && !task.parentId;
  }).sort((a, b) => a.order - b.order);

  const currentIndex = tasksInSameArea.findIndex(t => t.id === activeTaskId);
  if (currentIndex >= 0) {
    tasksInSameArea.splice(currentIndex, 1);
  }

  const targetIndex = tasksInSameArea.findIndex(t => t.id === overTaskId);
  if (targetIndex >= 0) {
    tasksInSameArea.splice(targetIndex, 0, activeTask);
  } else {
    tasksInSameArea.push(activeTask);
  }

  tasksInSameArea.forEach((task, index) => {
    task.order = index;
  });

  return updatedTasks;
};