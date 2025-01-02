import { Task } from "@/hooks/taskManager/types";
import { DraggableTask } from "./DraggableTask";
import { SubtaskDndProvider } from "./subtask/SubtaskDndContext";
import { SubtaskContainer } from "./subtask/SubtaskContainer";
import { useCollapsedState } from "@/hooks/taskManager/useCollapsedState";
import { useTaskSort } from "@/contexts/TaskSortContext";

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
  isCollapsed?: boolean;
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
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
  isCollapsed,
  onReorderSubtasks,
}: SubtaskListProps) => {
  const { isCollapsed: localIsCollapsed, toggleCollapse } = useCollapsedState();
  const { reorderSubtasks } = useTaskSort();
  
  if (!subtasks || subtasks.length === 0) return null;
  if (isCollapsed || localIsCollapsed(parentTask.id)) return null;

  return (
    <SubtaskContainer onClick={(e) => e.stopPropagation()}>
      <SubtaskDndProvider
        subtasks={subtasks}
        parentTask={parentTask}
        onReorderSubtasks={(startIndex, endIndex) => 
          reorderSubtasks(startIndex, endIndex, parentTask.id)
        }
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
            isCollapsed={localIsCollapsed(subtask.id)}
            onToggleCollapse={() => toggleCollapse(subtask.id)}
            onReorderSubtasks={onReorderSubtasks}
          />
        ))}
      </SubtaskDndProvider>
    </SubtaskContainer>
  );
};