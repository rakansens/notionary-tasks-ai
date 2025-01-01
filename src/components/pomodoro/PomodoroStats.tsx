import { BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PomodoroSession } from "@/types/pomodoro";

interface PomodoroStatsProps {
  pomodoroCount: number;
  totalMinutes: number;
  sessions: PomodoroSession[];
}

export const PomodoroStats = ({
  pomodoroCount,
  totalMinutes,
  sessions,
}: PomodoroStatsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-notion-hover text-notion-secondary"
        >
          <BarChart className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">統計情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-notion-secondary">完了したポモドーロ</p>
                <p className="text-lg font-medium">{pomodoroCount}回</p>
              </div>
              <div>
                <p className="text-sm text-notion-secondary">合計時間</p>
                <p className="text-lg font-medium">{totalMinutes}分</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">セッション履歴</h3>
            <div className="space-y-2">
              {sessions.slice(-5).reverse().map((session) => (
                <div key={session.id} className="text-sm">
                  <p className="font-medium">{session.name}</p>
                  <p className="text-notion-secondary">
                    {session.startTime.toLocaleTimeString()} -{" "}
                    {session.endTime?.toLocaleTimeString() || "進行中"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};