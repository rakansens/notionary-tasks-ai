import { Task } from './types';
import { supabase } from "@/integrations/supabase/client";

// シンプルな順序更新関数
export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void): Promise<void> => {
  try {
    // 1. まずローカルの状態を更新
    setTasks(tasks);

    // 2. 各タスクの順序を更新
    const promises = tasks.map(task => 
      supabase
        .from('tasks')
        .update({
          order_position: task.order,
          group_id: task.groupId
        })
        .eq('id', task.id)
    );

    // 3. 一括で更新を実行
    await Promise.all(promises);

  } catch (error) {
    console.error('Error updating task order:', error);
    // エラー時は元の状態を再取得
    await reloadTasks(setTasks);
  }
};

// データの再取得用関数
const reloadTasks = async (setTasks: (tasks: Task[]) => void): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('order_position');

    if (error) throw error;

    if (data) {
      const tasks = data.map(mapDatabaseTaskToTask);
      setTasks(tasks);
    }
  } catch (error) {
    console.error('Error reloading tasks:', error);
  }
};

// データベースのタスクを内部のタスク型に変換
const mapDatabaseTaskToTask = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  completed: dbTask.completed,
  order: dbTask.order_position,
  groupId: dbTask.group_id,
  parentId: dbTask.parent_id,
  hierarchyLevel: dbTask.hierarchy_level,
  addedAt: dbTask.created_at ? new Date(dbTask.created_at) : new Date(),
});

// タスクの検索
export const findTaskById = (tasks: Task[], id: number): Task | undefined => {
  return tasks.find(task => task.id === id);
};

// 新しいタスクの作成
export const createNewTask = (
  title: string,
  groupId?: number,
  parentId?: number,
  order?: number
): Omit<Task, "id"> => ({
  title,
  completed: false,
  order: order || 0,
  groupId,
  parentId,
  hierarchyLevel: parentId ? 1 : 0,
  addedAt: new Date(),
});

// タスクの削除
export const deleteTask = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};