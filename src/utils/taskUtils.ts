import { Task } from "@/types/models";

export const normalizeTaskData = (task: Task): Task => {
  return {
    ...task,
    groupId: task.groupId ?? null,
    parentId: task.parentId ?? null,
    level: task.level || 1,
    order: task.order || 0,
    subtasks: task.subtasks || []
  };
};

export const calculateTaskLevel = (task: Task, parentTask: Task | null): number => {
  if (!parentTask) return 1;
  return Math.min((parentTask.level || 1) + 1, 3);
};

export const validateSubtasks = (
  task: Task,
  isCollapsed: boolean
): { isValid: boolean; reason?: string } => {
  if (!task) {
    return { isValid: false, reason: "Invalid task" };
  }

  if (isCollapsed) {
    return { isValid: false, reason: "Task is collapsed" };
  }

  if (!task.subtasks || task.subtasks.length === 0) {
    return { isValid: false, reason: "No subtasks available" };
  }

  const currentLevel = task.level || 1;
  if (currentLevel >= 3) {
    return { isValid: false, reason: "Maximum level reached" };
  }

  const hasValidSubtasks = task.subtasks.some(subtask => {
    const subtaskLevel = subtask.level || 1;
    return subtask.parentId === task.id && subtaskLevel === currentLevel + 1;
  });

  if (!hasValidSubtasks) {
    return { isValid: false, reason: "No valid subtasks found" };
  }

  return { isValid: true };
};