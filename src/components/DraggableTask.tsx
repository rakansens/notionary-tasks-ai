import { Task } from "@/hooks/useTaskManager";
import { TaskItem } from "./TaskItem";
import { SubtaskList } from "./SubtaskList";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableTaskProps {
  task: Task;
  parentTask?: Task;
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
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
}

export const DraggableTask = ({
  task,
  parentTask,
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
}: DraggableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id.toString(),
    transition: {
      duration: 150,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 999 : "auto",
    backgroundColor: isDragging ? "white" : "transparent",
    touchAction: "none",
  };

  console.log('DraggableTask rendering:', task.id, 'subtasks:', task.subtasks);

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`${isDragging ? "shadow-lg rounded-md" : ""}`}
    >
      <TaskItem
        task={task}
        parentTask={parentTask}
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
        dragHandleProps={{ ...attributes, ...listeners }}
      />
      {task.subtasks && task.subtasks.length > 0 && (
        <SubtaskList
          parentTask={task}
          subtasks={task.subtasks}
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
      )}
    </div>
  );
};