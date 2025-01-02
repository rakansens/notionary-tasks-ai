export interface Task {
  id: number;
  title: string;
  completed: boolean;
  order: number;
  groupId: number | null;
  parentId: number | null;
  hierarchyLevel: number;
  addedAt: Date;
  subtasks?: Task[];
}

export interface Group {
  id: number;
  name: string;
  order: number;
}

export type DeleteTarget = {
  type: "task" | "group";
  id: number;
} | null;

export interface TaskManagerOperations {
  addTask: (groupId?: number, parentId?: number, title?: string) => void;
  toggleTask: (taskId: number, parentId?: number) => void;
  updateTaskTitle: (taskId: number, title: string) => void;
  deleteTask: (taskId: number) => void;
  addGroup: (name: string) => void;
  deleteGroup: (id: number) => void;
  updateGroupName: (groupId: number, name: string) => void;
  updateTaskOrder: (tasks: Task[]) => void;
  updateGroupOrder: (groups: Group[]) => void;
  toggleGroupCollapse: (groupId: number) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}