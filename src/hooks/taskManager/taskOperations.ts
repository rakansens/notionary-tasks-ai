import { Task } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  try {
    // タスクの順序をデータベースで更新
    const updates = tasks.map(task => ({
      id: task.id,
      order_position: task.order,
      group_id: task.groupId,
      parent_id: task.parentId,
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(updates);

    if (error) throw error;

    // 状態を更新（サブタスクの構造を維持）
    setTasks(tasks);

    // データベースの更新が成功した後、フロントエンドの状態も更新
    console.log('Task order updated successfully:', tasks);
  } catch (error) {
    console.error('Error updating task order:', error);
    throw error;
  }
};