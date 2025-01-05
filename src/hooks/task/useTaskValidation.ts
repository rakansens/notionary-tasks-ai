import { TaskNode, TaskValidationResult } from "@/types/taskTypes";

export const useTaskValidation = () => {
  const validateTaskMove = (
    sourceTask: TaskNode,
    targetParentId: number | null,
    tasks: TaskNode[]
  ): TaskValidationResult => {
    // 最大深さのチェック
    if (targetParentId) {
      const targetParent = tasks.find(t => t.id === targetParentId);
      if (targetParent) {
        const newLevel = targetParent.level + 1;
        if (newLevel > 3) {
          return {
            isValid: false,
            error: `タスクは${3}階層までしか移動できません`
          };
        }
      }
    }

    // 循環参照のチェック
    const wouldCreateCycle = checkForCyclicDependency(
      sourceTask.id,
      targetParentId,
      tasks
    );
    if (wouldCreateCycle) {
      return {
        isValid: false,
        error: '循環参照は許可されていません'
      };
    }

    return { isValid: true };
  };

  const checkForCyclicDependency = (
    sourceId: number,
    targetParentId: number | null,
    tasks: TaskNode[]
  ): boolean => {
    if (!targetParentId) return false;
    if (sourceId === targetParentId) return true;

    const visited = new Set<number>();
    const checkCycle = (currentId: number): boolean => {
      if (visited.has(currentId)) return false;
      visited.add(currentId);

      const currentTask = tasks.find(t => t.id === currentId);
      if (!currentTask?.parentId) return false;

      return currentTask.parentId === sourceId || checkCycle(currentTask.parentId);
    };

    return checkCycle(targetParentId);
  };

  return {
    validateTaskMove,
  };
};