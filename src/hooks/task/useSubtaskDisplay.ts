import { Task } from "@/types/models";
import { useCallback } from "react";

interface UseSubtaskDisplayProps {
  task: Task;
  parentTask?: Task;
  subtasks: Task[];
  isCollapsed: boolean;
}

export const useSubtaskDisplay = ({
  task,
  parentTask,
  subtasks,
  isCollapsed,
}: UseSubtaskDisplayProps) => {
  const canRenderSubtasks = useCallback(() => {
    console.log('Checking subtasks for task:', {
      taskId: task.id,
      level: task.level,
      subtasksCount: subtasks.length,
      isCollapsed,
      parentTaskLevel: parentTask?.level
    });

    // 折りたたまれている場合は表示しない
    if (isCollapsed) {
      console.log('Task is collapsed, not rendering subtasks');
      return false;
    }

    // サブタスクが存在しない場合は表示しない
    if (!subtasks.length) {
      console.log('No subtasks found');
      return false;
    }

    // 親タスクが3階層目以上の場合はサブタスクを表示しない
    if (task.level >= 3) {
      console.log('Task level is too deep:', task.level);
      return false;
    }

    console.log('Can render subtasks:', true);
    return true;
  }, [task.level, subtasks.length, isCollapsed, task.id, parentTask?.level]);

  return {
    canRenderSubtasks,
  };
};