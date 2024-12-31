import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useTaskLogs } from "@/hooks/useTaskLogs";

export const PomodoroCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { logs } = useTaskLogs();

  // 選択された日付のポモドーロログを取得
  const getDayStats = (targetDate: Date) => {
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= dayStart && logDate <= dayEnd;
    });

    const pomodoroCount = dayLogs.filter(log => 
      log.eventType === "pomodoro_started"
    ).length;

    const totalMinutes = pomodoroCount * 25; // 1ポモドーロ = 25分

    return {
      pomodoroCount,
      totalMinutes,
    };
  };

  const selectedDayStats = date ? getDayStats(date) : null;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ja}
          className="rounded-md border shadow"
        />

        {date && selectedDayStats && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg">
                {format(date, "yyyy年MM月dd日", { locale: ja })}の統計
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">ポモドーロ回数</p>
                <p className="text-2xl font-bold">{selectedDayStats.pomodoroCount}回</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">合計時間</p>
                <p className="text-2xl font-bold">{selectedDayStats.totalMinutes}分</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};