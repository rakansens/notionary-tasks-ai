import { Task, Group } from "./types";
import { useTaskEvents } from "./useTaskEvents";
import { useTaskOperations } from "./useTaskOperations";
import { useToast } from "@/components/ui/use-toast";

export const useTaskCore = (
  tasks: Task[],
  groups: Group[],
  setTasks: (tasks: Task[]) => void,
  setDeleteTarget: (target: { type: string; id: number } | null) => void
) => {
  const taskEvents = useTaskEvents();
  const { toast } = useToast();
  const taskOperations = useTaskOperations();

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    const trimmedTask = title || "";
    if (!trimmedTask) return;

    try {
      const newTask = taskOperations.createNewTask(
        trimmedTask,
        groupId,
        parentId,
        tasks.length
      );

      const savedTask = await taskOperations.addTaskToSupabase({
        title: newTask.title,
        completed: newTask.completed,
        order: newTask.order,
        groupId: newTask.groupId,
        parentId: newTask.parentId,
        hierarchyLevel: newTask.hierarchyLevel,
      });

      const taskWithId: Task = { ...newTask, id: savedTask.id };
      const updatedTasks = [...tasks, taskWithId];
      setTasks(updatedTasks);

      const parentTask = parentId ? taskOperations.findTaskById(updatedTasks, parentId) : undefined;
      const group = groupId ? groups.find(g => g.id === groupId) : undefined;

      taskEvents.emitTaskAdded(taskWithId, parentTask, group);
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
      
      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);

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
      
      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, title } : task
      );
      setTasks(updatedTasks);
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

      setTasks(tasks.filter(task => task.id !== id));
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