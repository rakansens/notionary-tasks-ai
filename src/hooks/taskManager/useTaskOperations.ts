import { Task } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskOperations = () => {
  const { toast } = useToast();

  const findTaskById = (tasks: Task[], id: number): Task | undefined => {
    for (const task of tasks) {
      if (task.id === id) return task;
      if (task.subtasks) {
        const found = findTaskById(task.subtasks, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const calculateTaskLevel = (parentTask?: Task | null): number => {
    return parentTask ? parentTask.level + 1 : 1;
  };

  const createNewTask = (
    title: string,
    groupId?: number,
    parentId?: number,
    order?: number,
    parentTask?: Task | null
  ): Task => {
    const level = calculateTaskLevel(parentTask);

    return {
      id: Date.now(),
      title,
      completed: false,
      groupId: groupId || null,
      parentId: parentId || null,
      order: order || 0,
      level,
      addedAt: new Date(),
      subtasks: [],
    };
  };

  const addTaskToSupabase = async (task: Omit<Task, "id" | "addedAt" | "subtasks">) => {
    try {
      console.log('Adding task to Supabase:', task);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          completed: task.completed,
          order_position: task.order,
          group_id: task.groupId,
          parent_id: task.parentId,
          level: task.level,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task added successfully:', data);
      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "エラー",
        description: "タスクの追加に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleTaskInSupabase = async (id: number, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "エラー",
        description: "タスクの状態の更新に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTaskTitleInSupabase = async (id: number, title: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task title:', error);
      toast({
        title: "エラー",
        description: "タスクのタイトル更新に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteChildTasksFromSupabase = async (parentId: number) => {
    try {
      const { data: childTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('parent_id', parentId);

      if (fetchError) throw fetchError;

      for (const childTask of childTasks || []) {
        await deleteChildTasksFromSupabase(childTask.id);
      }

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('parent_id', parentId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Error deleting child tasks:', error);
      throw error;
    }
  };

  const deleteTaskFromSupabase = async (id: number) => {
    try {
      await deleteChildTasksFromSupabase(id);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    findTaskById,
    createNewTask,
    addTaskToSupabase,
    toggleTaskInSupabase,
    updateTaskTitleInSupabase,
    deleteTaskFromSupabase,
  };
};

export const updateTaskOrder = async (tasks: Task[], setTasks: (tasks: Task[]) => void) => {
  try {
    for (const task of tasks) {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          order_position: task.order,
          level: task.level 
        })
        .eq('id', task.id);

      if (error) throw error;
    }
    
    setTasks(tasks);
  } catch (error) {
    console.error('Error updating task order:', error);
    throw error;
  }
};
