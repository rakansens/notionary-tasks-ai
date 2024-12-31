import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PomodoroLogs } from "./logs/PomodoroLogs";
import { RegularLogs } from "./logs/RegularLogs";
import { PomodoroCalendar } from "./PomodoroCalendar";

export const TaskLogTabs = () => {
  return (
    <Tabs defaultValue="pomodoro" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pomodoro">ポモドーロ</TabsTrigger>
        <TabsTrigger value="regular">タスク</TabsTrigger>
        <TabsTrigger value="calendar">カレンダー</TabsTrigger>
      </TabsList>
      <TabsContent value="pomodoro">
        <PomodoroLogs />
      </TabsContent>
      <TabsContent value="regular">
        <RegularLogs />
      </TabsContent>
      <TabsContent value="calendar">
        <PomodoroCalendar />
      </TabsContent>
    </Tabs>
  );
};