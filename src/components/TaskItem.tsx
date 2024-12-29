import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TaskInput } from "./TaskInput";
import { TaskDropdownMenu } from "./TaskDropdownMenu";
import { SubtaskList } from "./SubtaskList";
import type { Task } from "@/hooks/useTaskManager";

interface TaskItemProps {
  task: Task;
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
  parentTask?: Task;
  groupName?: string;
}

export const TaskItem = ({
  task,
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
  parentTask,
  groupName,
}: TaskItemProps) => {
  const handleAddSubtask = () => {
    setAddingSubtaskId(task.id);
    setNewTask('');
  };

  const handleSubmitSubtask = () => {
    if (newTask.trim()) {
      addTask(task.groupId, task.id);
      setAddingSubtaskId(null);
      setNewTask('');
    }
  };

  const handleToggleTask = () => {
    toggleTask(task.id, task.parentId);
    if (!task.completed) {
      console.log('Task completed:', {
        id: task.id,
        title: task.title,
        parentTask: parentTask?.title,
        groupName: groupName
      });
      
      const completedTask = {
        id: task.id,
        title: task.title,
        completedAt: new Date(),
        parentTaskTitle: parentTask?.title,
        groupName: groupName,
      };
      
      window.dispatchEvent(new CustomEvent('taskCompleted', { 
        detail: completedTask,
        bubbles: true,  // イベントをバブリングさせる
        composed: true  // Shadow DOMの境界を越えてイベントを伝播させる
      }));
    }
  };

  const handleDelete = () => {
    deleteTask(task.id, task.parentId);
  };

  const handleDropdownDelete = () => {
    deleteTask(task.id, task.parentId);
  };

  const handleTitleClick = () => {
    setEditingTaskId(task.id);
  };

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 -mx-2 rounded transition-all duration-200",
          "hover:bg-notion-hover group"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 rounded-sm border transition-colors duration-200",
            task.completed ? "bg-notion-primary border-notion-primary" : "border-notion-border"
          )}
          onClick={handleToggleTask}
        >
          {task.completed && <Check className="h-3 w-3 text-white" />}
        </Button>
        
        {editingTaskId === task.id ? (
          <Input
            value={task.title}
            onChange={(e) => updateTaskTitle(task.id, e.target.value, task.parentId)}
            onBlur={() => setEditingTaskId(null)}
            onKeyPress={(e) => e.key === "Enter" && setEditingTaskId(null)}
            className="flex-1 h-6 py-0 px-1 bg-transparent border-none focus:ring-0 text-sm"
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "flex-1 text-sm transition-all duration-200 cursor-pointer",
              task.completed && "line-through text-notion-secondary"
            )}
            onClick={handleTitleClick}
          >
            {task.title}
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-notion-hover"
            onClick={handleAddSubtask}
          >
            <Plus className="h-3.5 w-3.5 text-notion-secondary" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-notion-hover"
            onClick={handleDelete}
          >
            <X className="h-3.5 w-3.5 text-notion-secondary" />
          </Button>
          
          <TaskDropdownMenu onDelete={handleDropdownDelete} />
        </div>
      </div>

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
        />
      )}

      {addingSubtaskId === task.id && (
        <div className="pl-6">
          <TaskInput
            value={newTask}
            onChange={setNewTask}
            onSubmit={handleSubmitSubtask}
            onCancel={() => {
              setAddingSubtaskId(null);
              setNewTask('');
            }}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};