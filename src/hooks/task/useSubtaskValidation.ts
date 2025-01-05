import { Task } from "@/types/models";

interface ValidationResult {
  isValid: boolean;
  validTasks: Task[];
  debugInfo: {
    parentTask: {
      id: number;
      title: string;
      level: number;
    };
    subtasksCount: number;
    validSubtasksCount: number;
    invalidReason?: string;
  };
}

export const useSubtaskValidation = () => {
  const validateSubtasks = (
    parentTask: Task,
    subtasks: Task[] | undefined,
    isCollapsed?: boolean
  ): ValidationResult => {
    if (!subtasks || subtasks.length === 0) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          parentTask: {
            id: parentTask.id,
            title: parentTask.title,
            level: parentTask.level || 1
          },
          subtasksCount: 0,
          validSubtasksCount: 0,
          invalidReason: "No subtasks found"
        }
      };
    }

    if (isCollapsed) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          parentTask: {
            id: parentTask.id,
            title: parentTask.title,
            level: parentTask.level || 1
          },
          subtasksCount: subtasks.length,
          validSubtasksCount: 0,
          invalidReason: "Parent task is collapsed"
        }
      };
    }

    const parentLevel = parentTask.level || 1;
    const validTasks = subtasks.filter(subtask => {
      const subtaskLevel = subtask.level || 1;
      const isValidLevel = subtaskLevel === parentLevel + 1;
      const hasValidParent = subtask.parentId === parentTask.id;

      console.log('Validating subtask:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        subtaskLevel,
        expectedLevel: parentLevel + 1,
        parentTaskId: parentTask.id,
        parentTaskTitle: parentTask.title,
        actualParentId: subtask.parentId,
        isValidLevel,
        hasValidParent,
        order: subtask.order
      });

      return isValidLevel && hasValidParent;
    });

    return {
      isValid: validTasks.length > 0,
      validTasks: validTasks.sort((a, b) => (a.order || 0) - (b.order || 0)),
      debugInfo: {
        parentTask: {
          id: parentTask.id,
          title: parentTask.title,
          level: parentLevel
        },
        subtasksCount: subtasks.length,
        validSubtasksCount: validTasks.length
      }
    };
  };

  return {
    validateSubtasks
  };
};