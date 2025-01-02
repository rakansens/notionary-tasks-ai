import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations } from './taskManager/types';
import { useTaskStateManager } from './taskManager/taskStateManager';
import { useTaskEvents } from './taskManager/useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import { useTaskCRUD } from './taskManager/useTaskCRUD';
import { useGroupCRUD } from './taskManager/useGroupCRUD';
import { useSupabaseOperations } from './taskManager/supabase/useSupabaseOperations';
import { fetchInitialData } from './taskManager/supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './taskManager/mappers';
import { updateTaskOrder } from './taskManager/taskOperations';
import { updateGroupOrder } from './taskManager/groupOperations';

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
  deleteTarget: { type: "task" | "group"; id: number } | null;
  collapsedGroups: Set<number>;
  setNewTask: (value: string) => void;
  setNewGroup: (value: string) => void;
  setIsAddingGroup: (value: boolean) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
} => {
  const { state, actions } = useTaskStateManager();
  const taskEvents = useTaskEvents();
  const { toast } = useToast();
  const { updateTaskOrderInSupabase, updateGroupOrderInSupabase } = useSupabaseOperations();

  const taskCRUD = useTaskCRUD(
    state.tasks,
    actions.setTasks,
    actions.setEditingTaskId
  );

  const groupCRUD = useGroupCRUD(
    state.groups,
    state.tasks,
    actions.setGroups,
    actions.setTasks,
    actions.setNewGroup,
    actions.setIsAddingGroup,
    actions.setDeleteTarget
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { tasks, groups } = await fetchInitialData();
        actions.setTasks(tasks.map(mapSupabaseTaskToTask));
        actions.setGroups(groups.map(mapSupabaseGroupToGroup));
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
      if (state.deleteTarget.type === "task") {
        taskCRUD.deleteTask(state.deleteTarget.id);
      } else {
        groupCRUD.deleteGroup(state.deleteTarget.id);
      }
    }
    actions.setDeleteTarget(null);
  };

  const cancelDelete = () => {
    actions.setDeleteTarget(null);
  };

  return {
    ...state,
    ...actions,
    ...taskCRUD,
    ...groupCRUD,
    updateTaskOrder: async (tasks: Task[]) => {
      await updateTaskOrderInSupabase(tasks);
      actions.setTasks(tasks);
    },
    updateGroupOrder: async (groups: Group[]) => {
      await updateGroupOrderInSupabase(groups);
      actions.setGroups(groups);
    },
    confirmDelete,
    cancelDelete,
    toggleGroupCollapse: actions.toggleGroupCollapse,
  };
};