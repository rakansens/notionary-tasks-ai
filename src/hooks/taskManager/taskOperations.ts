import { Task } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  try {
    // 各タスクの順序を個別に更新
    for (const task of tasks) {
      const { error } = await supabase
        .from('tasks')
        .update({
          order_position: task.order,
          group_id: task.groupId,
          parent_id: task.parentId,
          hierarchy_level: task.hierarchyLevel
        })
        .eq('id', task.id);

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    }

    // フロントエンドの状態を更新
    setTasks(tasks);
    console.log('Task order updated successfully:', tasks);
  } catch (error) {
    console.error('Error updating task order:', error);
    throw error;
  }
};