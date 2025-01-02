import { Group } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useGroupOperations = () => {
  const { toast } = useToast();

  const addGroupToSupabase = async (group: Omit<Group, "id">) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([group])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "エラー",
        description: "グループの追加に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGroupNameInSupabase = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating group name:', error);
      toast({
        title: "エラー",
        description: "グループ名の更新に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteGroupTasksFromSupabase = async (groupId: number) => {
    try {
      // まず、このグループに属する全てのタスクを取得
      const { data: groupTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('group_id', groupId);

      if (fetchError) throw fetchError;

      // 各タスクに対して、子タスクも含めて削除
      for (const task of groupTasks || []) {
        // 子タスクを再帰的に削除
        const { error: deleteChildError } = await supabase
          .from('tasks')
          .delete()
          .eq('parent_id', task.id);

        if (deleteChildError) throw deleteChildError;

        // 親タスクを削除
        const { error: deleteTaskError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', task.id);

        if (deleteTaskError) throw deleteTaskError;
      }
    } catch (error) {
      console.error('Error deleting group tasks:', error);
      throw error;
    }
  };

  const deleteGroupFromSupabase = async (id: number) => {
    try {
      // まず、グループに属する全てのタスクを削除
      await deleteGroupTasksFromSupabase(id);

      // その後、グループ自体を削除
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "エラー",
        description: "グループの削除に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    addGroupToSupabase,
    updateGroupNameInSupabase,
    deleteGroupFromSupabase,
  };
};