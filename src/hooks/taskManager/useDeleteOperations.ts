import { Task, Group, DeleteTarget } from "./types";
import { useGroupOperations } from "./useGroupOperations";
import { useTaskEvents } from "./useTaskEvents";
import { deleteGroupFromState, cleanupTasksAfterGroupDelete } from "./groupOperations";

export const useDeleteOperations = (
  tasks: Task[],
  groups: Group[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  setDeleteTarget: React.Dispatch<React.SetStateAction<DeleteTarget | null>>,
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

  const confirmDelete = (target: DeleteTarget | null) => {
    if (!target) return;

    if (target.type === "task") {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== target.id));
    } else {
      setGroups(prevGroups => deleteGroupFromState(prevGroups, target.id));
      setTasks(prevTasks => cleanupTasksAfterGroupDelete(prevTasks, target.id));
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