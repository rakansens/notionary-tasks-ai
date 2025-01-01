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

  // グループ外へのドロップ処理
  const overTask = updatedTasks.find(t => t.id === overTaskId);
  if (!overTask || overTaskId === -1) {
    const oldGroupId = activeTask.groupId;
    activeTask.groupId = undefined;
    activeTask.order = updatedTasks
      .filter(t => !t.groupId && !t.parentId)
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

  const tasksInTargetArea = updatedTasks.filter(task => {
    if (activeTask.groupId) {
      return task.groupId === activeTask.groupId && !task.parentId;
    }
    return !task.groupId && !task.parentId;
  }).sort((a, b) => a.order - b.order);

  const currentIndex = tasksInTargetArea.findIndex(t => t.id === activeTaskId);
  const targetIndex = tasksInTargetArea.findIndex(t => t.id === overTaskId);

  if (targetIndex >= 0) {
    if (currentIndex >= 0) {
      tasksInTargetArea.splice(currentIndex, 1);
    }
    const insertIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
    tasksInTargetArea.splice(insertIndex, 0, activeTask);

    tasksInTargetArea.forEach((task, index) => {
      task.order = index;
    });
  }

  return updatedTasks;
};