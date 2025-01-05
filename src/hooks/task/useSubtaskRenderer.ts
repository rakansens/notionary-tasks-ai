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
    const validation = validateSubtasks(task, isCollapsed);
    
    console.log('Checking subtasks render condition:', {
      taskId: task.id,
      taskTitle: task.title,
      isCollapsed,
      subtasksCount: subtasks.length,
      taskLevel: task.level,
      parentTaskLevel: parentTask?.level,
      validation,
      subtasks: subtasks.map(st => ({
        id: st.id,
        title: st.title,
        level: st.level,
        parentId: st.parentId
      }))
    });

    if (!validation.isValid) {
      console.log(validation.reason);
      return false;
    }

    const validSubtasks = subtasks.filter(subtask => 
      subtask.parentId === task.id && 
      subtask.level === (task.level || 1) + 1
    );
    
    console.log('Validation complete:', {
      taskId: task.id,
      validSubtasksCount: validSubtasks.length,
      subtasksCount: subtasks.length,
      validationDetails: subtasks.map(st => ({
        id: st.id,
        title: st.title,
        level: st.level,
        parentId: st.parentId,
        isValid: st.parentId === task.id && st.level === (task.level || 1) + 1
      }))
    });

    return validSubtasks.length > 0;
  }, [task, subtasks, isCollapsed, parentTask]);

  return { canRenderSubtasks };
};