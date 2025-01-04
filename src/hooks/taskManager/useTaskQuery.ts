import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { mapSupabaseTaskToTask } from "./mappers";

export const useTaskQuery = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // タスクの取得
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order_position');

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "エラー",
          description: "タスクの取得に失敗しました",
          variant: "destructive",
        });
        throw error;
      }

      return data.map(mapSupabaseTaskToTask);
    },
  });

  // タスクの更新
  const { mutate: updateTask } = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      // キャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast({
        title: "エラー",
        description: "タスクの更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    isLoading,
    updateTask,
  };
};