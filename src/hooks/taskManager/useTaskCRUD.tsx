import { Task } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskCRUD = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setEditingTaskId: (id: number | null) => void,
) => {
  const { toast } = useToast();

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    try {
      const { data: savedTask, error } = await supabase
        .from('tasks')
        .insert({
          title: title || '',
          completed: false,
          order_position: tasks.length,
          group_id: groupId || null,
          parent_id: parentId || null,
          hierarchy_level: parentId ? 1 : 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        toast({
          title: "エラー",
          description: "タスクの追加に失敗しました",
          variant: "destructive",
        });
        return;
      }

      const taskWithId: Task = {
        id: savedTask.id,
        title: savedTask.title,
        completed: savedTask.completed,
        order: savedTask.order_position,
        groupId: savedTask.group_id,
        parentId: savedTask.parent_id,
        hierarchyLevel: savedTask.hierarchy_level,
        addedAt: new Date(savedTask.created_at),
      };

      setTasks(prevTasks => [...prevTasks, taskWithId]);
      
      if (groupId) {
        setEditingTaskId(savedTask.id);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "エラー",
        description: "タスクの追加に失敗しました",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: number) => {
    try {
      const taskToToggle = tasks.find(t => t.id === id);
      if (!taskToToggle) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !taskToToggle.completed })
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "エラー",
        description: "タスクの状態の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const updateTaskTitle = async (id: number, title: string) => {
    if (!title.trim()) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, title } : task
        )
      );
      setEditingTaskId(null);
    } catch (error) {
      console.error('Error updating task title:', error);
      toast({
        title: "エラー",
        description: "タスクのタイトル更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました",
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