import { Task, Group } from "./types";
import { useTaskOperations } from "./useTaskOperations";
import { useTaskEvents } from "./useTaskEvents";
import { useToast } from "@/components/ui/use-toast";

export const useTaskCrud = (
  tasks: Task[],
  groups: Group[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setEditingTaskId: (id: number | null) => void,
  setNewTask: (value: string) => void,
) => {
  const taskOperations = useTaskOperations();
  const taskEvents = useTaskEvents();
  const { toast } = useToast();

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    const taskTitle = title || "";
    const trimmedTask = taskTitle.trim();
    if (!trimmedTask) return;

    try {
      console.log('Adding task with groupId:', groupId); // デバッグログ追加

      const newTask = taskOperations.createNewTask(
        trimmedTask,
        groupId,
        parentId,
        tasks.length
      );

      console.log('New task object:', newTask); // デバッグログ追加

      const savedTask = await taskOperations.addTaskToSupabase({
        title: newTask.title,
        completed: newTask.completed,
        order: newTask.order,
        groupId: groupId,
        parentId: newTask.parentId,
        hierarchyLevel: newTask.hierarchyLevel,
      });

      console.log('Saved task from Supabase:', savedTask); // デバッグログ追加

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

      console.log('Final task object to be added to state:', taskWithId); // デバッグログ追加
      
      setTasks(prevTasks => [...prevTasks, taskWithId]);

      const parentTask = parentId ? taskOperations.findTaskById(tasks, parentId) : undefined;
      const group = groupId ? groups.find(g => g.id === groupId) : undefined;

      taskEvents.emitTaskAdded(taskWithId, parentTask, group);
      
      setNewTask("");
      if (groupId) {
        setEditingTaskId(savedTask.id);
      }

      toast({
        title: "タスクを追加しました",
        description: `「${taskTitle}」${group ? `をグループ「${group.name}」に` : "を"}追加しました`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "エラー",
        description: "タスクの追加に失敗しました",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (id: number, parentId?: number) => {
    try {
      const taskToToggle = taskOperations.findTaskById(tasks, id);
      if (!taskToToggle) return;

      await taskOperations.toggleTaskInSupabase(id, !taskToToggle.completed);
      
      setTasks(prevTasks => 
        prevTasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );

      const parentTask = parentId ? taskOperations.findTaskById(tasks, parentId) : undefined;
      const group = taskToToggle.groupId ? groups.find(g => g.id === taskToToggle.groupId) : undefined;

      taskEvents.emitTaskCompleted(taskToToggle, parentTask, group);
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "エラー",
        description: "タスクの状態更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const updateTaskTitle = async (id: number, title: string) => {
    if (!title.trim()) return;

    try {
      await taskOperations.updateTaskTitleInSupabase(id, title);
      
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
      await taskOperations.deleteTaskFromSupabase(id);
      
      const taskToDelete = tasks.find(t => t.id === id);
      if (!taskToDelete) return;

      const parentTask = taskToDelete.parentId ? tasks.find(t => t.id === taskToDelete.parentId) : undefined;
      const group = taskToDelete.groupId ? groups.find(g => g.id === taskToDelete.groupId) : undefined;

      taskEvents.emitTaskDeleted(taskToDelete, parentTask, group);

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