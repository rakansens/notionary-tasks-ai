import { Task } from "@/types/models";

interface ValidationResult {
  isValid: boolean;
  validTasks: Task[];
  debugInfo: {
    invalidReason?: string;
    taskId?: number;
    taskLevel?: number;
    parentId?: number | null;
    subtasksCount?: number;
  };
}

export const useSubtaskValidation = () => {
  const validateSubtasks = (
    parentTask: Task,
    subtasks: Task[],
    isCollapsed?: boolean
  ): ValidationResult => {
    // サブタスクが存在しない場合
    if (!subtasks || subtasks.length === 0) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          invalidReason: "No subtasks available",
          taskId: parentTask.id,
          taskLevel: parentTask.level,
          subtasksCount: 0
        }
      };
    }

    // 折りたたまれている場合
    if (isCollapsed) {
      return {
        isValid: false,
        validTasks: [],
        debugInfo: {
          invalidReason: "Task is collapsed",
          taskId: parentTask.id,
          taskLevel: parentTask.level,
          subtasksCount: subtasks.length
        }
      };
    }

    // レベルの検証
    const validTasks = subtasks.filter(subtask => {
      const expectedLevel = (parentTask.level || 1) + 1;
      return subtask.level === expectedLevel;
    });

    // 検証結果を返す
    return {
      isValid: validTasks.length > 0,
      validTasks: validTasks,
      debugInfo: {
        taskId: parentTask.id,
        taskLevel: parentTask.level,
        subtasksCount: subtasks.length,
        invalidReason: validTasks.length === 0 ? "No valid subtasks found" : undefined
      }
    };
  };

  return { validateSubtasks };
};