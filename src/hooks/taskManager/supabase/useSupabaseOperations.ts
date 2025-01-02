import { supabase } from "@/integrations/supabase/client";
import { Task, Group } from '../types';
import { toast } from "@/components/ui/use-toast";

export const useSupabaseOperations = () => {
  const updateTaskOrderInSupabase = async (tasks: Task[]) => {
    try {
      for (const task of tasks) {
        const { error } = await supabase
          .from('tasks')
          .update({ order_position: task.order })
          .eq('id', task.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating task order:', error);
      toast({
        title: "エラー",
        description: "タスクの順序の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const updateGroupOrderInSupabase = async (groups: Group[]) => {
    try {
      for (const group of groups) {
        const { error } = await supabase
          .from('groups')
          .update({ order_position: group.order })
          .eq('id', group.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating group order:', error);
      toast({
        title: "エラー",
        description: "グループの順序の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  return {
    updateTaskOrderInSupabase,
    updateGroupOrderInSupabase,
  };
};