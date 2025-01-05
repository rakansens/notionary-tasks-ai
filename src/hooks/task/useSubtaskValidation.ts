import { Task } from "@/types/models";

interface ValidationResult {
  isValid: boolean;
  validTasks: Task[];
  debugInfo: {
    invalidReason?: string;
    taskId: number;
    taskLevel: number;
    parentId?: number;
    subtasksCount: number;
    validationDetails?: {
      hasValidParent: boolean;
      hasValidLevel: boolean;
      expectedLevel: number;
      actualLevel: number;
    };
  };
}

export const useSubtaskValidation = () => {
  const validateSubtasks = (
    task: Task,
    subtasks: Task[],
    isCollapsed?: boolean
  ): ValidationResult => {
    console.log('Starting subtask validation for task:', {
      taskId: task.id,
      taskTitle: task.title,
      taskLevel: task.level,
      parentId: task.parentId,
      subtasksCount: subtasks?.length || 0,
      isCollapsed
    });

    if (!subtasks || subtasks.length === 0) {
      console.log('No subtasks available for task:', task.id);
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          invalidReason: "No subtasks available",
          taskId: task.id,
          taskLevel: task.level,
          parentId: task.parentId,
          subtasksCount: 0
        }
      };
    }

    if (isCollapsed) {
      console.log('Task is collapsed:', task.id);
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          invalidReason: "Task is collapsed",
          taskId: task.id,
          taskLevel: task.level,
          parentId: task.parentId,
          subtasksCount: subtasks.length
        }
      };
    }

    const taskLevel = task.level || 1;
    const validTasks = subtasks.filter(subtask => {
      const hasValidParent = subtask.parentId === task.id;
      const expectedLevel = taskLevel + 1;
      const actualLevel = subtask.level || 1;
      const hasValidLevel = actualLevel === expectedLevel && actualLevel <= 3;

      console.log('Validating subtask:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        parentTaskId: task.id,
        hasValidParent,
        hasValidLevel,
        expectedLevel,
        actualLevel
      });

      return hasValidParent && hasValidLevel;
    });

    const validationResult = {
      isValid: validTasks.length > 0,
      validTasks,
      debugInfo: {
        taskId: task.id,
        taskLevel: task.level,
        parentId: task.parentId,
        subtasksCount: subtasks.length,
        validationDetails: {
          hasValidParent: validTasks.every(t => t.parentId === task.id),
          hasValidLevel: validTasks.every(t => t.level <= 3),
          expectedLevel: taskLevel + 1,
          actualLevel: validTasks[0]?.level || 0
        }
      }
    };

    console.log('Validation result:', validationResult);
    return validationResult;
  };

  return { validateSubtasks };
};