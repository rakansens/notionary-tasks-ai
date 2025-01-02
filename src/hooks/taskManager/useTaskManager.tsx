import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations } from './types';
import { useTaskState } from './useTaskState';
import { useTaskEvents } from './useTaskEvents';
import { useTaskCore } from './useTaskCore';
import { fetchInitialData } from './supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './mappers';
import { updateGroupOrder } from './groupOperations';
import { updateTaskOrder } from './taskOperations';
import { useToast } from "@/components/ui/use-toast";

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
  const { state, setters } = useTaskState();
  const taskEvents = useTaskEvents();
  const taskCore = useTaskCore();
  const { toast } = useToast();

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

  const handleDeleteGroup = (id: number) => {
    const groupToDelete = state.groups.find(g => g.id === id);
    if (groupToDelete) {
      setters.setDeleteTarget({ type: "group", id });
    }
  };

  const confirmDelete = () => {
    if (!state.deleteTarget) return;

    if (state.deleteTarget.type === "task") {
      taskCore.deleteTask(state.deleteTarget.id);
    } else {
      taskCore.deleteGroup(state.deleteTarget.id);
    }
    
    setters.setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setters.setDeleteTarget(null);
  };

  return {
    ...state,
    ...setters,
    ...taskCore,
    updateTaskOrder: (tasks: Task[]) => updateTaskOrder(tasks, setters.setTasks),
    updateGroupOrder: (groups: Group[]) => updateGroupOrder(groups, setters.setGroups),
    toggleGroupCollapse,
    deleteGroup: handleDeleteGroup,
    confirmDelete,
    cancelDelete,
  };
};