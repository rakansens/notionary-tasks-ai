import { Task, Group } from "@/types/models";

export type DraggableItem = Task | Group;

export interface DragAndDropState {
  activeId: string | null;
}

export interface OrderUpdate {
  id: number;
  order: number;
  groupId?: number;
  parentId?: number;
  level?: number;
  subtasks?: Task[];
}

export function isTask(item: DraggableItem): item is Task {
  return 'level' in item && 'parentId' in item;
}

export function isGroup(item: DraggableItem): item is Group {
  return !('level' in item) && !('parentId' in item);
}

export interface DragAndDropOptions {
  parentId?: number;
  groupId?: number;
  onOrderUpdate?: (updates: OrderUpdate[]) => void;
}

export type UpdateOrderFn = (items: DraggableItem[]) => void;
export type UpdateTaskOrderFn = (tasks: Task[]) => void;
export type UpdateGroupOrderFn = (groups: Group[]) => void;
