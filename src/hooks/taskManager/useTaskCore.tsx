import { Task, Group } from './types';
import { useToast } from "@/components/ui/use-toast";
import { useTaskOperations } from './useTaskOperations';
import { useGroupOperations } from './useGroupOperations';
import { useTaskState } from './useTaskState';
import { useTaskEvents } from './useTaskEvents';

export const useTaskCore = () => {
  const { state, setters } = useTaskState();
  const taskEvents = useTaskEvents();
  const { toast } = useToast();
  const taskOperations = useTaskOperations();
  const groupOperations = useGroupOperations();

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    const trimmedTask = title || state.newTask.trim();
    if (!trimmedTask) return;

    try {
      const newTask = taskOperations.createNewTask(
        trimmedTask,
        groupId,
        parentId,
        state.tasks.length
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
      const updatedTasks = [...state.tasks, taskWithId];
      setters.setTasks(updatedTasks);

      const parentTask = parentId ? taskOperations.findTaskById(updatedTasks, parentId) : undefined;
      const group = groupId ? state.groups.find(g => g.id === groupId) : undefined;

      taskEvents.emitTaskAdded(taskWithId, parentTask, group);
      
      setters.setNewTask("");
      if (groupId) {
        setters.setEditingTaskId(savedTask.id);
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

  const toggleTask = async (id: number, parentId?: number) => {
    try {
      const taskToToggle = taskOperations.findTaskById(state.tasks, id);
      if (!taskToToggle) return;

      await taskOperations.toggleTaskInSupabase(id, !taskToToggle.completed);
      
      setters.setTasks(prevTasks => 
        prevTasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );

      const parentTask = parentId ? taskOperations.findTaskById(state.tasks, parentId) : undefined;
      const group = taskToToggle.groupId ? state.groups.find(g => g.id === taskToToggle.groupId) : undefined;

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
      
      setters.setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, title } : task
        )
      );
      setters.setEditingTaskId(null);
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
      
      const taskToDelete = state.tasks.find(t => t.id === id);
      if (!taskToDelete) return;

      const parentTask = taskToDelete.parentId ? state.tasks.find(t => t.id === taskToDelete.parentId) : undefined;
      const group = taskToDelete.groupId ? state.groups.find(g => g.id === taskToDelete.groupId) : undefined;

      taskEvents.emitTaskDeleted(taskToDelete, parentTask, group);

      setters.setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  const addGroup = async (name: string) => {
    if (!name.trim()) return;

    try {
      const newGroup: Omit<Group, "id"> = {
        name: name.trim(),
        order: state.groups.length,
      };

      const savedGroup = await groupOperations.addGroupToSupabase(newGroup);
      
      if (savedGroup && savedGroup.id) {
        const group: Group = {
          id: savedGroup.id,
          name: savedGroup.name,
          order: savedGroup.order_position,
        };
        
        setters.setGroups(prevGroups => [...prevGroups, group]);
        taskEvents.emitGroupAdded(group);
        
        toast({
          title: "成功",
          description: `グループ「${name.trim()}」を追加しました`,
        });
        
        window.dispatchEvent(new CustomEvent('groupAdded'));
        setters.setNewGroup('');
        setters.setIsAddingGroup(false);
      }
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "エラー",
        description: "グループの追加に失敗しました",
        variant: "destructive",
      });
    }
  };

  const updateGroupName = async (id: number, name: string) => {
    try {
      await groupOperations.updateGroupNameInSupabase(id, name);
      setters.setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === id ? { ...group, name } : group
        )
      );
    } catch (error) {
      console.error('Error updating group name:', error);
      toast({
        title: "エラー",
        description: "グループ名の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const deleteGroup = async (id: number) => {
    try {
      const groupToDelete = state.groups.find(g => g.id === id);
      if (!groupToDelete) return;

      await groupOperations.deleteGroupFromSupabase(id);
      setters.setGroups(prevGroups => prevGroups.filter(g => g.id !== id));
      setters.setTasks(prevTasks => prevTasks.filter(t => t.groupId !== id));
      
      taskEvents.emitGroupDeleted(groupToDelete);

      toast({
        title: "成功",
        description: `グループ「${groupToDelete.name}」を削除しました`,
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "エラー",
        description: "グループの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  return {
    addTask,
    toggleTask,
    updateTaskTitle,
    deleteTask,
    addGroup,
    updateGroupName,
    deleteGroup,
  };
};