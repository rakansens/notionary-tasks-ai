import { useState } from "react";
import { Plus, MoreHorizontal, Check, FolderPlus, Folder } from "lucide-react";
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

interface Task {
  id: number;
  title: string;
  completed: boolean;
  groupId?: number;
}

interface Group {
  id: number;
  name: string;
}

export const TaskSection = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const addTask = (groupId?: number) => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now(),
      title: newTask,
      completed: false,
      groupId,
    };
    
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const addGroup = () => {
    if (!newGroup.trim()) return;
    
    const group: Group = {
      id: Date.now(),
      name: newGroup,
    };
    
    setGroups([...groups, group]);
    setNewGroup("");
    setIsAddingGroup(false);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const updateTaskTitle = (id: number, newTitle: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, title: newTitle } : task
    ));
    setEditingTaskId(null);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const deleteGroup = (groupId: number) => {
    setGroups(groups.filter(group => group.id !== groupId));
    setTasks(tasks.filter(task => task.groupId !== groupId));
  };

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
          {/* Ungrouped tasks */}
          {tasks.filter(task => !task.groupId).map(renderTask)}

          {/* Groups and their tasks */}
          {groups.map(group => (
            <div key={group.id} className="mt-2">
              <div className="flex items-center gap-1 p-1 text-sm font-medium text-muted-foreground">
                <Folder className="h-4 w-4" />
                <span className="flex-1">{group.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteGroup(group.id)}
                >
                  <MoreHorizontal className="h-4 w-4" />
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
    </div>
  );
};