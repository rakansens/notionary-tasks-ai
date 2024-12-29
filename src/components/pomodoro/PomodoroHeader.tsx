import { useState, useEffect } from "react";
import { Clock, BarChart, CheckSquare, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export const PomodoroHeader = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handlePomodoroComplete();
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds]);

  const handlePomodoroComplete = () => {
    setIsRunning(false);
    setPomodoroCount(prev => prev + 1);
    setTotalMinutes(prev => prev + 25);
    setMinutes(25);
    setSeconds(0);
    toast({
      title: "ポモドーロ完了！",
      description: "25分経過しました。休憩を取りましょう。",
    });
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning && minutes === 25 && seconds === 0) {
      toast({
        title: "タイマー開始",
        description: "25分のタイマーを開始しました。",
      });
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    toast({
      title: "タイマーリセット",
      description: "タイマーをリセットしました。",
    });
  };

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="flex items-center gap-3 ml-auto">
      {/* タイマー統計情報 */}
      <div className="flex items-center gap-2 text-sm text-notion-secondary">
        <Clock className="h-4 w-4" />
        <span>{pomodoroCount}回</span>
        <span>({totalMinutes}分)</span>
      </div>

      {/* タイマーコントロール */}
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-200",
          isRunning ? "bg-red-50 text-red-500" : "hover:bg-notion-hover"
        )}
      >
        <span className="text-sm font-medium min-w-[54px]">
          {formatTime(minutes)}:{formatTime(seconds)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-notion-hover"
            onClick={toggleTimer}
          >
            {isRunning ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-notion-hover"
            onClick={resetTimer}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 統計ダイアログ */}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-notion-hover">
                <p className="text-sm text-notion-secondary">合計ポモドーロ数</p>
                <p className="text-2xl font-bold">{pomodoroCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-notion-hover">
                <p className="text-sm text-notion-secondary">合計時間</p>
                <p className="text-2xl font-bold">{totalMinutes}分</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 完了タスクダイアログ */}
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