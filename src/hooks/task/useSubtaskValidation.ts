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
    const parentLevel = parentTask.level || 1;
    const expectedSubtaskLevel = parentLevel + 1;

    console.log('Validating subtasks for parent:', {
      parentId: parentTask.id,
      parentTitle: parentTask.title,
      parentLevel,
      expectedSubtaskLevel,
      subtasksCount: subtasks?.length || 0,
      isCollapsed
    });

    // 基本的なチェック
    if (!subtasks || subtasks.length === 0) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          parentTask: {
            id: parentTask.id,
            title: parentTask.title,
            level: parentLevel
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
            level: parentLevel
          },
          subtasksCount: subtasks.length,
          validSubtasksCount: 0,
          invalidReason: "Parent task is collapsed"
        }
      };
    }

    // サブタスクの検証
    const validTasks = subtasks.filter(subtask => {
      const subtaskLevel = subtask.level || expectedSubtaskLevel;
      const hasValidParent = subtask.parentId === parentTask.id;
      const isValidLevel = subtaskLevel === expectedSubtaskLevel;

      console.log('Validating subtask:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        subtaskLevel,
        expectedLevel: expectedSubtaskLevel,
        hasValidParent,
        isValidLevel,
        order: subtask.order
      });

      return hasValidParent && isValidLevel;
    });

    // 順序の維持と更新
    const sortedTasks = [...validTasks].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });

    // 順序の正規化
    const normalizedTasks = sortedTasks.map((task, index) => ({
      ...task,
      order: index
    }));

    const ordersBefore = validTasks.map(t => t.order || 0);
    const ordersAfter = normalizedTasks.map(t => t.order);

    return {
      isValid: validTasks.length > 0,
      validTasks: normalizedTasks,
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