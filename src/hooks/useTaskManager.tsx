import { useEffect } from 'react';
import { Task, Group } from './taskManager/types';
import { useTaskStateManager } from './taskManager/taskStateManager';
import { useTaskEvents } from './taskManager/useTaskEvents';
import { useTaskOperations } from './taskManager/useTaskOperations';
import {
  addTaskToState,
  toggleTaskInState,
  updateTaskTitleInState,
  updateTaskOrderInState,
} from './taskManager/taskOperations';
import {
  addGroupToState,
  updateGroupNameInState,
  deleteGroupFromState,
  cleanupTasksAfterGroupDelete,
} from './taskManager/groupOperations';

export type { Task, Group };

export const useTaskManager = () => {
  const { state, setters } = useTaskStateManager();
  const taskEvents = useTaskEvents();
  const { findTaskById, createNewTask } = useTaskOperations();

  useEffect(() => {
    const handleGroupAdded = (event: CustomEvent) => {
      const { title } = event.detail;
      const group: Group = {
        id: Date.now(),
        name: title,
        order: state.groups.length,
      };
      setters.setGroups(prevGroups => [...prevGroups, group]);
      taskEvents.emitGroupAdded(group);
    };

    window.addEventListener('groupAdded', handleGroupAdded as EventListener);
    return () => {
      window.removeEventListener('groupAdded', handleGroupAdded as EventListener);
    };
  }, [state.groups.length]);

  const addTask = (groupId?: number, parentId?: number) => {
    const trimmedTask = state.newTask.trim();
    if (!trimmedTask) return;

    const task = createNewTask(
      trimmedTask,
      groupId,
      parentId,
      state.tasks.length
    );

    // 状態を更新
    const updatedTasks = addTaskToState(state.tasks, task, parentId);
    setters.setTasks(updatedTasks);

    // 更新された状態から必要な情報を取得
    const updatedTask = findTaskById(updatedTasks, task.id);
    if (updatedTask && updatedTask.title) {
      const parentTask = parentId ? findTaskById(updatedTasks, parentId) : undefined;
      const grandParentTask = parentTask?.parentId ? findTaskById(updatedTasks, parentTask.parentId) : undefined;
      const group = groupId ? state.groups.find(g => g.id === groupId) : undefined;

      // イベントを発行
      taskEvents.emitTaskAdded(updatedTask, parentTask, group, grandParentTask);

      // グループ内のタスク追加時のログ
      if (group) {
        console.log(`グループ「${group.name}」内にタスク「${trimmedTask}」を追加しました`);
      }
    }
    
    setters.setNewTask("");
    if (groupId) {
      setters.setEditingTaskId(task.id);
    }
  };

  const updateTaskTitle = (id: number, title: string, parentId?: number) => {
    if (title.trim() !== "") {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const parentTask = parentId ? state.tasks.find(t => t.id === parentId) : undefined;
        const group = task.groupId ? state.groups.find(g => g.id === task.groupId) : undefined;
        // タスク完了イベントの発行を削除
      }
    }
    setters.setTasks(prevTasks => updateTaskTitleInState(prevTasks, id, title, parentId));
    setters.setEditingTaskId(null);
  };

  const toggleTask = (id: number, parentId?: number) => {
    const taskToToggle = findTaskById(state.tasks, id);
    if (taskToToggle) {
      const parentTask = parentId ? findTaskById(state.tasks, parentId) : undefined;
      const grandParentTask = parentTask?.parentId ? findTaskById(state.tasks, parentTask.parentId) : undefined;
      const group = taskToToggle.groupId ? state.groups.find(g => g.id === taskToToggle.groupId) : undefined;
      const location = group ? `グループ「${group.name}」内の` : '';
      const message = `${location}タスクを${!taskToToggle.completed ? '完了' : '未完了'}に変更しました`;

      taskEvents.emitTaskCompleted(taskToToggle, parentTask, group, grandParentTask);
    }
    setters.setTasks(prevTasks => toggleTaskInState(prevTasks, id, parentId));
  };

  const deleteTask = (id: number, parentId?: number) => {
    const taskToDelete = state.tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    const parentTask = parentId ? state.tasks.find(t => t.id === parentId) : undefined;
    const group = taskToDelete.groupId ? state.groups.find(g => g.id === taskToDelete.groupId) : undefined;

    taskEvents.emitTaskDeleted(taskToDelete, parentTask, group);

    if (parentId) {
      setters.setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === parentId) {
            return {
              ...task,
              subtasks: task.subtasks?.filter(subtask => subtask.id !== id),
            };
          }
          return task;
        })
      );
    } else {
      setters.setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const addGroup = () => {
    if (!state.newGroup.trim()) return;
    
    const group: Group = {
      id: Date.now(),
      name: state.newGroup,
      order: state.groups.length,
    };
    
    taskEvents.emitGroupAdded(group);
    
    setters.setGroups(prevGroups => [...prevGroups, group]);
    setters.setNewGroup("");
    setters.setIsAddingGroup(false);
  };

  const updateTaskOrder = (updatedTasks: Task[]) => {
    setters.setTasks(updatedTasks);
  };

  const updateGroupOrder = (updatedGroups: Group[]) => {
    setters.setGroups(updatedGroups);
  };

  const updateGroupName = (id: number, name: string) => {
    setters.setGroups(prevGroups => updateGroupNameInState(prevGroups, id, name));
  };

  const deleteGroup = (id: number) => {
    const groupToDelete = state.groups.find(g => g.id === id);
    if (groupToDelete) {
      taskEvents.emitGroupDeleted(groupToDelete);
    }
    setters.setDeleteTarget({ type: "group", id });
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
    updateTaskOrder,  // 追加
    updateGroupOrder, // 追加
    toggleGroupCollapse,
  };
};