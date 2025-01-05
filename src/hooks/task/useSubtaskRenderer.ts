import { Task } from "@/types/models";
import { useCallback } from "react";
import { validateSubtasks } from "@/utils/taskUtils";

export const useSubtaskRenderer = (
  task: Task,
  subtasks: Task[],
  isCollapsed: boolean,
  parentTask?: Task
) => {
  const canRenderSubtasks = useCallback(() => {
    if (!subtasks || subtasks.length === 0) {
      console.log('No subtasks for task:', {
        taskId: task.id,
        taskTitle: task.title,
        subtasksCount: 0
      });
      return false;
    }

    if (isCollapsed) {
      console.log('Task is collapsed:', {
        taskId: task.id,
        taskTitle: task.title
      });
      return false;
    }

    const validation = validateSubtasks(task, isCollapsed);
    const validSubtasks = subtasks.filter(subtask => {
      const isValidParent = subtask.parentId === task.id;
      const expectedLevel = (task.level || 1) + 1;
      const actualLevel = subtask.level || 1;
      const isValidLevel = actualLevel === expectedLevel && actualLevel <= 3;

      console.log('Validating subtask:', {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        parentTaskId: task.id,
        isValidParent,
        isValidLevel,
        expectedLevel,
        actualLevel,
        parentTask: parentTask ? {
          id: parentTask.id,
          level: parentTask.level
        } : null
      });

      return isValidParent && isValidLevel;
    });

    console.log('Subtask validation result:', {
      taskId: task.id,
      taskTitle: task.title,
      validSubtasksCount: validSubtasks.length,
      totalSubtasksCount: subtasks.length,
      validation
    });

    return validSubtasks.length > 0;
  }, [task, subtasks, isCollapsed, parentTask]);

  return { canRenderSubtasks };
};