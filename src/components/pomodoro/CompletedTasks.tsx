import { Paperclip, Folder, ArrowRight, CheckCircle, PlusCircle, Clock } from "lucide-react";
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
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CompletedTasksProps {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  onAddCompletedTask: (task: any) => void;
}

export const CompletedTasks = ({ sessions, currentSession, onAddCompletedTask }: CompletedTasksProps) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [newTasks, setNewTasks] = useState<any[]>([]);

  useEffect(() => {
    const handleNewTask = (event: CustomEvent) => {
      if (currentSession) {
        const task = {
          ...event.detail,
          status: 'new',
          sessionId: currentSession.id
        };
        setNewTasks(prev => [...prev, task]);
      }
    };

    window.addEventListener('taskAdded', handleNewTask as EventListener);
    return () => {
      window.removeEventListener('taskAdded', handleNewTask as EventListener);
    };
  }, [currentSession]);

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
    // Here you would typically update the task's time in your state management
    console.log('Updating time for task', taskId, 'to', newTime);
    setEditingTime("");
  };

  const isTaskFromCurrentSession = (task: any, session: PomodoroSession) => {
    return currentSession && session.id === currentSession.id;
  };

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-notion-hover text-notion-secondary"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-notion-border z-50">
        <div className="max-h-96 overflow-y-auto">
          {sessions.map(session => {
            const sessionNewTasks = newTasks.filter(task => task.sessionId === session.id);
            const allTasks = [
              ...session.completedTasks,
              ...sessionNewTasks
            ].sort((a, b) => {
              const timeA = a.completedAt || new Date(a.addedAt);
              const timeB = b.completedAt || new Date(b.addedAt);
              return timeA.getTime() - timeB.getTime();
            });

            if (allTasks.length === 0) return null;

            return (
              <div key={session.id} className="border-b border-notion-border last:border-b-0">
                <div className="px-4 py-3 bg-[#F7F7F7]">
                  <h3 className="text-sm font-medium text-notion-primary flex items-center justify-between">
                    <span>{session.name}</span>
                    <span className="text-notion-secondary text-xs">
                      {format(session.startTime, "M/d HH:mm")}
                      {session.endTime && ` - ${format(session.endTime, "HH:mm")}`}
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-notion-border">
                  {allTasks.map((task, index) => (
                    <div
                      key={`${task.id}-${index}`}
                      className={cn(
                        "px-4 py-2 transition-colors duration-200 hover:bg-notion-hover",
                        task.status === 'new' 
                          ? "bg-[#F0F7F7]"
                          : isTaskFromCurrentSession(task, session)
                            ? "bg-[#F7F7F7]"
                            : "bg-white"
                      )}
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
                              className={cn(
                                "text-sm cursor-pointer hover:text-notion-primary",
                                isTaskFromCurrentSession(task, session) && "text-notion-primary"
                              )}
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
                              className="h-6 px-2 text-xs text-notion-secondary hover:bg-notion-hover flex items-center gap-1"
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
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};