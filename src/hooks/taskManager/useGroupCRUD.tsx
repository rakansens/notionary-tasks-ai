import { Group, Task } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { addGroupToSupabase, deleteGroupFromState, cleanupTasksAfterGroupDelete } from './groupOperations';

export const useGroupCRUD = (
  groups: Group[],
  tasks: Task[],
  setGroups: (groups: Group[]) => void,
  setTasks: (tasks: Task[]) => void,
  setNewGroup: (value: string) => void,
  setIsAddingGroup: (value: boolean) => void,
  setDeleteTarget: (target: { type: string; id: number } | null) => void,
) => {
  const { toast } = useToast();

  const addGroup = async () => {
    const savedGroup = await addGroupToSupabase(groups.length.toString(), groups.length);
    
    if (savedGroup) {
      setGroups(prevGroups => [...prevGroups, savedGroup]);
      setNewGroup("");
      setIsAddingGroup(false);
    }
  };

  const updateGroupName = async (id: number, name: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      
      setGroups(prevGroups =>
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
  };

  const deleteGroup = async (id: number) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGroups(prevGroups => deleteGroupFromState(prevGroups, id));
      setTasks(prevTasks => cleanupTasksAfterGroupDelete(prevTasks, id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "エラー",
        description: "グループの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  return {
    addGroup,
    updateGroupName,
    deleteGroup,
  };
};