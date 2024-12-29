import { CheckSquare } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { PomodoroSession } from "@/types/pomodoro";

interface CompletedTasksProps {
  sessions: PomodoroSession[];
  currentSession: PomodoroSession | null;
  onAddCompletedTask: (task: any) => void;
}

export const CompletedTasks = ({ sessions, currentSession, onAddCompletedTask }: CompletedTasksProps) => {
  console.log('Current sessions:', sessions);
  console.log('Current session:', currentSession);

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-notion-hover"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute right-0 mt-2 w-96 p-4 bg-white rounded-lg shadow-lg border border-notion-border z-50">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sessions.map(session => {
            console.log('Session completed tasks:', session.completedTasks);
            return (
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
                      {session.completedTasks.map(task => (
                        <div
                          key={task.id}
                          className="flex flex-col p-2 rounded-lg bg-notion-hover"
                        >
                          <div className="flex items-center justify-between">
                            <span>{task.title}</span>
                            <span className="text-sm text-notion-secondary">
                              {format(task.completedAt, "HH:mm")}
                            </span>
                          </div>
                          {(task.parentTaskTitle || task.groupName) && (
                            <div className="text-xs text-notion-secondary mt-1">
                              {task.parentTaskTitle && (
                                <span className="mr-2">📎 {task.parentTaskTitle}</span>
                              )}
                              {task.groupName && (
                                <span>📁 {task.groupName}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};