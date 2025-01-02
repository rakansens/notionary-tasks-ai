import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations } from './taskManager/types';
import { useTaskStateManager } from './taskManager/taskStateManager';
import { useTaskEvents } from './taskManager/useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import { useTaskOperations } from './taskManager/useTaskOperations';
import { useGroupOperations } from './taskManager/useGroupOperations';
import { fetchInitialData } from './taskManager/supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './taskManager/mappers';
import { deleteGroupFromState, cleanupTasksAfterGroupDelete, updateGroupOrder } from './taskManager/groupOperations';
import { updateTaskOrder } from './taskManager/taskOperations';
import { supabase } from "@/integrations/supabase/client";
import { addGroupToSupabase } from './taskManager/groupOperations';

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
        console.log('Loaded tasks with hierarchy:', tasks);
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

  const addGroup = async () => {
    if (!state.newGroup.trim()) return;

    const savedGroup = await addGroupToSupabase(state.newGroup, state.groups.length);
    
    if (savedGroup) {
      setters.setGroups(prevGroups => [...prevGroups, savedGroup]);
      taskEvents.emitGroupAdded(savedGroup);
      setters.setNewGroup("");
      setters.setIsAddingGroup(false);
    }
  };

  const addTask = async (groupId?: number, parentId?: number, title?: string) => {
    const trimmedTask = title || state.newTask.trim();
    if (!trimmedTask) return;

    try {
      console.log('Adding task with groupId:', groupId, 'parentId:', parentId);
      
      const { data: savedTask, error } = await supabase
        .from('tasks')
        .insert({
          title: trimmedTask,
          completed: false,
          order_position: state.tasks.length,
          group_id: groupId || null,
          parent_id: parentId || null,
          hierarchy_level: parentId ? 1 : 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        toast({
          title: "エラー",
          description: "タスクの追加に失敗しました",
          variant: "destructive",
        });
        return;
      }

      const taskWithId: Task = {
        id: savedTask.id,
        title: savedTask.title,
        completed: savedTask.completed,
        order: savedTask.order_position,
        groupId: savedTask.group_id,
        parentId: savedTask.parent_id,
        hierarchyLevel: savedTask.hierarchy_level,
        addedAt: new Date(savedTask.created_at),
      };

      setters.setTasks(prevTasks => [...prevTasks, taskWithId]);

      const parentTask = parentId ? taskOperations.findTaskById(state.tasks, parentId) : undefined;
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
    }
  };

  const deleteGroup = async (id: number) => {
    try {
      const groupToDelete = state.groups.find(g => g.id === id);
      if (groupToDelete) {
        await groupOperations.deleteGroupFromSupabase(id);
        taskEvents.emitGroupDeleted(groupToDelete);
      }
      setters.setDeleteTarget({ type: "group", id });
    } catch (error) {
      console.error('Error deleting group:', error);
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
