import { Task } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  try {
    // タスクの順序をデータベースで更新
    const updates = tasks.map(task => ({
      title: task.title, // titleフィールドを追加
      order_position: task.order,
      group_id: task.groupId,
      parent_id: task.parentId,
      completed: task.completed, // completedフィールドも追加
      hierarchy_level: task.hierarchyLevel // hierarchy_levelも追加
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(updates, {
        onConflict: 'id'
      });

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