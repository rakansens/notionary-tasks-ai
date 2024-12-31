import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PomodoroCalendar } from "./PomodoroCalendar";

export const TaskLogTabs = () => {
  return (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="calendar">カレンダー</TabsTrigger>
      </TabsList>
      <TabsContent value="calendar">
        <PomodoroCalendar />
      </TabsContent>
    </Tabs>
  );
};