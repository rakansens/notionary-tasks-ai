import { supabase } from "@/integrations/supabase/client";
import { Task } from "./types";

export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  try {
    // 各タスクの順序を個別に更新
    const updatePromises = tasks.map(task => 
      supabase
        .from('tasks')
        .update({
          order_position: task.order,
          group_id: task.groupId,
          parent_id: task.parentId,
          hierarchy_level: task.hierarchyLevel
        })
        .eq('id', task.id)
    );

    // すべての更新を並行して実行
    const results = await Promise.all(updatePromises);
    
    // エラーチェック
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errors updating tasks:', errors);
      throw errors[0].error;
    }

    // フロントエンドの状態を更新
    setTasks(tasks);
    console.log('Task order updated successfully:', tasks);
  } catch (error) {
    console.error('Error updating task order:', error);
    throw error;
  }
};