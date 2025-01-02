export interface Task {
  id: number;
  title: string;
  completed: boolean;
  order: number;
  groupId?: number;
  parentId?: number;
  hierarchyLevel: number;
  addedAt: Date;
  subtasks?: Task[];
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

export interface TaskEventData {
  taskId: number;
  title: string;
  completed: boolean;
  order: number;
  groupId?: number;
  parentId?: number;
  hierarchyLevel: number;
}

export interface SubtaskInsertData {
  title: string;
  completed: boolean;
  order_position: number;
  group_id: number | null;
  parent_id: number | null;
  hierarchy_level: number;
  parent_title: string | null;
}

export interface TaskInsertData {
  title: string;
  completed: boolean;
  order_position: number;
  group_id: number | null;
  parent_id: number | null;
  hierarchy_level: number;
}