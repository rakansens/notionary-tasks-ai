import { Task } from '@/types/models';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskCRUD = (
  tasks: Task[],
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
) => {
  const { toast } = useToast();

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    try {
      const trimmedTitle = title?.trim() || "新しいタスク";
      const maxOrder = Math.max(...tasks.map(t => t.order), 0);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            title: trimmedTitle,
            completed: false,
            order_position: maxOrder + 1,
            group_id: groupId,
            parent_id: parentId,
            level: parentId ? 2 : 1
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        completed: data.completed,
        order: data.order_position,
        groupId: data.group_id,
        parentId: data.parent_id,
        level: data.level,
        addedAt: new Date(data.created_at),
        subtasks: []
      };

      setTasks(prevTasks => [...prevTasks, newTask]);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの追加に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: number, parentId?: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの状態の更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const updateTaskTitle = async (id: number, title: string, parentId?: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === id ? { ...t, title } : t
        )
      );
    } catch (error) {
      console.error('Error updating task title:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクのタイトル更新に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: number, parentId?: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.filter(t => t.id !== id)
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "エラーが発生しました",
        description: "タスクの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return {
    addTask,
    toggleTask,
    updateTaskTitle,
    deleteTask,
  };
};