import { Task } from "../../types/models";
import { useCallback, useMemo, useEffect, useRef } from "react";

export const useSubtaskRenderer = (
  task: Task,
  subtasks: Task[],
  isCollapsed: boolean,
  parentTask?: Task
) => {
  const prevStatus = useRef({
    hasValidSubtasks: false,
    isCollapsed: false
  });

  const validSubtasks = useMemo(() => {
    if (!subtasks || subtasks.length === 0 || isCollapsed) {
      return [];
    }

    return subtasks.filter(subtask => {
      const isValidParent = subtask.parentId === task.id;
      const expectedLevel = (task.level || 1) + 1;
      const actualLevel = subtask.level || 1;
      const isValidLevel = actualLevel === expectedLevel && actualLevel <= 3;
      return isValidParent && isValidLevel;
    });
  }, [task.id, task.level, subtasks, isCollapsed]);

  const hasValidSubtasks = validSubtasks.length > 0;
  const canRender = hasValidSubtasks && !isCollapsed;

  useEffect(() => {
    const shouldLog = !hasValidSubtasks || isCollapsed;
    if (shouldLog && (
      prevStatus.current.hasValidSubtasks !== hasValidSubtasks ||
      prevStatus.current.isCollapsed !== isCollapsed
    )) {
      console.log('Task render status:', {
        taskId: task.id,
        taskTitle: task.title,
        status: isCollapsed ? 'collapsed' : 'no valid subtasks',
        subtasksCount: subtasks?.length || 0,
        validSubtasksCount: validSubtasks.length
      });
      prevStatus.current = { hasValidSubtasks, isCollapsed };
    }
  }, [task.id, task.title, subtasks, hasValidSubtasks, isCollapsed, validSubtasks.length]);

  const canRenderSubtasks = useCallback(() => canRender, [canRender]);

  return { canRenderSubtasks };
};