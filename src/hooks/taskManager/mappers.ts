import { Tables } from "@/integrations/supabase/types";
import { Task, Group } from "./types";

export const mapSupabaseTaskToTask = (task: Tables<"tasks">): Task => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  order: task.order_position,
  groupId: task.group_id,
  parentId: task.parent_id,
  hierarchyLevel: task.hierarchy_level,
  addedAt: new Date(task.created_at),
  subtasks: [], // 初期値として空の配列を設定
});

export const mapSupabaseGroupToGroup = (group: Tables<"groups">): Group => ({
  id: group.id,
  name: group.name,
  order: group.order_position,
});