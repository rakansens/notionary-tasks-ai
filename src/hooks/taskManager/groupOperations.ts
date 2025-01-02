import { Group, Task } from './types';
import { supabase } from "@/integrations/supabase/client";

// グループの追加
export const addGroupToSupabase = async (group: Omit<Group, "id">): Promise<Group> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: group.name,
        order_position: group.order
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return {
      id: data.id,
      name: data.name,
      order: data.order_position
    };
  } catch (error) {
    console.error('Error adding group:', error);
    throw error;
  }
};

// グループの更新
export const updateGroupOrder = async (groups: Group[], setGroups: (groups: Group[]) => void) => {
  try {
    // 1. まずローカルの状態を更新
    setGroups(groups);

    // 2. 各グループの順序を更新
    const promises = groups.map(group =>
      supabase
        .from('groups')
        .update({ order_position: group.order })
        .eq('id', group.id)
    );

    // 3. 一括で更新を実行
    await Promise.all(promises);
  } catch (error) {
    console.error('Error updating group order:', error);
    await reloadGroups(setGroups);
  }
};

// グループ名の更新
export const updateGroupName = async (id: number, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating group name:', error);
    throw error;
  }
};

// グループの削除（関連するタスクも削除）
export const deleteGroup = async (id: number): Promise<void> => {
  try {
    // 1. グループに属するタスクを削除
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('group_id', id);

    if (tasksError) throw tasksError;

    // 2. グループを削除
    const { error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (groupError) throw groupError;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// データの再取得
const reloadGroups = async (setGroups: (groups: Group[]) => void): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('order_position');

    if (error) throw error;

    if (data) {
      const groups = data.map(group => ({
        id: group.id,
        name: group.name,
        order: group.order_position
      }));
      setGroups(groups);
    }
  } catch (error) {
    console.error('Error reloading groups:', error);
  }
};