import { Group } from "./types";
import { useGroupOperations } from "./useGroupOperations";
import { useTaskEvents } from "./useTaskEvents";
import { useToast } from "@/components/ui/use-toast";

export const useGroupCrud = (
  groups: Group[],
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  newGroup: string,
  setNewGroup: (value: string) => void,
  setIsAddingGroup: (value: boolean) => void,
) => {
  const groupOperations = useGroupOperations();
  const taskEvents = useTaskEvents();
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
        taskEvents.emitGroupAdded(group);
        
        toast({
          title: "成功",
          description: "グループを追加しました",
        });
        
        setNewGroup("");
        setIsAddingGroup(false);
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

  return {
    addGroup,
    updateGroupName,
  };
};