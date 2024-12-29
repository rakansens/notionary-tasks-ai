export interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
  parentId?: number;
  subtasks?: Task[];
  order?: number;
}

export interface Group {
  id: number;
  name: string;
}

export interface DeleteTarget {
  type: "task" | "group";
  id: number;
}