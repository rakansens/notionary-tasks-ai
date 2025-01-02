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
      hierarchy_level: task.hierarchyLevel,
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
  // まず、すべてのタスクを取得
  const { data: allTasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .order("order_position");

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .order("order_position");

  if (tasksError) throw tasksError;
  if (groupsError) throw groupsError;

  // タスクの階層構造を構築
  const tasks = buildTaskHierarchy(allTasks || []);

  return { tasks, groups };
};

// タスクの階層構造を構築するヘルパー関数
const buildTaskHierarchy = (tasks: any[]): any[] => {
  const taskMap = new Map();
  const rootTasks: any[] = [];

  // まず、すべてのタスクをマップに追加
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, subtasks: [] });
  });

  // 親子関係を構築
  tasks.forEach(task => {
    const taskWithSubtasks = taskMap.get(task.id);
    if (task.parent_id === null) {
      rootTasks.push(taskWithSubtasks);
    } else {
      const parentTask = taskMap.get(task.parent_id);
      if (parentTask) {
        parentTask.subtasks.push(taskWithSubtasks);
      }
    }
  });

  // サブタスクを順序で並び替え
  const sortSubtasks = (tasks: any[]) => {
    tasks.sort((a, b) => a.order_position - b.order_position);
    tasks.forEach(task => {
      if (task.subtasks.length > 0) {
        sortSubtasks(task.subtasks);
      }
    });
  };

  sortSubtasks(rootTasks);
  
  console.log('Hierarchical tasks:', rootTasks);
  return rootTasks;
};