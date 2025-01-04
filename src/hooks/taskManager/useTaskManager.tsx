import { useEffect } from 'react';
import { Task, Group } from "@/types/models";
import { TaskManagerOperations } from "@/types/api";
import { useTaskStateManager } from './taskStateManager';
import { useTaskEvents } from './useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import { fetchInitialData } from './supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './mappers';
import { useTaskOperations } from './operations/useTaskOperations';
import { useGroupOperations } from './operations/useGroupOperations';

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
  const { toast } = useToast();
  const taskOperations = useTaskOperations(state.tasks, setters.setTasks);
  const groupOperations = useGroupOperations(state.groups, setters.setGroups);

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

  const confirmDelete = () => {
    if (state.deleteTarget) {
      if (state.deleteTarget.type === 'task') {
        taskOperations.deleteTask(state.deleteTarget.id);
      } else if (state.deleteTarget.type === 'group') {
        groupOperations.deleteGroup(state.deleteTarget.id);
      }
      setters.setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setters.setDeleteTarget(null);
  };

  return {
    ...state,
    ...setters,
    addTask: taskOperations.addTask,
    toggleTask: taskOperations.toggleTask,
    updateTaskTitle: taskOperations.updateTaskTitle,
    deleteTask: taskOperations.deleteTask,
    confirmDelete,
    cancelDelete,
    toggleGroupCollapse: (groupId: number) => {
      setters.setCollapsedGroups(prev => {
        const newCollapsed = new Set(prev);
        if (newCollapsed.has(groupId)) {
          newCollapsed.delete(groupId);
        } else {
          newCollapsed.add(groupId);
        }
        return newCollapsed;
      });
    },
    deleteGroup: (id: number) => {
      const groupToDelete = state.groups.find(g => g.id === id);
      if (groupToDelete) {
        setters.setDeleteTarget({ type: "group", id });
      }
    },
    updateTaskOrder: (tasks: Task[]) => {
      setters.setTasks(tasks);
    },
    updateGroupOrder: groupOperations.updateGroupOrder,
    addGroup: (name: string) => {
      window.dispatchEvent(new CustomEvent('addGroup', { detail: { name } }));
    },
    updateGroupName: groupOperations.updateGroupName,
  };
};
