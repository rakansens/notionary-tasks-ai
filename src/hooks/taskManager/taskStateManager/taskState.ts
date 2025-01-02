import { Task, Group } from '../types';

export interface TaskState {
  tasks: Task[];
  groups: Group[];
  newTask: string;
  newGroup: string;
  isAddingGroup: boolean;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  deleteTarget: { type: "task" | "group"; id: number } | null;
  collapsedGroups: Set<number>;
}

export const initialTaskState: TaskState = {
  tasks: [],
  groups: [],
  newTask: "",
  newGroup: "",
  isAddingGroup: false,
  editingTaskId: null,
  editingGroupId: null,
  addingSubtaskId: null,
  deleteTarget: null,
  collapsedGroups: new Set(),
};