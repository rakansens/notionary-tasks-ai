import { Task, Group } from './types';
import { useToast } from "@/components/ui/use-toast";
import { useTaskOperations } from './useTaskOperations';
import { useGroupOperations } from './useGroupOperations';

export const useTaskEvents = (
  state: ReturnType<typeof useTaskState>['state'],
  setters: ReturnType<typeof useTaskState>['setters'],
  taskOperations: ReturnType<typeof useTaskOperations>,
  groupOperations: ReturnType<typeof useGroupOperations>
) => {
  const { toast } = useToast();

  const handleGroupDelete = async (id: number) => {
    try {
      const groupToDelete = state.groups.find(g => g.id === id);
      if (!groupToDelete) return;

      await groupOperations.deleteGroup(id);

      setters.setGroups(prevGroups => prevGroups.filter(g => g.id !== id));
      setters.setTasks(prevTasks => prevTasks.filter(t => t.groupId !== id));

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
      taskOperations.deleteTaskFromSupabase(state.deleteTarget.id);
    } else {
      handleGroupDelete(state.deleteTarget.id);
    }
    
    setters.setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setters.setDeleteTarget(null);
  };

  useEffect(() => {
    const handleAddGroup = async (event: CustomEvent<{ name: string }>) => {
      const { name } = event.detail;
      if (!name.trim()) return;

      try {
        const newGroup: Omit<Group, "id"> = {
          name: name.trim(),
          order: state.groups.length,
        };

        const savedGroup = await groupOperations.addGroupToSupabase(newGroup);
        
        if (savedGroup && savedGroup.id) {
          const group: Group = {
            id: savedGroup.id,
            name: savedGroup.name,
            order: savedGroup.order_position,
          };
          
          setters.setGroups(prevGroups => [...prevGroups, group]);
          
          toast({
            title: "成功",
            description: `グループ「${name.trim()}」を追加しました`,
          });
          
          window.dispatchEvent(new CustomEvent('groupAdded'));
          setters.setNewGroup('');
          setters.setIsAddingGroup(false);
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
  }, [state.groups.length]);

  return {
    handleGroupDelete,
    confirmDelete,
    cancelDelete,
  };
};