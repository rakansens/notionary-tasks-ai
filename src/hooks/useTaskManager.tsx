import { useEffect } from 'react';
import { Task, Group, TaskManagerOperations } from './taskManager/types';
import { useTaskStateManager } from './taskManager/taskStateManager';
import { useTaskEvents } from './taskManager/useTaskEvents';
import { useToast } from "@/components/ui/use-toast";
import { useTaskOperations } from './taskManager/useTaskOperations';
import { useGroupOperations } from './taskManager/useGroupOperations';
import { fetchInitialData } from './taskManager/supabaseOperations';
import { mapSupabaseTaskToTask, mapSupabaseGroupToGroup } from './taskManager/mappers';
import { updateGroupOrder, deleteGroup } from './taskManager/groupOperations';
import { updateTaskOrder } from './taskManager/taskOperations';

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
    const handleAddGroup = async (event: CustomEvent) => {
      const { name } = event.detail;
      if (!name.trim()) return;

      try {
        const newGroup: Omit<Group, "id"> = {
          name: name.trim(),
          order: state.groups.length,
        };

        const savedGroup = await groupOperations.addGroupToSupabase(newGroup);
        console.log('Group saved to Supabase:', savedGroup);
        
        if (savedGroup && savedGroup.id) {
          const group: Group = {
            id: savedGroup.id,
            name: savedGroup.name,
            order: savedGroup.order_position,
          };
          
          setters.setGroups(prevGroups => [...prevGroups, group]);
          taskEvents.emitGroupAdded(group);
          
          toast({
            title: "成功",
            description: `グループ「${name.trim()}」を追加しました`,
          });
          
          window.dispatchEvent(new CustomEvent('groupAdded'));
        }
      } catch (error) {
        console.error('Error adding group:', error);
        toast({
          title: "エラー",
          description: "グループの追加に失敗しました",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('addGroup', handleAddGroup as EventListener);
    return () => {
      window.removeEventListener('addGroup', handleAddGroup as EventListener);
    };
  }, [state.groups.length, groupOperations, taskEvents, toast, setters]);

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
      const newTask = taskOperations.createNewTask(
        trimmedTask,
        groupId,
        parentId,
        state.tasks.length
      );

      const savedTask = await taskOperations.addTaskToSupabase({
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

      const parentTask = parentId ? taskOperations.findTaskById(updatedTasks, parentId) : undefined;
      const group = groupId ? state.groups.find(g => g.id === groupId) : undefined;

      taskEvents.emitTaskAdded(taskWithId, parentTask, group);
      
      setters.setNewTask("");
      if (groupId) {
        setters.setEditingTaskId(savedTask.id);
      }
    } catch (error) {
      console.error('Error adding task:', error);
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

  const initiateGroupDelete = async (id: number) => {
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

  const confirmDelete = () => {
    if (!state.deleteTarget) return;

    if (state.deleteTarget.type === "task") {
      deleteTask(state.deleteTarget.id);
    } else {
      handleGroupDelete(state.deleteTarget.id);
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
    toggleTask,
    updateTaskTitle,
    deleteTask,
    deleteGroup: initiateGroupDelete,
    confirmDelete,
    cancelDelete,
    updateTaskOrder: (tasks: Task[]) => updateTaskOrder(tasks, setters.setTasks),
    updateGroupOrder: (groups: Group[]) => updateGroupOrder(groups, setters.setGroups),
    toggleGroupCollapse,
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
