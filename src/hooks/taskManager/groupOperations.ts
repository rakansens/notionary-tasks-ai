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

    const updates = updatedGroups.map(group => ({
      name: group.name,
      order_position: group.order,
    }));

    for (const [index, group] of updatedGroups.entries()) {
      const { error } = await supabase
        .from('groups')
        .update(updates[index])
        .eq('id', group.id);

      if (error) throw error;
    }

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