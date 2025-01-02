import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations } from './taskManager/types';
import { useTaskStateManager } from './taskManager/taskStateManager';
import { useTaskEvents } from './taskManager/useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import {
  addTaskToSupabase,
  toggleTaskInSupabase,
  updateTaskTitleInSupabase,
  deleteTaskFromSupabase,
  addGroupToSupabase,
  updateGroupNameInSupabase,
  deleteGroupFromSupabase,
  fetchInitialData,
} from './taskManager/supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './taskManager/mappers';
import { deleteGroupFromState, cleanupTasksAfterGroupDelete, updateGroupOrder } from './taskManager/groupOperations';
import { updateTaskOrder, findTaskById, createNewTask } from './taskManager/taskOperations';

export type { Task, Group };

export const useTaskManager = (): TaskManagerOperations & {
  tasks: Task[];
  groups: Group[];
  newTask: string;
  newGroup: string;
  isAddingGroup: boolean;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  deleteTarget: { type: string; id: number } | null;
  collapsedGroups: Set<number>;
  setNewTask: (value: string) => void;
  setNewGroup: (value: string) => void;
  setIsAddingGroup: (value: boolean) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
} => {
  const { state, setters } = useTaskStateManager();
  const taskEvents = useTaskEvents();
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { tasks, groups } = await fetchInitialData();
        setters.setTasks(tasks.map(mapSupabaseTaskToTask));
        setters.setGroups(groups.map(mapSupabaseGroupToGroup));
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: "エラー",
          description: "データの読み込みに失敗しました",
          variant: "destructive",
        });
      }
    };

    loadInitialData();
  }, []);

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    const trimmedTask = title || state.newTask.trim();
    if (!trimmedTask) return;

    try {
      const newTask = createNewTask(
        trimmedTask,
        groupId,
        parentId,
        state.tasks.length
      );

      const savedTask = await addTaskToSupabase({
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

      const parentTask = parentId ? findTaskById(updatedTasks, parentId) : undefined;
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
      const taskToToggle = findTaskById(state.tasks, id);
      if (!taskToToggle) return;

      await toggleTaskInSupabase(id, !taskToToggle.completed);
      
      setters.setTasks(prevTasks => 
        prevTasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );

      const parentTask = parentId ? findTaskById(state.tasks, parentId) : undefined;
      const group = taskToToggle.groupId ? state.groups.find(g => g.id === taskToToggle.groupId) : undefined;

      taskEvents.emitTaskCompleted(taskToToggle, parentTask, group);
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "エラー",
        description: "タスクの状態の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const updateTaskTitle = async (id: number, title: string, parentId?: number) => {
    if (!title.trim()) return;

    try {
      await updateTaskTitleInSupabase(id, title);
      
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

  const deleteTask = async (id: number, parentId?: number) => {
    try {
      await deleteTaskFromSupabase(id);
      
      const taskToDelete = state.tasks.find(t => t.id === id);
      if (!taskToDelete) return;

      const parentTask = parentId ? state.tasks.find(t => t.id === parentId) : undefined;
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

  const addGroup = async () => {
    if (!state.newGroup.trim()) return;

    try {
      const newGroup: Omit<Group, "id"> = {
        name: state.newGroup,
        order: state.groups.length,
      };

      const savedGroup = await addGroupToSupabase(newGroup);
      
      const group = { ...newGroup, id: savedGroup.id };
      setters.setGroups(prevGroups => [...prevGroups, group]);
      taskEvents.emitGroupAdded(group);
      
      setters.setNewGroup("");
      setters.setIsAddingGroup(false);
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
      await updateGroupNameInSupabase(id, name);
      
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
      if (groupToDelete) {
        await deleteGroupFromSupabase(id);
        taskEvents.emitGroupDeleted(groupToDelete);
      }
      setters.setDeleteTarget({ type: "group", id });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "エラー",
        description: "グループの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = () => {
    if (!state.deleteTarget) return;

    if (state.deleteTarget.type === "task") {
      setters.setTasks(state.tasks.filter(task => task.id !== state.deleteTarget.id));
    } else {
      setters.setGroups(prevGroups => deleteGroupFromState(prevGroups, state.deleteTarget.id));
      setters.setTasks(prevTasks => cleanupTasksAfterGroupDelete(prevTasks, state.deleteTarget.id));
    }
    
    setters.setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setters.setDeleteTarget(null);
  };

  const toggleGroupCollapse = (groupId: number) => {
    setters.setCollapsedGroups(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(groupId)) {
        newCollapsed.delete(groupId);
      } else {
        newCollapsed.add(groupId);
      }
      return newCollapsed;
    });
  };

  return {
    tasks: state.tasks,
    groups: state.groups,
    newTask: state.newTask,
    newGroup: state.newGroup,
    isAddingGroup: state.isAddingGroup,
    editingTaskId: state.editingTaskId,
    editingGroupId: state.editingGroupId,
    addingSubtaskId: state.addingSubtaskId,
    deleteTarget: state.deleteTarget,
    collapsedGroups: state.collapsedGroups,
    setNewTask: setters.setNewTask,
    setNewGroup: setters.setNewGroup,
    setIsAddingGroup: setters.setIsAddingGroup,
    setEditingTaskId: setters.setEditingTaskId,
    setEditingGroupId: setters.setEditingGroupId,
    setAddingSubtaskId: setters.setAddingSubtaskId,
    addTask,
    addGroup,
    toggleTask,
    updateTaskTitle,
    updateGroupName,
    deleteTask,
    deleteGroup,
    confirmDelete,
    cancelDelete,
    updateTaskOrder: (tasks: Task[]) => updateTaskOrder(tasks, setters.setTasks),
    updateGroupOrder: (groups: Group[]) => updateGroupOrder(groups, setters.setGroups),
    toggleGroupCollapse,
  };
};
