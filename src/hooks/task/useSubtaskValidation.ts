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
    orderInfo?: {
      beforeSort: number[];
      afterSort: number[];
    };
  };
}

export const useSubtaskValidation = () => {
  const validateSubtasks = (
    parentTask: Task,
    subtasks: Task[] | undefined,
    isCollapsed?: boolean
  ): ValidationResult => {
    // 基本的なチェック
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
    const expectedSubtaskLevel = parentLevel + 1;

    // サブタスクの検証と順序の保持
    const ordersBefore = subtasks.map(t => t.order || 0);
    const validTasks = subtasks.filter(subtask => {
      const subtaskLevel = subtask.level || 1;
      const isValidLevel = subtaskLevel === expectedSubtaskLevel;
      const hasValidParent = subtask.parentId === parentTask.id;

      console.log('Validating subtask in detail:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        subtaskLevel,
        expectedLevel: expectedSubtaskLevel,
        parentTaskId: parentTask.id,
        parentTaskTitle: parentTask.title,
        actualParentId: subtask.parentId,
        isValidLevel,
        hasValidParent,
        order: subtask.order,
        parentLevel
      });

      return isValidLevel && hasValidParent;
    });

    // 順序の維持と更新
    const sortedTasks = [...validTasks].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });

    const ordersAfter = sortedTasks.map(t => t.order || 0);

    return {
      isValid: validTasks.length > 0,
      validTasks: sortedTasks,
      debugInfo: {
        parentTask: {
          id: parentTask.id,
          title: parentTask.title,
          level: parentLevel
        },
        subtasksCount: subtasks.length,
        validSubtasksCount: validTasks.length,
        orderInfo: {
          beforeSort: ordersBefore,
          afterSort: ordersAfter
        }
      }
    };
  };

  return {
    validateSubtasks
  };
};