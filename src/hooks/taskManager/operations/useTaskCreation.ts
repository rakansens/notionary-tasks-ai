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

  const createNewTask = (
    title: string,
    groupId?: number,
    parentId?: number,
    order?: number,
    parentTask?: Task | null
  ): Task => {
    const level = parentTask ? (parentTask.level + 1) : 1;
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

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    try {
      const trimmedTask = title?.trim();
      if (!trimmedTask) return;

      const parentTask = parentId ? findTaskById(tasks, parentId) : null;
      const newLevel = parentTask ? (parentTask.level + 1) : 1;

      // 3階層以上のチェックを先に行う
      if (newLevel > 3) {
        toast({
          title: "エラー",
          description: "3階層以上のサブタスクは作成できません",
          variant: "destructive",
        });
        return null;
      }

      const newTask = createNewTask(
        trimmedTask,
        groupId,
        parentId,
        tasks.length,
        parentTask
      );

      console.log('Creating new task with level:', newLevel, 'Parent task:', parentTask);

      const { data: savedTask, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          completed: newTask.completed,
          order_position: newTask.order,
          group_id: newTask.groupId,
          parent_id: newTask.parentId,
          level: newLevel
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving task:', error);
        throw error;
      }

      const taskWithId: Task = {
        ...newTask,
        id: savedTask.id,
        level: savedTask.level
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
    createNewTask,
    addTask,
  };
};