import { Task, Group } from "@/hooks/taskManager/types";
import { TaskItem } from "./TaskItem";
import { Folder } from "lucide-react";

interface TaskDragOverlayProps {
  activeId: string | null;
  tasks: Task[];
  groups: Group[];
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  deleteTask: (id: number, parentId?: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
}

export const TaskDragOverlay = ({
  activeId,
  tasks,
  groups,
  editingTaskId,
  addingSubtaskId,
  setEditingTaskId,
  setAddingSubtaskId,
  toggleTask,
  updateTaskTitle,
  deleteTask,
  newTask,
  setNewTask,
  addTask,
}: TaskDragOverlayProps) => {
  if (!activeId) return null;

  if (activeId.startsWith('group-')) {
    const groupId = Number(activeId.replace('group-', ''));
    const group = groups.find(g => g.id === groupId);
    
    return group ? (
      <div className="shadow-lg rounded-md bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">{group.name}</h3>
        </div>
      </div>
    ) : null;
  }

  const task = tasks.find(t => t.id.toString() === activeId);
  if (!task) return null;

  return (
    <div className="shadow-lg rounded-md bg-white">
      <TaskItem
        task={task}
        editingTaskId={editingTaskId}
        addingSubtaskId={addingSubtaskId}
        setEditingTaskId={setEditingTaskId}
        setAddingSubtaskId={setAddingSubtaskId}
        toggleTask={toggleTask}
        updateTaskTitle={updateTaskTitle}
        deleteTask={deleteTask}
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
      />
    </div>
  );
};