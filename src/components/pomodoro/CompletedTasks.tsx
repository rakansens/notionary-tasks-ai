import { Paperclip, Folder, ArrowRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { PomodoroSession } from "@/types/pomodoro";
import { useState } from "react";

interface CompletedTasksProps {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  onAddCompletedTask: (task: any) => void;
}

export const CompletedTasks = ({ sessions, currentSession, onAddCompletedTask }: CompletedTasksProps) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleEditStart = (taskId: number, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTitle(currentTitle);
  };

  const handleEditComplete = () => {
    setEditingTaskId(null);
    // Here you would typically update the task title in your state management system
    // For now, we'll just clear the editing state
  };

  const isTaskFromCurrentSession = (task: any, session: PomodoroSession) => {
    return currentSession && session.id === currentSession.id;
  };

  const isTaskAddedInCurrentSession = (task: any) => {
    return currentSession && task.addedAt && 
           new Date(task.addedAt) >= currentSession.startTime &&
           (!currentSession.endTime || new Date(task.addedAt) <= currentSession.endTime);
  };

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-notion-hover"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute right-0 mt-2 w-96 p-4 bg-white rounded-lg shadow-lg border border-notion-border z-50">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sessions.map(session => (
            <div key={session.id} className="space-y-2">
              {session.completedTasks.length > 0 && (
                <>
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>{session.name}</span>
                    <span className="text-notion-secondary">
                      {format(session.startTime, "M/d HH:mm")}
                      {session.endTime && ` - ${format(session.endTime, "HH:mm")}`}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {session.completedTasks.map((task, index) => (
                      <div
                        key={`${task.id}-${index}`}
                        className={cn(
                          "flex flex-col p-2 rounded-lg transition-colors duration-200",
                          isTaskFromCurrentSession(task, session)
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "bg-notion-hover"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          {editingTaskId === task.id ? (
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={handleEditComplete}
                              onKeyPress={(e) => e.key === "Enter" && handleEditComplete()}
                              className="h-6 text-sm"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={cn(
                                "cursor-pointer hover:text-notion-primary",
                                isTaskFromCurrentSession(task, session) && "font-medium"
                              )}
                              onClick={() => handleEditStart(task.id, task.title)}
                            >
                              {task.title}
                              {isTaskFromCurrentSession(task, session) && (
                                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                                  (現在のセッション)
                                </span>
                              )}
                              {isTaskAddedInCurrentSession(task) && (
                                <span className="ml-2 text-xs text-green-500 dark:text-green-400">
                                  (新規追加)
                                </span>
                              )}
                            </span>
                          )}
                          <span className="text-sm text-notion-secondary">
                            {format(task.completedAt, "HH:mm")}
                          </span>
                        </div>
                        {(task.parentTaskTitle || task.groupName) && (
                          <div className="text-xs text-notion-secondary mt-1 flex items-center gap-2 flex-wrap">
                            {task.parentTaskTitle && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span className="flex items-center gap-1">
                                  {task.parentTaskTitle}
                                  {task.grandParentTaskTitle && (
                                    <>
                                      <ArrowRight className="h-3 w-3" />
                                      {task.grandParentTaskTitle}
                                    </>
                                  )}
                                </span>
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
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};