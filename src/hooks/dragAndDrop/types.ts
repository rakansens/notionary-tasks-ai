export interface DragAndDropState {
  activeId: string | null;
}

export type UpdateTaskOrderFn = (tasks: Task[]) => void;
export type UpdateGroupOrderFn = (groups: Group[]) => void;

import { Task, Group } from "../taskManager/types";