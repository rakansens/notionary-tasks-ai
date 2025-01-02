import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations, DeleteTarget } from './types';
import { useTaskState } from './useTaskState';
import { useTaskEvents } from './useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import { useTaskOperations } from './useTaskOperations';
import { useGroupOperations } from './useGroupOperations';
import { fetchInitialData } from './supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './mappers';
import { updateGroupOrder, deleteGroup } from './groupOperations';
import { updateTaskOrder } from './taskOperations';
import { useTaskCore } from './useTaskCore';

export const useTaskManager = (): TaskManagerOperations & {
  tasks: Task[];
  groups: Group[];
  newTask: string;
  newGroup: string;
  isAddingGroup: boolean;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  deleteTarget: DeleteTarget | null;
  collapsedGroups: Set<number>;
  setNewTask: (value: string) => void;
  setNewGroup: (value: string) => void;
  setIsAddingGroup: (value: boolean) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
} => {
  const { state, setters } = useTaskState();
  const taskEvents = useTaskEvents();
  const { toast } = useToast();
  const taskOperations = useTaskOperations();
  const groupOperations = useGroupOperations();

  const taskCore = useTaskCore(
    state.tasks,
    state.groups,
    setters.setTasks,
    (target: { type: string; id: number } | null) => {
      if (target === null) {
        setters.setDeleteTarget(null);
      } else {
        setters.setDeleteTarget({ ...target, type: target.type as "task" | "group" });
      }
    }
  );

  // 初期データの読み込み
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

  const confirmDelete = () => {
    if (!state.deleteTarget) return;

    if (state.deleteTarget.type === "task") {
      taskCore.deleteTask(state.deleteTarget.id);
    } else {
      handleGroupDelete(state.deleteTarget.id);
    }
    
    setters.setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setters.setDeleteTarget(null);
  };

  const handleGroupDelete = async (id: number) => {
    try {
      const groupToDelete = state.groups.find(g => g.id === id);
      if (!groupToDelete) return;

      await deleteGroup(id);
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
    ...state,
    ...setters,
    ...taskCore,
    deleteGroup: (id: number) => {
      try {
        const groupToDelete = state.groups.find(g => g.id === id);
        if (groupToDelete) {
          setters.setDeleteTarget({ type: "group", id });
        }
      } catch (error) {
        console.error('Error setting up group deletion:', error);
        toast({
          title: "エラー",
          description: "グループの削除準備に失敗しました",
          variant: "destructive",
        });
      }
    },
    confirmDelete,
    cancelDelete,
    updateTaskOrder: (tasks: Task[]) => updateTaskOrder(tasks, setters.setTasks),
    updateGroupOrder: (groups: Group[]) => updateGroupOrder(groups, setters.setGroups),
    toggleGroupCollapse,
    addGroup: (name: string) => {
      window.dispatchEvent(new CustomEvent('addGroup', { detail: { name } }));
    },
    updateGroupName: (id: number, name: string) => groupOperations.updateGroupNameInSupabase(id, name),
  };
};
