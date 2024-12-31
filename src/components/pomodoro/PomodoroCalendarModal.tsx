import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PomodoroCalendar } from "./PomodoroCalendar";

export const PomodoroCalendarModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Calendar className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] p-6">
        <DialogTitle className="text-xl font-semibold mb-2">
          ポモドーロカレンダー
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-4">
          過去1年間のポモドーロの記録を確認できます。各日付の下に表示される数字は、その日のポモドーロ回数と合計時間（分）を表しています。
        </DialogDescription>
        <PomodoroCalendar />
      </DialogContent>
    </Dialog>
  );
};