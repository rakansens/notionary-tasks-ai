import { supabase } from "@/integrations/supabase/client";
import { Group } from "./types";
import { toast } from "@/components/ui/use-toast";

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