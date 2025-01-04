export interface Task {
  id: number;
  title: string;
  status: string;
  group_id?: number;
  parent_task_id?: number;
  subtasks?: Task[];
  level: number;
  user_id: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Group {
  id: number;
  group_name: string;
  owner_user_id?: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DeleteTarget {
  type: "task" | "group";
  id: number;
}

export interface TaskManagerOperations {
  addTask: (group_id?: number, parent_task_id?: number, title?: string) => void;
  toggleTask: (id: number, parent_task_id?: number) => void;
  updateTaskTitle: (id: number, title: string, parent_task_id?: number) => void;
  deleteTask: (id: number, parent_task_id?: number) => void;
  addGroup: (group_name: string) => void;
  updateGroupName: (id: number, group_name: string) => void;
  deleteGroup: (id: number) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  updateTaskOrder: (tasks: Task[]) => void;
  updateGroupOrder: (groups: Group[]) => void;
  toggleGroupCollapse: (group_id: number) => void;
}