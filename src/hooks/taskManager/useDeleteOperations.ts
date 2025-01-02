import { Task, Group } from "./types";
import { useGroupOperations } from "./useGroupOperations";
import { useTaskEvents } from "./useTaskEvents";
import { deleteGroupFromState, cleanupTasksAfterGroupDelete } from "./groupOperations";

export const useDeleteOperations = (
  tasks: Task[],
  groups: Group[],
  setTasks: (tasks: Task[]) => void,
  setGroups: (groups: Group[]) => void,
  setDeleteTarget: (target: { type: string; id: number } | null) => void,
) => {
  const groupOperations = useGroupOperations();
  const taskEvents = useTaskEvents();

  const deleteGroup = async (id: number) => {
    try {
      const groupToDelete = groups.find(g => g.id === id);
      if (groupToDelete) {
        await groupOperations.deleteGroupFromSupabase(id);
        taskEvents.emitGroupDeleted(groupToDelete);
      }
      setDeleteTarget({ type: "group", id });
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const confirmDelete = (deleteTarget: { type: string; id: number } | null) => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "task") {
      setTasks(tasks.filter(task => task.id !== deleteTarget.id));
    } else {
      setGroups(prevGroups => deleteGroupFromState(prevGroups, deleteTarget.id));
      setTasks(prevTasks => cleanupTasksAfterGroupDelete(prevTasks, deleteTarget.id));
    }
    
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  return {
    deleteGroup,
    confirmDelete,
    cancelDelete,
  };
};