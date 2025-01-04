import { Tables } from "@/integrations/supabase/types";
import { Task, Group } from "@/types/models";

export const mapSupabaseTaskToTask = (task: Tables<"tasks">): Task => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  order: task.order_position,
  groupId: task.group_id || undefined,
  parentId: task.parent_id || undefined,
  level: task.level,
  addedAt: new Date(task.created_at),
  description: task.description || undefined,
});

export const mapSupabaseGroupToGroup = (group: Tables<"groups">): Group => ({
  id: group.id,
  name: group.name,
  order: group.order_position,
  description: group.description || undefined,
});
