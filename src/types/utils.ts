import { Task } from './models';

export type TaskHierarchy = Task & {
  subtasks?: TaskHierarchy[];
};

export type TaskUpdateFunction = (task: Task) => Task;
export type TasksUpdateFunction = (tasks: Task[]) => Task[];

export interface TaskState {
  tasks: Task[];
  newTask: string;
  editingTaskId: number | null;
  addingSubtaskId: number | null;
}

export interface GroupState {
  groups: Group[];
  newGroup: string;
  isAddingGroup: boolean;
  editingGroupId: number | null;
  collapsedGroups: Set<number>;
}

export interface DeleteState {
  deleteTarget: { type: string; id: number } | null;
}