import { ArrowRight, CheckCircle, Clock, Folder, History, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TaskHistoryItemProps {
  task: any;
  isCurrentSession: boolean;
  editingTaskId: number | null;
  editingTitle: string;
  editingTime: string;
  onEditStart: (taskId: number, currentTitle: string) => void;
  onEditComplete: () => void;
  onTimeEdit: (taskId: number, currentTime: Date) => void;
  onTimeUpdate: (taskId: number, newTime: string) => void;
  setEditingTitle: (title: string) => void;
  setEditingTime: (time: string) => void;
}

export const TaskHistoryItem = ({
  task,
  isCurrentSession,
  editingTaskId,
  editingTitle,
  editingTime,
  onEditStart,
  onEditComplete,
  onTimeEdit,
  onTimeUpdate,
  setEditingTitle,
  setEditingTime
}: TaskHistoryItemProps) => {
  const getTaskIcon = (task: any) => {
    if (task.status === 'operation') {
      if (task.title.includes('追加')) {
        return <PlusCircle className="h-4 w-4 text-[#37A169]" />;
      } else if (task.title.includes('完了')) {
        return <CheckCircle className="h-4 w-4 text-[#3291FF]" />;
      } else if (task.title.includes('削除')) {
        return <History className="h-4 w-4 text-[#FF3232]" />;
      }
    }
    return <CheckCircle className="h-4 w-4 text-[#3291FF]" />;
  };

  return (
    <div
      className={cn(
        "px-4 py-2 transition-colors duration-200 hover:bg-notion-hover",
        task.status === 'new'
          ? "bg-[#F0F7F7]"
          : isCurrentSession
            ? "bg-[#F7F7F7]"
            : "bg-white"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTaskIcon(task)}
          {editingTaskId === task.id ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={onEditComplete}
              onKeyPress={(e) => e.key === "Enter" && onEditComplete()}
              className="h-6 text-sm bg-white border-notion-border focus:ring-0 focus:border-notion-primary"
              autoFocus
            />
          ) : (
            <div className="space-y-1">
              <span
                className={cn(
                  "text-sm cursor-pointer hover:text-notion-primary",
                  isCurrentSession && "text-notion-primary"
                )}
                onClick={() => onEditStart(task.id, task.title)}
              >
                {task.title}
              </span>
              {isCurrentSession && (
                <span className="ml-2 text-xs text-[#3291FF]">
                  (現在のセッション)
                </span>
              )}
              {(task.parentTaskTitle || task.groupName) && (
                <Breadcrumb>
                  <BreadcrumbList className="text-xs text-notion-secondary">
                    {task.grandParentTaskTitle && (
                      <>
                        <BreadcrumbItem>
                          <History className="h-3 w-3" />
                          <BreadcrumbLink className="hover:text-notion-primary">
                            {task.grandParentTaskTitle}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                          <ArrowRight className="h-3 w-3" />
                        </BreadcrumbSeparator>
                      </>
                    )}
                    {task.parentTaskTitle && (
                      <>
                        <BreadcrumbItem>
                          <History className="h-3 w-3" />
                          <BreadcrumbLink className="hover:text-notion-primary">
                            {task.parentTaskTitle}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </>
                    )}
                    {task.groupName && (
                      <>
                        {task.parentTaskTitle && (
                          <BreadcrumbSeparator>
                            <ArrowRight className="h-3 w-3" />
                          </BreadcrumbSeparator>
                        )}
                        <BreadcrumbItem>
                          <Folder className="h-3 w-3" />
                          <BreadcrumbLink className="hover:text-notion-primary">
                            {task.groupName}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-notion-secondary hover:bg-notion-hover/50 flex items-center gap-1"
              onClick={() => onTimeEdit(task.id, task.completedAt || new Date(task.addedAt))}
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
              onBlur={() => onTimeUpdate(task.id, editingTime)}
              className="h-8 text-sm"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};