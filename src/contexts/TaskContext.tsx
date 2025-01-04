import { createContext, useContext } from "react";
import type { Task, Group } from "@/types/models";
import type { TaskManagerOperations } from "@/types/api";

interface TaskContextType extends TaskManagerOperations {
  tasks: Task[];
  groups: Group[];
  newTask: string;
  newGroup: string;
  isAddingGroup: boolean;
  editingTaskId: number | null;
  editingGroupId: number | null;
  addingSubtaskId: number | null;
  deleteTarget: { type: string; id: number } | null;
  collapsedGroups: Set<number>;
  setNewTask: (value: string) => void;
  setNewGroup: (value: string) => void;
  setIsAddingGroup: (value: boolean) => void;
  setEditingTaskId: (id: number | null) => void;
  setEditingGroupId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  handleReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
  updateTaskOrder: (tasks: Task[]) => void;
  addGroup: (name: string) => void;
}

export const TaskContext = createContext<TaskContextType | null>(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskStateProvider");
  }
  return context;
};