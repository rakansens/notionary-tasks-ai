import { Group } from './types';
import { useGroupOperations } from './useGroupOperations';
import { useToast } from "@/components/ui/use-toast";

export const useGroupManager = (
  groups: Group[],
  setGroups: (groups: Group[]) => void,
  newGroup: string,
  setNewGroup: (value: string) => void,
  setIsAddingGroup: (value: boolean) => void,
) => {
  const groupOperations = useGroupOperations();
  const { toast } = useToast();

  const addGroup = async () => {
    const trimmedGroupName = newGroup.trim();
    if (!trimmedGroupName) {
      toast({
        title: "エラー",
        description: "グループ名を入力してください",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding new group:', trimmedGroupName);
      
      const newGroupData: Omit<Group, "id"> = {
        name: trimmedGroupName,
        order: groups.length,
      };

      const savedGroup = await groupOperations.addGroupToSupabase(newGroupData);
      console.log('Group saved to Supabase:', savedGroup);
      
      if (savedGroup && savedGroup.id) {
        const group: Group = {
          id: savedGroup.id,
          name: savedGroup.name,
          order: savedGroup.order_position,
        };
        
        setGroups(prevGroups => [...prevGroups, group]);
        
        setNewGroup("");
        setIsAddingGroup(false);

        // 成功通知は全ての処理が完了した後に表示
        toast({
          title: "成功",
          description: "グループを追加しました",
        });
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

  const updateGroupName = async (id: number, name: string) => {
    try {
      await groupOperations.updateGroupNameInSupabase(id, name);
      
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
      const groupToDelete = groups.find(g => g.id === id);
      if (groupToDelete) {
        await groupOperations.deleteGroupFromSupabase(id);
      }
      setGroups(prevGroups => prevGroups.filter(group => group.id !== id));
      
      toast({
        title: "成功",
        description: "グループを削除しました",
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

  const updateGroupOrder = async (updatedGroups: Group[]) => {
    try {
      const updatedGroupsWithOrder = updatedGroups.map((group, index) => ({
        ...group,
        order: index,
      }));
      setGroups(updatedGroupsWithOrder);
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