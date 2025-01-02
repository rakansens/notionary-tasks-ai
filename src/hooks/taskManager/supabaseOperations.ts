import { supabase } from "@/integrations/supabase/client";
import { Task, Group } from "./types";

export const addTaskToSupabase = async (task: Omit<Task, "id" | "addedAt">) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: task.title,
      completed: task.completed,
      order_position: task.order,
      group_id: task.groupId,
      parent_id: task.parentId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleTaskInSupabase = async (id: number, completed: boolean) => {
  const { error } = await supabase
    .from("tasks")
    .update({ completed })
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

export const addGroupToSupabase = async (group: Omit<Group, "id">) => {
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: group.name,
      order_position: group.order,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGroupNameInSupabase = async (id: number, name: string) => {
  const { error } = await supabase
    .from("groups")
    .update({ name })
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
    .order("order_position");

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .order("order_position");

  if (tasksError) throw tasksError;
  if (groupsError) throw groupsError;

  return { tasks, groups };
};