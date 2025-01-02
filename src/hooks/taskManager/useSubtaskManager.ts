import { Task } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useSubtaskManager = () => {
  const { toast } = useToast();

  const addSubtask = async (
    parentId: number,
    title: string,
    hierarchyLevel: number
  ) => {
    try {
      if (hierarchyLevel > 2) {
        toast({
          title: "エラー",
          description: "サブタスクは3階層までしか作成できません",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          parent_id: parentId,
          hierarchy_level: hierarchyLevel,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding subtask:', error);
      toast({
        title: "エラー",
        description: "サブタスクの追加に失敗しました",
        variant: "destructive",
      });
      return null;
    }
  };

  const getSubtasks = async (parentId: number) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_id', parentId)
        .order('order_position');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      return [];
    }
  };

  const updateSubtaskOrder = async (subtasks: Task[]) => {
    try {
      for (const [index, task] of subtasks.entries()) {
        const { error } = await supabase
          .from('tasks')
          .update({
            order_position: index,
            title: task.title,
            completed: task.completed,
            parent_id: task.parentId,
            hierarchy_level: task.hierarchyLevel
          })
          .eq('id', task.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating subtask order:', error);
      toast({
        title: "エラー",
        description: "サブタスクの並び順の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  return {
    addSubtask,
    getSubtasks,
    updateSubtaskOrder,
  };
};
