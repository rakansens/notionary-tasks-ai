import { Task } from "@/hooks/taskManager/types";
import { DraggableTask } from "./DraggableTask";
import { SubtaskDndProvider } from "./subtask/SubtaskDndContext";
import { SubtaskContainer } from "./subtask/SubtaskContainer";
import { useState, useEffect } from "react";

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
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
  isCollapsed?: boolean;
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
  onReorderSubtasks,
  isCollapsed: propIsCollapsed,
}: SubtaskListProps) => {
  const [isCollapsed, setIsCollapsed] = useState(propIsCollapsed || false);
  const [localSubtasks, setLocalSubtasks] = useState<Task[]>(subtasks);
  
  useEffect(() => {
    setLocalSubtasks(subtasks);
  }, [subtasks]);

  if (isCollapsed) return null;
  if (!localSubtasks || localSubtasks.length === 0) return null;

  return (
    <SubtaskContainer onClick={(e) => e.stopPropagation()}>
      <SubtaskDndProvider
        subtasks={localSubtasks}
        parentTask={parentTask}
        onReorderSubtasks={onReorderSubtasks}
      >
        {localSubtasks.map(subtask => (
          <DraggableTask
            key={subtask.id}
            task={subtask}
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
            onReorderSubtasks={onReorderSubtasks}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        ))}
      </SubtaskDndProvider>
    </SubtaskContainer>
  );
};