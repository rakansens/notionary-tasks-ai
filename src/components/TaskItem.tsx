import { Check, MoreHorizontal, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TaskInput } from "./TaskInput";
import type { Task } from "@/hooks/useTaskManager";

interface TaskItemProps {
  task: Task;
  editingTaskId: number | null;
  setEditingTaskId: (id: number | null) => void;
  toggleTask: (id: number, parentId?: number) => void;
  updateTaskTitle: (id: number, title: string, parentId?: number) => void;
  deleteTask: (id: number, parentId?: number) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
}

export const TaskItem = ({
  task,
  editingTaskId,
  setEditingTaskId,
  toggleTask,
  updateTaskTitle,
  deleteTask,
  newTask,
  setNewTask,
  addTask,
}: TaskItemProps) => {
  const handleAddSubtask = () => {
    // まず新しいサブタスクを追加
    addTask(task.groupId, task.id);
    
    // 少し遅延を入れて、状態が更新された後に最後のサブタスクを編集モードにする
    setTimeout(() => {
      if (task.subtasks && task.subtasks.length > 0) {
        const lastSubtask = task.subtasks[task.subtasks.length - 1];
        if (lastSubtask) {
          setEditingTaskId(lastSubtask.id);
        }
      }
    }, 0);
  };

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "flex items-center gap-1 p-1.5 rounded-lg transition-all duration-200",
          "hover:bg-muted/50 group"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-5 w-5 rounded-md border transition-colors duration-200",
            task.completed ? "bg-primary border-primary" : "border-input"
          )}
          onClick={() => toggleTask(task.id)}
        >
          {task.completed && <Check className="h-3 w-3 text-primary-foreground" />}
        </Button>
        
        {editingTaskId === task.id ? (
          <Input
            value={task.title}
            onChange={(e) => updateTaskTitle(task.id, e.target.value)}
            onBlur={() => setEditingTaskId(null)}
            onKeyPress={(e) => e.key === "Enter" && setEditingTaskId(null)}
            className="flex-1 h-6 py-0"
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "flex-1 transition-all duration-200 cursor-pointer",
              task.completed && "line-through text-muted-foreground"
            )}
            onClick={() => setEditingTaskId(task.id)}
          >
            {task.title}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={handleAddSubtask}
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={() => deleteTask(task.id)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => deleteTask(task.id)}>
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="pl-6 space-y-0.5">
          {task.subtasks.map(subtask => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              toggleTask={(id) => toggleTask(id, task.id)}
              updateTaskTitle={(id, title) => updateTaskTitle(id, title, task.id)}
              deleteTask={(id) => deleteTask(id, task.id)}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
            />
          ))}
        </div>
      )}

      {editingTaskId === task.id && (
        <div className="pl-6">
          <TaskInput
            value={newTask}
            onChange={setNewTask}
            onSubmit={() => addTask(task.groupId, task.id)}
          />
        </div>
      )}
    </div>
  );
};