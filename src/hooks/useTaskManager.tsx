import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations } from './taskManager/types';
import { useTaskStateManager } from './taskManager/taskStateManager';
import { useTaskEvents } from './taskManager/useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import { useTaskCRUD } from './taskManager/useTaskCRUD';
import { useGroupCRUD } from './taskManager/useGroupCRUD';
import { fetchInitialData } from './taskManager/supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './taskManager/mappers';
import { buildTaskHierarchy } from './taskManager/taskOperations';
import { supabase } from "@/integrations/supabase/client";

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
  const { state, setters } = useTaskStateManager();
  const taskEvents = useTaskEvents();
  const { toast } = useToast();

  const taskCRUD = useTaskCRUD(
    state.tasks,
    setters.setTasks,
    setters.setEditingTaskId
  );

  const groupCRUD = useGroupCRUD(
    state.groups,
    state.tasks,
    setters.setGroups,
    setters.setTasks,
    setters.setNewGroup,
    setters.setIsAddingGroup,
    setters.setDeleteTarget
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { tasks, groups } = await fetchInitialData();
        const mappedTasks = tasks.map(mapSupabaseTaskToTask);
        const hierarchicalTasks = buildTaskHierarchy(mappedTasks);
        console.log('Hierarchical tasks:', hierarchicalTasks);
        setters.setTasks(hierarchicalTasks);
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
    if (state.deleteTarget) {
      if (state.deleteTarget.type === "task") {
        taskCRUD.deleteTask(state.deleteTarget.id);
      } else {
        groupCRUD.deleteGroup(state.deleteTarget.id);
      }
    }
    setters.setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setters.setDeleteTarget(null);
  };

  return {
    ...state,
    ...setters,
    ...taskCRUD,
    ...groupCRUD,
    updateTaskOrder: (tasks: Task[]) => updateTaskOrder(tasks, setters.setTasks),
    updateGroupOrder: (groups: Group[]) => updateGroupOrder(groups, setters.setGroups),
    toggleGroupCollapse,
    confirmDelete,
    cancelDelete,
  };
};