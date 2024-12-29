import { useState } from "react";
import { Clock, BarChart, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const PomodoroHeader = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="flex items-center gap-2 ml-auto">
      <div 
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-notion-hover",
          isRunning && "text-red-500"
        )}
        onClick={toggleTimer}
      >
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          {formatTime(minutes)}:{formatTime(seconds)}
        </span>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-notion-hover"
          >
            <BarChart className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ポモドーロ統計</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p>合計ポモドーロ数: {pomodoroCount}</p>
              <p>合計時間: {totalMinutes}分</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-notion-hover"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>完了タスク一覧</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* タスク一覧を表示する部分は後ほど実装 */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};