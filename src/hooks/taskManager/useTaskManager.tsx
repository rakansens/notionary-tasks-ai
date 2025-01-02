import { Task, Group, TaskManagerOperations } from './types';
import { useTaskState } from './useTaskState';
import { useTaskCore } from './useTaskCore';
import { useTaskEvents } from './useTaskEvents';
import { useTaskOperations } from './useTaskOperations';
import { useGroupOperations } from './useGroupOperations';
import { useToast } from "@/components/ui/use-toast";
import { updateTaskOrder } from './taskOperations';
import { updateGroupOrder } from './groupOperations';

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
  const taskOperations = useTaskOperations();
  const groupOperations = useGroupOperations();
  const { toast } = useToast();
  const taskEvents = useTaskEvents(state, setters, taskOperations, groupOperations);
  const taskCore = useTaskCore(state, setters, taskOperations, taskEvents, toast);

  return {
    ...state,
    ...setters,
    ...taskCore,
    ...taskEvents,
    updateTaskOrder: (tasks: Task[]) => updateTaskOrder(tasks, setters.setTasks),
    updateGroupOrder: (groups: Group[]) => updateGroupOrder(groups, setters.setGroups),
    addGroup: (name: string) => {
      window.dispatchEvent(new CustomEvent('addGroup', { detail: { name } }));
    },
    updateGroupName: async (id: number, name: string) => {
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
    },
    deleteGroup: async (id: number) => {
      try {
        await groupOperations.deleteGroup(id);
        setters.setGroups(prevGroups => prevGroups.filter(g => g.id !== id));
        setters.setTasks(prevTasks => prevTasks.filter(t => t.groupId !== id));
      } catch (error) {
        console.error('Error deleting group:', error);
        toast({
          title: "エラー",
          description: "グループの削除に失敗しました",
          variant: "destructive",
        });
      }
    },
    confirmDelete: () => {
      if (!state.deleteTarget) return;
      if (state.deleteTarget.type === "task") {
        taskOperations.deleteTaskFromSupabase(state.deleteTarget.id);
      } else {
        groupOperations.deleteGroup(state.deleteTarget.id);
      }
      setters.setDeleteTarget(null);
    },
    cancelDelete: () => {
      setters.setDeleteTarget(null);
    }
  };
};