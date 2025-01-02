import { Task, Group, TaskManagerOperations } from './taskManager/types';
import { useTaskStateManager } from './taskManager/taskStateManager';
import { useInitialData } from './taskManager/useInitialData';
import { useTaskCrud } from './taskManager/useTaskCrud';
import { useGroupCrud } from './taskManager/useGroupCrud';
import { useDeleteOperations } from './taskManager/useDeleteOperations';
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

  useInitialData(setters.setTasks, setters.setGroups);

  const { addTask, toggleTask, updateTaskTitle, deleteTask } = useTaskCrud(
    state.tasks,
    state.groups,
    setters.setTasks,
    setters.setEditingTaskId,
    setters.setNewTask,
  );

  const { addGroup, updateGroupName } = useGroupCrud(
    state.groups,
    setters.setGroups,
    state.newGroup,
    setters.setNewGroup,
    setters.setIsAddingGroup,
  );

  const { deleteGroup, confirmDelete, cancelDelete } = useDeleteOperations(
    state.tasks,
    state.groups,
    setters.setTasks,
    setters.setGroups,
    setters.setDeleteTarget,
  );

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