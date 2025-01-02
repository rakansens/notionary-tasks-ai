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

  const deleteGroupFromSupabase = async (id: number) => {
    try {
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