import { Plus, MoreHorizontal, Check, FolderPlus, Folder, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useTaskManager } from "@/hooks/useTaskManager";
import type { Task } from "@/hooks/useTaskManager";

export const TaskSection = () => {
  const {
    tasks,
    groups,
    newTask,
    newGroup,
    isAddingGroup,
    editingTaskId,
    editingGroupId,
    deleteTarget,
    setNewTask,
    setNewGroup,
    setIsAddingGroup,
    setEditingTaskId,
    setEditingGroupId,
    addTask,
    addGroup,
    toggleTask,
    updateTaskTitle,
    updateGroupName,
    deleteTask,
    deleteGroup,
    confirmDelete,
    cancelDelete,
  } = useTaskManager();

  const renderTask = (task: Task) => (
    <div
      key={task.id}
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
          onKeyPress={(e) => e.key === "Enter" && updateTaskTitle(task.id, (e.target as HTMLInputElement).value)}
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
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-2 border-b">
        <h2 className="text-xl font-semibold text-foreground">タスク管理</h2>
      </div>
      
      <ScrollArea className="flex-1 p-1">
        <div className="space-y-0.5">
          {tasks.filter(task => !task.groupId).map(renderTask)}

          {groups.map(group => (
            <div key={group.id} className="mt-2">
              <div className="flex items-center gap-1 p-1 text-sm font-medium text-muted-foreground">
                <Folder className="h-4 w-4" />
                {editingGroupId === group.id ? (
                  <Input
                    value={group.name}
                    onChange={(e) => updateGroupName(group.id, e.target.value)}
                    onBlur={() => {
                      if (group.name.trim()) {
                        setEditingGroupId(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (group.name.trim()) {
                          setEditingGroupId(null);
                        }
                      } else if (e.key === "Escape") {
                        setEditingGroupId(null);
                      }
                    }}
                    className="flex-1 h-6 py-0"
                    autoFocus
                  />
                ) : (
                  <span
                    className="flex-1 cursor-pointer hover:text-foreground transition-colors duration-200"
                    onClick={() => setEditingGroupId(group.id)}
                  >
                    {group.name}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-destructive"
                  onClick={() => deleteGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="pl-4 space-y-0.5">
                {tasks.filter(task => task.groupId === group.id).map(renderTask)}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-md border border-input"
                    onClick={() => addTask(group.id)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask(group.id)}
                    placeholder="新しいタスクを追加..."
                    className="flex-1 h-7 py-0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t space-y-2">
        {isAddingGroup ? (
          <div className="flex items-center gap-1">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <Input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addGroup()}
              onBlur={() => {
                if (newGroup.trim()) {
                  addGroup();
                } else {
                  setIsAddingGroup(false);
                }
              }}
              placeholder="新しいグループ名..."
              className="flex-1 h-7 py-0"
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center gap-2 text-muted-foreground"
            onClick={() => setIsAddingGroup(true)}
          >
            <FolderPlus className="h-4 w-4" />
            グループを追加
          </Button>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-md border border-input"
            onClick={() => addTask()}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="新しいタスクを追加..."
            className="flex-1"
          />
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={`${deleteTarget?.type === "task" ? "タスク" : "グループ"}を削除`}
        description={`このアイテムを削除してもよろしいですか？${
          deleteTarget?.type === "group" ? "グループ内のすべてのタスクも削除されます。" : ""
        }`}
      />
    </div>
  );
};