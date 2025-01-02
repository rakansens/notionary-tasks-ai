import { Database } from "@/integrations/supabase/types";

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export const mapSupabaseTaskToTask = (task: Tables<"tasks">): Task => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  order: task.order_position,
  groupId: task.group_id,
  parentId: task.parent_id,
  hierarchyLevel: task.hierarchy_level,
  addedAt: new Date(task.created_at),
});

export const mapSupabaseGroupToGroup = (group: Tables<"groups">): Group => ({
  id: group.id,
  name: group.name,
  order: group.order_position,
});