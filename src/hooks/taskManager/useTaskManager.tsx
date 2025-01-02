import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations } from './types';
import { useTaskStateManager } from './taskStateManager';
import { useTaskEvents } from './useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import { useTaskOperations } from './useTaskOperations';
import { useGroupOperations } from './useGroupOperations';
import { fetchInitialData } from './supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './mappers';
import { updateGroupOrder, deleteGroup } from './groupOperations';
import { updateTaskOrder } from './taskOperations';

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
  const taskOperations = useTaskOperations();
  const groupOperations = useGroupOperations();

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
      const parentTask = parentId ? taskOperations.findTaskById(state.tasks, parentId) : null;
      const hierarchyLevel = parentTask ? parentTask.hierarchyLevel + 1 : 0;
      
      const newTask = taskOperations.createNewTask(
        trimmedTask,
        groupId,
        parentId,
        state.tasks.length,
        parentTask
      );

      // Supabaseにタスクを保存
      const { data: savedTask, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          completed: newTask.completed,
          order_position: newTask.order,
          group_id: newTask.groupId,
          parent_id: newTask.parentId,
          hierarchy_level: hierarchyLevel
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const taskWithId: Task = {
        ...newTask,
        id: savedTask.id,
        hierarchyLevel: savedTask.hierarchy_level
      };

      const updatedTasks = [...state.tasks, taskWithId];
      setters.setTasks(updatedTasks);

      const group = groupId ? state.groups.find(g => g.id === groupId) : undefined;
      taskEvents.emitTaskAdded(taskWithId, parentTask || undefined, group);
      
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
    toggleGroupCollapse,
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
  };
};
