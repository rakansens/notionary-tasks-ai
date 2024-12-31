import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PomodoroLogs } from "./logs/PomodoroLogs";
import { RegularLogs } from "./logs/RegularLogs";

export const TaskLogTabs = () => {
  return (
    <Tabs defaultValue="pomodoro" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pomodoro">ポモドーロログ</TabsTrigger>
        <TabsTrigger value="regular">通常ログ</TabsTrigger>
      </TabsList>
      <TabsContent value="pomodoro">
        <PomodoroLogs />
      </TabsContent>
      <TabsContent value="regular">
        <RegularLogs />
      </TabsContent>
    </Tabs>
  );
};