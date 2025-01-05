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
  };
}

export const useSubtaskValidation = () => {
  const validateSubtasks = (
    task: Task,
    subtasks: Task[],
    isCollapsed?: boolean
  ): ValidationResult => {
    console.log('Checking subtasks render condition:', {
      taskId: task.id,
      taskTitle: task.title,
      isCollapsed,
      subtasksCount: subtasks.length,
      taskLevel: task.level,
      parentTaskLevel: task.parentId,
      validation: {
        isValid: subtasks.length > 0,
        reason: subtasks.length === 0 ? "No subtasks available" : undefined
      },
      subtasks: subtasks
    });

    if (!subtasks || subtasks.length === 0) {
      console.log('No subtasks available');
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

    const validTasks = subtasks.filter(subtask => {
      const isValidLevel = subtask.level <= 3;
      if (!isValidLevel) {
        console.log('Invalid subtask level:', {
          taskId: subtask.id,
          level: subtask.level,
          parentId: subtask.parentId
        });
      }
      return isValidLevel;
    });

    return {
      isValid: validTasks.length > 0,
      validTasks,
      debugInfo: {
        taskId: task.id,
        taskLevel: task.level,
        parentId: task.parentId,
        subtasksCount: subtasks.length
      }
    };
  };

  return { validateSubtasks };
};