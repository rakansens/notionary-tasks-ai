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
      const parentTask = parentId ? state.tasks.find(t => t.id === parentId) : null;
      console.log('Parent task:', parentTask);

      const hierarchyLevel = parentTask ? parentTask.hierarchyLevel + 1 : 0;
      console.log('Calculated hierarchy level:', hierarchyLevel);

      const newTask = taskOperations.createNewTask(
        trimmedTask,
        groupId,
        parentId,
        state.tasks.length,
        hierarchyLevel
      );

      console.log('New task to be saved:', newTask);

      // サブタスクの場合は subtasks テーブルに保存
      if (parentId) {
        const { data: savedSubtask, error } = await supabase
          .from('subtasks')
          .insert({
            title: newTask.title,
            completed: newTask.completed,
            order_position: newTask.order,
            group_id: newTask.groupId,
            parent_id: parentId,
            hierarchy_level: hierarchyLevel,
            parent_title: parentTask?.title
          })
          .select()
          .single();

        if (error) throw error;

        const taskWithId: Task = {
          ...newTask,
          id: savedSubtask.id,
          addedAt: new Date(),
          subtasks: []
        };

        const updatedTasks = [...state.tasks, taskWithId];
        setters.setTasks(updatedTasks);

        taskEvents.emitTaskAdded(taskWithId, parentTask);
      } else {
        // 通常のタスクは tasks テーブルに保存
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

        if (error) throw error;

        const taskWithId: Task = {
          ...newTask,
          id: savedTask.id,
          addedAt: new Date(),
          subtasks: []
        };

        const updatedTasks = [...state.tasks, taskWithId];
        setters.setTasks(updatedTasks);

        const group = groupId ? state.groups.find(g => g.id === groupId) : undefined;
        taskEvents.emitTaskAdded(taskWithId, parentTask || undefined, group);
      }

      setters.setNewTask("");
      if (groupId) {
        setters.setEditingTaskId(null);
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
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;

      const newCompleted = !task.completed;

      // サブタスクの場合は subtasks テーブルを更新
      if (parentId) {
        const { error } = await supabase
          .from('subtasks')
          .update({ completed: newCompleted })
          .eq('id', id);

        if (error) throw error;
      } else {
        // 通常のタスクは tasks テーブルを更新
        const { error } = await supabase
          .from('tasks')
          .update({ completed: newCompleted })
          .eq('id', id);

        if (error) throw error;
      }

      setters.setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === id ? { ...t, completed: newCompleted } : t
        )
      );
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
    try {
      // サブタスクの場合は subtasks テーブルを更新
      if (parentId) {
        const { error } = await supabase
          .from('subtasks')
          .update({ title })
          .eq('id', id);

        if (error) throw error;
      } else {
        // 通常のタスクは tasks テーブルを更新
        const { error } = await supabase
          .from('tasks')
          .update({ title })
          .eq('id', id);

        if (error) throw error;
      }

      setters.setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === id ? { ...t, title } : t
        )
      );
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
      // サブタスクの場合は subtasks テーブルから削除
      if (parentId) {
        const { error } = await supabase
          .from('subtasks')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } else {
        // 通常のタスクは tasks テーブルから削除
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      setters.setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "エラー",
        description: "タスクの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!state.deleteTarget) return;

    try {
      if (state.deleteTarget.type === 'group') {
        await deleteGroup(state.deleteTarget.id);
        setters.setGroups(prevGroups =>
          prevGroups.filter(g => g.id !== state.deleteTarget?.id)
        );
      }
      setters.setDeleteTarget(null);
    } catch (error) {
      console.error('Error confirming deletion:', error);
      toast({
        title: "エラー",
        description: "削除の確認に失敗しました",
        variant: "destructive",
      });
    }
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
    toggleTask,
    updateTaskTitle,
    deleteTask,
    confirmDelete,
    cancelDelete,
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