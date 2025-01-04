import { Tables } from "@/integrations/supabase/types";
import { Task, Group } from "./types";

export const mapSupabaseTaskToTask = (task: Tables<"tasks">): Task => ({
  id: task.id,
  title: task.title,
  status: task.status || 'open',
  group_id: task.group_id,
  parent_task_id: task.parent_task_id,
  level: task.level,
  user_id: task.user_id,
  description: task.description,
  created_at: new Date(task.created_at),
  updated_at: new Date(task.updated_at)
});

export const mapSupabaseGroupToGroup = (group: Tables<"groups">): Group => ({
  id: group.id,
  group_name: group.group_name,
  order_position: group.order_position || 0,
  owner_user_id: group.owner_user_id,
  description: group.description,
  created_at: new Date(group.created_at),
  updated_at: new Date(group.updated_at)
});