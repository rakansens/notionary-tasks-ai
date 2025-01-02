import { Task, Group } from "../taskManager/types";

export type DraggableItem = Task | Group;

export interface DragAndDropState {
  activeId: string | null;
}

export interface OrderUpdate {
  id: number;
  order: number;
  groupId?: number;
  parentId?: number;
}

export interface DragAndDropOptions {
  parentId?: number;
  groupId?: number;
  onOrderUpdate?: (updates: OrderUpdate[]) => void;
}

export type UpdateOrderFn = (items: DraggableItem[]) => void;
export type UpdateTaskOrderFn = (tasks: Task[]) => void;
export type UpdateGroupOrderFn = (groups: Group[]) => void;