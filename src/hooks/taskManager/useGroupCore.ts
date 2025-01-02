import { Group } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { useGroupOperations } from "./useGroupOperations";
import { deleteGroup } from "./groupOperations";

export const useGroupCore = (
  groups: Group[],
  setGroups: (groups: Group[]) => void,
  setTasks: (tasks: Task[]) => void,
  setNewGroup: (value: string) => void,
  setIsAddingGroup: (value: boolean) => void,
  setDeleteTarget: (target: { type: "task" | "group"; id: number } | null) => void
) => {
  const { toast } = useToast();
  const groupOperations = useGroupOperations();

  const addGroup = async (name: string) => {
    if (!name.trim()) return;

    try {
      const newGroup: Omit<Group, "id"> = {
        name: name.trim(),
        order: groups.length,
      };

      const savedGroup = await groupOperations.addGroupToSupabase(newGroup);
      
      if (savedGroup && savedGroup.id) {
        const group: Group = {
          id: savedGroup.id,
          name: savedGroup.name,
          order: savedGroup.order_position,
        };
        
        setGroups([...groups, group]);
        
        toast({
          title: "成功",
          description: `グループ「${name.trim()}」を追加しました`,
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

  const handleGroupDelete = async (id: number) => {
    try {
      const groupToDelete = groups.find(g => g.id === id);
      if (!groupToDelete) return;

      await deleteGroup(id);

      setGroups(groups.filter(g => g.id !== id));
      setTasks(tasks => tasks.filter(t => t.groupId !== id));

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

  const updateGroupName = async (id: number, name: string) => {
    try {
      await groupOperations.updateGroupNameInSupabase(id, name);
      setGroups(groups.map(group =>
        group.id === id ? { ...group, name } : group
      ));
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
    handleGroupDelete,
    updateGroupName,
  };
};