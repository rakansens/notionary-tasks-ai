export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
  parentId?: number;
  subtasks?: Task[];
  order: number;
  addedAt: Date;
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