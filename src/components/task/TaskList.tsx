import { Task } from "@/hooks/taskManager/types";
import { DraggableTask } from "../DraggableTask";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface TaskListProps {
  tasks: Task[];
  editingTaskId: number | null;
  addingSubtaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  setAddingSubtaskId: (id: number | null) => void;
  toggleTask: (taskId: number) => void;
  updateTaskTitle: (taskId: number, title: string) => void;
  deleteTask: (taskId: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number) => void;
  onReorderSubtasks: (startIndex: number, endIndex: number, parentId: number) => void;
}

export const TaskList = ({
  tasks,
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
  onReorderSubtasks,
}: TaskListProps) => {
  const nonGroupTasks = tasks
    .filter(task => !task.groupId && !task.parentId)
    .sort((a, b) => a.order - b.order);

  return (
    <SortableContext
      items={nonGroupTasks.map(task => task.id.toString())}
      strategy={verticalListSortingStrategy}
    >
      {nonGroupTasks.map(task => (
        <DraggableTask
          key={task.id}
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
          onReorderSubtasks={onReorderSubtasks}
        />
      ))}
    </SortableContext>
  );
};