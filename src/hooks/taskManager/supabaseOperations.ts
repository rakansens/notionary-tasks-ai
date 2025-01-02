import { supabase } from "@/integrations/supabase/client";
import { Task, Group } from "../taskManager/types";

export const fetchInitialData = async () => {
  try {
    const [tasksResponse, groupsResponse] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .order('order_position'),
      supabase
        .from('groups')
        .select('*')
        .order('order_position')
    ]);

    if (tasksResponse.error) throw tasksResponse.error;
    if (groupsResponse.error) throw groupsResponse.error;

    const tasks = tasksResponse.data;
    const groups = groupsResponse.data;

    // サブタスクを含む階層構造を構築
    const tasksWithHierarchy = buildTaskHierarchy(tasks);
    console.log('Fetched tasks with hierarchy:', tasksWithHierarchy);

    return {
      tasks: tasksWithHierarchy,
      groups: groups,
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    throw error;
  }
};

// 階層構造を構築するヘルパー関数
const buildTaskHierarchy = (tasks: any[]): Task[] => {
  const taskMap = new Map();
  const rootTasks: Task[] = [];

  // まず全てのタスクをマップに格納
  tasks.forEach(task => {
    taskMap.set(task.id, {
      ...task,
      subtasks: [],
      order: task.order_position,
    });
  });

  // 親子関係を構築
  tasks.forEach(task => {
    const taskWithSubtasks = taskMap.get(task.id);
    if (task.parent_id) {
      const parentTask = taskMap.get(task.parent_id);
      if (parentTask) {
        parentTask.subtasks.push(taskWithSubtasks);
      }
    } else {
      rootTasks.push(taskWithSubtasks);
    }
  });

  console.log('Built task hierarchy:', rootTasks);
  return rootTasks;
};