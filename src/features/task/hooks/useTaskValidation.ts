import { TaskNode, TaskValidationResult } from '../types/taskTypes';
import { MAX_DEPTH } from '../utils/taskStructureUtils';

export const useTaskValidation = () => {
  const validateTaskCreation = (
    parentId: number | null,
    tasks: TaskNode[]
  ): TaskValidationResult => {
    if (!parentId) return { isValid: true };

    const parentTask = tasks.find(t => t.id === parentId);
    if (!parentTask) {
      return {
        isValid: false,
        error: '親タスクが見つかりません'
      };
    }

    if (parentTask.depth >= MAX_DEPTH) {
      return {
        isValid: false,
        error: `${MAX_DEPTH}階層以上のタスクは作成できません`
      };
    }

    return { isValid: true };
  };

  const validateTaskUpdate = (
    taskId: number,
    newParentId: number | null,
    tasks: TaskNode[]
  ): TaskValidationResult => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return {
        isValid: false,
        error: 'タスクが見つかりません'
      };
    }

    // Check for maximum depth
    if (newParentId) {
      const newParent = tasks.find(t => t.id === newParentId);
      if (newParent && newParent.depth + 1 > MAX_DEPTH) {
        return {
          isValid: false,
          error: `タスクは${MAX_DEPTH}階層までしか移動できません`
        };
      }
    }

    return { isValid: true };
  };

  return {
    validateTaskCreation,
    validateTaskUpdate
  };
};