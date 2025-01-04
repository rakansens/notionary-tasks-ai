import { supabase } from "@/integrations/supabase/client";
import { Task, Group } from "./types";

export const addTaskToSupabase = async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: task.title,
      status: task.status,
      level: task.level,
      group_id: task.group_id,
      parent_task_id: task.parent_task_id,
      user_id: task.user_id,
      description: task.description
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleTaskInSupabase = async (id: number, status: string) => {
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
};

export const updateTaskTitleInSupabase = async (id: number, title: string) => {
  const { error } = await supabase
    .from("tasks")
    .update({ title })
    .eq("id", id);

  if (error) throw error;
};

export const deleteTaskFromSupabase = async (id: number) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const addGroupToSupabase = async (group: Omit<Group, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase
    .from("groups")
    .insert({
      group_name: group.group_name,
      owner_user_id: group.owner_user_id,
      description: group.description
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGroupNameInSupabase = async (id: number, group_name: string) => {
  const { error } = await supabase
    .from("groups")
    .update({ group_name })
    .eq("id", id);

  if (error) throw error;
};

export const deleteGroupFromSupabase = async (id: number) => {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const fetchInitialData = async () => {
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .order("level");

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*");

  if (tasksError) throw tasksError;
  if (groupsError) throw groupsError;

  return { tasks, groups };
};