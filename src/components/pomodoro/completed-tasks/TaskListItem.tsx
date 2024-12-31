import { format } from "date-fns";
import { CheckCircle, Clock, Folder, History, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";

interface TaskListItemProps {
  task: any;
  editingTaskId: number | null;
  editingTitle: string;
  editingTime: string;
  setEditingTaskId: (id: number | null) => void;
  setEditingTitle: (title: string) => void;
  setEditingTime: (time: string) => void;
  isTaskFromCurrentSession: (task: any, session: any) => boolean;
  session: any;
}

export const TaskListItem = ({
  task,
  editingTaskId,
  editingTitle,
  editingTime,
  setEditingTaskId,
  setEditingTitle,
  setEditingTime,
  isTaskFromCurrentSession,
  session,
}: TaskListItemProps) => {
  const handleEditStart = (taskId: number, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTitle(currentTitle);
  };

  const handleEditComplete = () => {
    setEditingTaskId(null);
  };

  const handleTimeEdit = (taskId: number, currentTime: Date) => {
    setEditingTime(format(currentTime, "HH:mm"));
  };

  const handleTimeUpdate = (taskId: number, newTime: string) => {
    if (!newTime) return;
    
    console.log('Updating time for task', taskId, 'to', newTime);
    toast({
      title: "時間を更新しました",
      description: `タスクの時間を ${newTime} に更新しました。`,
    });
    setEditingTime("");
  };

  return (
    <div
      className="px-4 py-2 transition-colors duration-200 hover:bg-notion-hover"
      style={{
        backgroundColor: task.status === 'new' 
          ? "#F0F7F7"
          : isTaskFromCurrentSession(task, session)
            ? "#F7F7F7"
            : "white"
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.status === 'new' ? (
            <PlusCircle className="h-4 w-4 text-[#37A169]" />
          ) : (
            <CheckCircle className="h-4 w-4 text-[#3291FF]" />
          )}
          {editingTaskId === task.id ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleEditComplete}
              onKeyPress={(e) => e.key === "Enter" && handleEditComplete()}
              className="h-6 text-sm bg-white border-notion-border focus:ring-0 focus:border-notion-primary"
              autoFocus
            />
          ) : (
            <span 
              className={`text-sm cursor-pointer hover:text-notion-primary ${
                isTaskFromCurrentSession(task, session) ? "text-notion-primary" : ""
              }`}
              onClick={() => handleEditStart(task.id, task.title)}
            >
              {task.title}
              {isTaskFromCurrentSession(task, session) && (
                <span className="ml-2 text-xs text-[#3291FF]">
                  (現在のセッション)
                </span>
              )}
            </span>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-notion-secondary hover:bg-notion-hover/50 flex items-center gap-1"
              onClick={() => handleTimeEdit(task.id, task.completedAt || new Date(task.addedAt))}
            >
              <Clock className="h-3 w-3" />
              {format(task.completedAt || new Date(task.addedAt), "HH:mm")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <Input
              type="time"
              value={editingTime || format(task.completedAt || new Date(task.addedAt), "HH:mm")}
              onChange={(e) => setEditingTime(e.target.value)}
              onBlur={() => handleTimeUpdate(task.id, editingTime)}
              className="h-8 text-sm"
            />
          </PopoverContent>
        </Popover>
      </div>
      {(task.parentTaskTitle || task.groupName) && (
        <div className="text-xs text-notion-secondary mt-1 flex items-center gap-2 flex-wrap pl-6">
          {task.parentTaskTitle && (
            <div className="flex items-center gap-1">
              <History className="h-3 w-3" />
              <span>{task.parentTaskTitle}</span>
            </div>
          )}
          {task.groupName && (
            <span className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              {task.groupName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};