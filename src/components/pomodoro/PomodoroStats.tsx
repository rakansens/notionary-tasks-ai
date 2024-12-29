import { BarChart } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { PomodoroSession } from "@/types/pomodoro";

interface PomodoroStatsProps {
  pomodoroCount: number;
  totalMinutes: number;
  sessions: PomodoroSession[];
}

export const PomodoroStats = ({ pomodoroCount, totalMinutes, sessions }: PomodoroStatsProps) => {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-notion-hover"
        >
          <BarChart className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute right-0 mt-2 w-96 p-4 bg-white rounded-lg shadow-lg border border-notion-border z-50">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-notion-hover">
              <p className="text-sm text-notion-secondary">合計ポモドーロ数</p>
              <p className="text-2xl font-bold">{pomodoroCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-notion-hover">
              <p className="text-sm text-notion-secondary">合計時間</p>
              <p className="text-2xl font-bold">{totalMinutes}分</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">セッション履歴</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sessions.map(session => (
                <div key={session.id} className="p-3 rounded-lg bg-notion-hover">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{session.name}</span>
                    <span className="text-sm text-notion-secondary">
                      {format(session.startTime, "HH:mm")} - {
                        session.endTime ? format(session.endTime, "HH:mm") : "進行中"
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};