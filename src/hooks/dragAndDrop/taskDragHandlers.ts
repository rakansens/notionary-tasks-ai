import { Task } from "../taskManager/types";

export const handleTaskDragEnd = (
  tasks: Task[],
  activeTaskId: number,
  overTaskId: number,
  newGroupId?: number
): Task[] => {
  const updatedTasks = [...tasks];
  const activeTask = updatedTasks.find(t => t.id === activeTaskId);
  
  if (!activeTask) return tasks;

  const tasksInTargetArea = updatedTasks.filter(task => {
    if (newGroupId) {
      return task.groupId === newGroupId && !task.parentId;
    }
    return !task.groupId && !task.parentId;
  }).sort((a, b) => a.order - b.order);

  const currentIndex = tasksInTargetArea.findIndex(t => t.id === activeTaskId);
  const targetIndex = tasksInTargetArea.findIndex(t => t.id === overTaskId);

  if (targetIndex >= 0) {
    // Remove from current position
    if (currentIndex >= 0) {
      tasksInTargetArea.splice(currentIndex, 1);
    }

    // Insert at new position
    const insertIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
    tasksInTargetArea.splice(insertIndex, 0, activeTask);

    // Update orders
    tasksInTargetArea.forEach((task, index) => {
      task.order = index;
    });

    // Update group
    activeTask.groupId = newGroupId;
  }

  return updatedTasks;
};