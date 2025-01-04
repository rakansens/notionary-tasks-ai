import { Task, Group } from './models';

export interface TaskResponse {
  id: number;
  title: string;
  completed: boolean;
  order_position: number;
  group_id: number | null;
  parent_id: number | null;
  level: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  order_position: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskManagerOperations {
  addTask: (groupId?: number, parentId?: number, title?: string) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  deleteTask: (id: number, parentId?: number) => void;
  addGroup: (name: string) => void;
  updateGroupName: (id: number, name: string) => void;
  deleteGroup: (id: number) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  updateTaskOrder: (tasks: Task[]) => void;
  updateGroupOrder: (groups: Group[]) => void;
  toggleGroupCollapse: (groupId: number) => void;
}