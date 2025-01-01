import { Task } from "@/hooks/useTaskManager";
import { DraggableTask } from "../DraggableTask";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface GroupContentProps {
  groupId: number;
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

export const GroupContent = ({
  groupId,
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
}: GroupContentProps) => {
  const groupTasks = tasks
    .filter(task => task.groupId === groupId && !task.parentId)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-1">
      <SortableContext
        items={groupTasks.map(task => task.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        {groupTasks.map(task => (
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
    </div>
  );
};