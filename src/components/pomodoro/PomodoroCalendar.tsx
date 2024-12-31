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
  const today = new Date();
  const fromDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={today}
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
  );
};