import { Task } from "@/hooks/useTaskManager";
import { TaskItem } from "./TaskItem";

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
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

export const SubtaskList = ({
  parentTask,
  subtasks,
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
}: SubtaskListProps) => {
  if (!subtasks || subtasks.length === 0) return null;

  return (
    <div className="pl-6 space-y-0.5">
      {subtasks.map(subtask => (
        <TaskItem
          key={subtask.id}
          task={subtask}
          editingTaskId={editingTaskId}
          addingSubtaskId={addingSubtaskId}
          setEditingTaskId={setEditingTaskId}
          setAddingSubtaskId={setAddingSubtaskId}
          toggleTask={(id) => toggleTask(id, parentTask.id)}
          updateTaskTitle={(id, title) => updateTaskTitle(id, title, parentTask.id)}
          deleteTask={(id) => deleteTask(id, parentTask.id)}
          newTask={newTask}
          setNewTask={setNewTask}
          addTask={addTask}
        />
      ))}
    </div>
  );
};