import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Group } from '@/types/models';

export const useGroupOperations = (
  groups: Group[], 
  setGroups: (groups: Group[] | ((prev: Group[]) => Group[])) => void
) => {
  const { toast } = useToast();

  const addGroup = async (name: string) => {
    try {
      const maxOrder = Math.max(...groups.map(g => g.order), 0);
      const { data, error } = await supabase
        .from('groups')
        .insert([
          { 
            name,
            order_position: maxOrder + 1
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newGroup: Group = {
        id: data.id,
        name: data.name,
        order: data.order_position,
        description: data.description
      };

      setGroups(prevGroups => [...prevGroups, newGroup]);
      
      window.dispatchEvent(new CustomEvent('groupAdded'));
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "エラー",
        description: "グループの追加に失敗しました",
        variant: "destructive",
      });
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

      setGroups(prevGroups =>
        prevGroups.filter(group => group.id !== id)
      );
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "エラー",
        description: "グループの削除に失敗しました",
        variant: "destructive",
      });
    }
  };

  const updateGroupOrder = async (updatedGroups: Group[]) => {
    try {
      const promises = updatedGroups.map(group =>
        supabase
          .from('groups')
          .update({ order_position: group.order })
          .eq('id', group.id)
      );

      await Promise.all(promises);
      setGroups(updatedGroups);
    } catch (error) {
      console.error('Error updating group order:', error);
      toast({
        title: "エラー",
        description: "グループの順序の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  return {
    addGroup,
    updateGroupName,
    deleteGroup,
    updateGroupOrder,
  };
};