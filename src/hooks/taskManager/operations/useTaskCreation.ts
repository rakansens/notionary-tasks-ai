import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task } from '@/types/models';

export const useTaskCreation = (
  tasks: Task[], 
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
) => {
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

  const calculateTaskLevel = (parentId: number | undefined | null, tasks: Task[]): number => {
    if (!parentId) return 1;
    
    const parentTask = findTaskById(tasks, parentId);
    if (!parentTask) return 1;
    
    return parentTask.level + 1;
  };

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    try {
      const trimmedTask = title?.trim();
      if (!trimmedTask) return;

      // レベルの計算を改善
      const newLevel = calculateTaskLevel(parentId, tasks);
      console.log('Calculated new task level:', newLevel, 'for parent:', parentId);

      if (newLevel > 3) {
        toast({
          title: "エラー",
          description: "3階層以上のサブタスクは作成できません",
          variant: "destructive",
        });
        return null;
      }

      // 同じ親を持つタスクの最大order値を取得
      const siblingTasks = tasks.filter(t => 
        t.parentId === parentId && t.groupId === groupId
      );
      const maxOrder = siblingTasks.length > 0
        ? Math.max(...siblingTasks.map(t => t.order))
        : -1;
      const newOrder = maxOrder + 1;

      const { data: savedTask, error } = await supabase
        .from('tasks')
        .insert({
          title: trimmedTask,
          completed: false,
          order_position: newOrder,
          group_id: groupId,
          parent_id: parentId,
          level: newLevel
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving task:', error);
        throw error;
      }

      console.log('Saved new task:', savedTask);

      const taskWithId: Task = {
        id: savedTask.id,
        title: trimmedTask,
        completed: false,
        order: newOrder,
        groupId: groupId || null,
        parentId: parentId || null,
        level: newLevel,
        addedAt: new Date(),
        subtasks: [],
      };

      setTasks(prevTasks => {
        const updateSubtasks = (tasks: Task[]): Task[] => {
          return tasks.map(task => {
            if (task.id === parentId) {
              return {
                ...task,
                subtasks: [...(task.subtasks || []), taskWithId]
              };
            }
            if (task.subtasks && task.subtasks.length > 0) {
              return {
                ...task,
                subtasks: updateSubtasks(task.subtasks)
              };
            }
            return task;
          });
        };

        if (parentId) {
          return updateSubtasks(prevTasks);
        }
        return [...prevTasks, taskWithId];
      });

      return taskWithId;
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

  return {
    findTaskById,
    addTask,
  };
};