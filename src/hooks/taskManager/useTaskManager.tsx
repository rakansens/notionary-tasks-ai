import { Task, Group } from "@/types/models";
import { TaskManagerOperations } from "@/types/api";
import { useTaskStateManager } from './taskStateManager';
import { useTaskEvents } from './useTaskEvents';
import { useTaskCRUD } from './useTaskCRUD';
import { useTaskSync } from './useTaskSync';
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
  const taskCRUD = useTaskCRUD(state.tasks, setters.setTasks);
  const groupOperations = useGroupOperations(state.groups, setters.setGroups);
  const taskSync = useTaskSync(setters.setTasks, setters.setGroups);

  const confirmDelete = () => {
    if (state.deleteTarget) {
      if (state.deleteTarget.type === 'task') {
        taskCRUD.deleteTask(state.deleteTarget.id);
      } else if (state.deleteTarget.type === 'group') {
        groupOperations.deleteGroup(state.deleteTarget.id);
      }
      setters.setDeleteTarget(null);
    }
  };

  const updateTaskOrder = (tasks: Task[]) => {
    setters.setTasks(tasks);
  };

  const addGroup = async (name: string) => {
    await groupOperations.addGroup(name);
  };

  return {
    ...state,
    ...setters,
    ...taskCRUD,
    ...groupOperations,
    confirmDelete,
    cancelDelete: () => setters.setDeleteTarget(null),
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
    updateTaskOrder,
    addGroup,
  };
};