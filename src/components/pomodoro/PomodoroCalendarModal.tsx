import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-[600px]">
        <PomodoroCalendar />
      </DialogContent>
    </Dialog>
  );
};