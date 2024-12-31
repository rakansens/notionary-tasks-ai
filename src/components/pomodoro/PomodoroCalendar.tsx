import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface DayStats {
  pomodoroCount: number;
  totalMinutes: number;
}

// 仮のデータ - 後で実際のデータに置き換え
const mockStats: Record<string, DayStats> = {
  "2024-04-15": { pomodoroCount: 4, totalMinutes: 100 },
  "2024-04-16": { pomodoroCount: 6, totalMinutes: 150 },
  // ... 他の日付のデータ
};

export const PomodoroCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const today = new Date();
  const fromDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedStats = selectedDateStr ? mockStats[selectedDateStr] : null;

  return (
    <div className="flex gap-4">
      <Card className="w-[350px]">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            fromDate={fromDate}
            toDate={today}
            locale={ja}
            modifiers={{
              hasStats: (date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return dateStr in mockStats;
              },
            }}
            modifiersStyles={{
              hasStats: {
                fontWeight: "bold",
                color: "var(--primary)",
                backgroundColor: "var(--primary-foreground)",
                borderRadius: "4px",
              },
            }}
            components={{
              DayContent: ({ date }) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const stats = mockStats[dateStr];

                return (
                  <div className="flex flex-col items-center justify-center h-full">
                    <span>{date.getDate()}</span>
                    {stats && (
                      <div className="text-[8px] leading-tight text-center">
                        <div className="font-semibold">{stats.pomodoroCount}回</div>
                        <div>{stats.totalMinutes}分</div>
                      </div>
                    )}
                  </div>
                );
              },
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="flex-1 min-w-[250px]">
        <CardContent className="p-4">
          {selectedDate ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {format(selectedDate, "yyyy年MM月dd日")}の記録
              </h3>
              {selectedStats ? (
                <div className="space-y-2">
                  <div className="p-4 rounded-lg bg-notion-hover">
                    <p className="text-sm text-notion-secondary">ポモドーロ回数</p>
                    <p className="text-2xl font-bold">{selectedStats.pomodoroCount}回</p>
                  </div>
                  <div className="p-4 rounded-lg bg-notion-hover">
                    <p className="text-sm text-notion-secondary">合計時間</p>
                    <p className="text-2xl font-bold">{selectedStats.totalMinutes}分</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">この日の記録はありません。</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">日付を選択すると、詳細が表示されます。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};