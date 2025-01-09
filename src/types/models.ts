export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number | null;
  parentId?: number | null;
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

export interface TaskUpdate {
  id: number;
  order?: number;
  groupId?: number | null;
  parentId?: number | null;
  level?: number;
  subtasks?: Task[];
}