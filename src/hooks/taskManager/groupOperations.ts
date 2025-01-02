import { Group, Task } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const deleteGroupFromState = (groups: Group[], groupId: number): Group[] => {
  return groups.filter(group => group.id !== groupId);
};

export const cleanupTasksAfterGroupDelete = (tasks: Task[], groupId: number): Task[] => {
  return tasks.filter(task => task.groupId !== groupId);
};

export const updateGroupOrder = async (groups: Group[], setGroups: (groups: Group[]) => void) => {
  try {
    const updatedGroups = groups.map((group, index) => ({
      ...group,
      order: index,
    }));

    const { error } = await supabase
      .from('groups')
      .upsert(
        updatedGroups.map(group => ({
          id: group.id,
          name: group.name,
          order_position: group.order,
        }))
      );

    if (error) throw error;
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

export const addGroupToSupabase = async (
  newGroup: string,
  currentGroupsLength: number
): Promise<Group | null> => {
  try {
    const { data: savedGroup, error } = await supabase
      .from('groups')
      .insert({
        name: newGroup,
        order_position: currentGroupsLength,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding group:', error);
      toast({
        title: "エラー",
        description: "グループの追加に失敗しました",
        variant: "destructive",
      });
      return null;
    }

    if (savedGroup) {
      const group = { 
        id: savedGroup.id, 
        name: savedGroup.name,
        order: savedGroup.order_position 
      };
      
      toast({
        title: "成功",
        description: "グループを追加しました",
      });
      
      return group;
    }
    return null;
  } catch (error) {
    console.error('Error adding group:', error);
    toast({
      title: "エラー",
      description: "グループの追加に失敗しました",
      variant: "destructive",
    });
    return null;
  }
};