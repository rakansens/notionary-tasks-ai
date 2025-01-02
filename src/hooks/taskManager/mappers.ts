import { Task, Group } from './types';

export const mapSupabaseTaskToTask = (task: any): Task => ({
  id: task.id,
  title: task.title,
  completed: task.completed,
  order: task.order_position,
  groupId: task.group_id,
  parentId: task.parent_id,
  hierarchyLevel: task.hierarchy_level,
  addedAt: new Date(task.created_at),
});

export const mapSupabaseGroupToGroup = (group: any): Group => ({
  id: group.id,
  name: group.name,
  order: group.order_position,
});