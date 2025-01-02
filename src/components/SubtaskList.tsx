import { Task } from "@/hooks/taskManager/types";
import { DraggableTask } from "./DraggableTask";
import { SubtaskDndContext } from "./subtask/SubtaskDndContext";
import { SubtaskContainer } from "./subtask/SubtaskContainer";
import { useState } from "react";

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
  
  console.log('SubtaskList - parentTask:', parentTask.id, 'subtasks:', subtasks);
  console.log('SubtaskList - isCollapsed:', isCollapsed); // デバッグ用
  
  if (isCollapsed) return null;
  if (!subtasks || subtasks.length === 0) return null;

  return (
    <SubtaskContainer onClick={(e) => e.stopPropagation()}>
      <SubtaskDndContext
        subtasks={subtasks}
        parentTask={parentTask}
        onReorderSubtasks={onReorderSubtasks}
      >
        {subtasks.map(subtask => (
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
            onToggleCollapse={() => {
              console.log('Toggling collapse state from:', isCollapsed, 'to:', !isCollapsed); // デバッグ用
              setIsCollapsed(!isCollapsed);
            }}
          />
        ))}
      </SubtaskDndContext>
    </SubtaskContainer>
  );
};