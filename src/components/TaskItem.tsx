import { Task } from "@/types/models";
import { TaskCheckbox } from "./task/TaskCheckbox";
import { TaskTitle } from "./task/TaskTitle";
import { TaskItemActions } from "./task/TaskItemActions";
import { TaskSubtaskInput } from "./task/TaskSubtaskInput";
import { useTaskItemHandlers } from "@/hooks/task/useTaskItemHandlers";
import { GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TaskItemProps {
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
  dragHandleProps?: Record<string, any>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TaskItem = ({
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
  dragHandleProps,
  isCollapsed,
  onToggleCollapse,
}: TaskItemProps) => {
  const { toast } = useToast();
  const isEditing = editingTaskId === task.id;
  const isAddingSubtask = addingSubtaskId === task.id;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const {
    handleKeyDown,
    handleBlur,
  } = useTaskItemHandlers(
    task,
    parentTask,
    updateTaskTitle,
    setEditingTaskId,
    setAddingSubtaskId,
    addTask
  );

  const handleAddSubtask = () => {
    // レベルチェックを追加
    const currentLevel = task.level || 1;
    if (currentLevel >= 2) {
      toast({
        title: "エラー",
        description: "これ以上深い階層のサブタスクは作成できません",
        variant: "destructive",
      });
      return;
    }

    console.log('Adding subtask to:', {
      taskId: task.id,
      taskLevel: task.level,
      parentTaskId: parentTask?.id,
      parentTaskLevel: parentTask?.level
    });

    setAddingSubtaskId(task.id);
  };

  return (
    <div className="group flex items-center gap-2 py-0.5">
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="touch-none cursor-grab p-2 hover:bg-notion-hover rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <GripVertical className="h-4 w-4 text-notion-secondary" />
        </div>
      )}
      
      <TaskCheckbox
        completed={task.completed}
        onClick={() => toggleTask(task.id, parentTask?.id)}
      />

      <div className="flex-1 min-w-0">
        <TaskTitle
          title={task.title}
          completed={task.completed}
          isEditing={isEditing}
          hasSubtasks={hasSubtasks}
          isCollapsed={isCollapsed || false}
          onTitleChange={() => {}}
          onTitleClick={() => setEditingTaskId(task.id)}
          onBlur={handleBlur}
          onKeyPress={handleKeyDown}
          onToggleCollapse={onToggleCollapse || (() => {})}
          hierarchyLevel={task.level || 0}
        />
        
        {isAddingSubtask && (
          <TaskSubtaskInput
            task={task}
            newTask={newTask}
            setNewTask={setNewTask}
            addTask={addTask}
            setAddingSubtaskId={setAddingSubtaskId}
          />
        )}
      </div>

      <TaskItemActions
        onAddSubtask={handleAddSubtask}
        onDelete={() => deleteTask(task.id, parentTask?.id)}
        onDropdownDelete={() => deleteTask(task.id, parentTask?.id)}
      />
    </div>
  );
};