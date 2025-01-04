import { Task, Group } from "../taskManager/types";

export type DraggableItem = Task | Group;

export type OrderUpdate = {
  id: number;
  sort_order: number;
  group_id?: number;
  parent_task_id?: number;
};

export type UpdateTaskOrderFn = (tasks: Task[]) => void;
export type UpdateGroupOrderFn = (groups: Group[]) => void;