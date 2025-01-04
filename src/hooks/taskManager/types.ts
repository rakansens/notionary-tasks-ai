export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
  parentId?: number;
  subtasks?: Task[];
  order: number;
  addedAt: Date;
  hierarchyLevel: number;
  level: number;
  description?: string;
}

export interface Group {
  id: number;
  name: string;
  order: number;
  description?: string;
}

export interface DeleteTarget {
  type: "task" | "group";
  id: number;
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