export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
  parentId?: number;
  subtasks?: Task[];
  order: number;
  addedAt: Date; // Add this line
}

export interface Group {
  id: number;
  name: string;
  order: number;
}

export interface DeleteTarget {
  type: "task" | "group";
  id: number;
}