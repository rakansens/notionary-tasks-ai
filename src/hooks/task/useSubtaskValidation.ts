import { Task } from "@/types/models";

interface ValidationResult {
  isValid: boolean;
  validTasks: Task[];
  debugInfo: {
    invalidReason?: string;
    parentTaskInfo?: {
      id: number;
      level: number;
    };
    validationChecks?: {
      hasSubtasks: boolean;
      isNotCollapsed: boolean;
      hasValidLevel: boolean;
    };
  };
}

export const useSubtaskValidation = () => {
  const validateSubtasks = (
    parentTask: Task,
    subtasks: Task[],
    isCollapsed?: boolean
  ): ValidationResult => {
    // 基本的な表示条件チェック
    if (isCollapsed) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          invalidReason: "Task is collapsed",
          parentTaskInfo: {
            id: parentTask.id,
            level: parentTask.level
          }
        }
      };
    }

    if (!subtasks || subtasks.length === 0) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          invalidReason: "No subtasks available",
          parentTaskInfo: {
            id: parentTask.id,
            level: parentTask.level
          }
        }
      };
    }

    // 親タスクのレベルチェック
    const parentLevel = parentTask.level || 1;
    if (parentLevel >= 3) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          invalidReason: "Parent task level is at maximum",
          parentTaskInfo: {
            id: parentTask.id,
            level: parentLevel
          }
        }
      };
    }

    // サブタスクの検証
    const validTasks = subtasks.filter(subtask => {
      // 親子関係の検証
      const hasValidParent = subtask.parentId === parentTask.id;
      if (!hasValidParent) {
        console.log('Invalid parent relationship:', {
          subtaskId: subtask.id,
          subtaskParentId: subtask.parentId,
          expectedParentId: parentTask.id
        });
        return false;
      }

      // レベルの検証
      const expectedLevel = parentLevel + 1;
      const subtaskLevel = subtask.level || 1;
      const hasValidLevel = subtaskLevel === expectedLevel && subtaskLevel <= 3;

      console.log('Subtask validation:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        hasValidParent,
        hasValidLevel,
        currentLevel: subtaskLevel,
        expectedLevel,
        parentLevel
      });

      return hasValidParent && hasValidLevel;
    });

    const isValid = validTasks.length > 0;
    console.log('Final validation result:', {
      parentTaskId: parentTask.id,
      parentLevel,
      validTasksCount: validTasks.length,
      isValid
    });

    return {
      isValid,
      validTasks,
      debugInfo: {
        parentTaskInfo: {
          id: parentTask.id,
          level: parentLevel
        },
        validationChecks: {
          hasSubtasks: subtasks.length > 0,
          isNotCollapsed: !isCollapsed,
          hasValidLevel: parentLevel < 3
        }
      }
    };
  };

  return { validateSubtasks };
};