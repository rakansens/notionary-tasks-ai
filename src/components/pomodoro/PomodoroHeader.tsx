import { useState, useEffect } from "react";
import { Clock, BarChart, CheckSquare, Play, Pause, RefreshCw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { PomodoroSession, CompletedTask } from "@/types/pomodoro";

export const PomodoroHeader = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [sessionName, setSessionName] = useState("");
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

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
      };
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
      setCurrentSession(null);
    }

    toast({
      title: "ポモドーロ完了！",
      description: "25分経過しました。休憩を取りましょう。",
    });
  };

  const toggleTimer = () => {
    if (!isRunning && minutes === 25 && seconds === 0) {
      const newSession: PomodoroSession = {
        id: Date.now(),
        name: `ポモドーロ #${pomodoroCount + 1}`,
        startTime: new Date(),
        completedTasks: [],
      };
      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
      setSessionName(newSession.name);
      
      toast({
        title: "タイマー開始",
        description: "25分のタイマーを開始しました。",
      });
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
      };
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
      setCurrentSession(null);
    }
    toast({
      title: "タイマーリセット",
      description: "タイマーをリセットしました。",
    });
  };

  const updateSessionName = () => {
    if (currentSession && sessionName.trim()) {
      const updatedSession = {
        ...currentSession,
        name: sessionName,
      };
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => 
        s.id === currentSession.id ? updatedSession : s
      ));
      setIsEditingName(false);
    }
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
        {currentSession && (
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onBlur={updateSessionName}
                onKeyPress={(e) => e.key === "Enter" && updateSessionName()}
                className="h-6 text-sm"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm">{currentSession.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-notion-hover"
                  onClick={() => setIsEditingName(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
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
            <div className="space-y-2">
              <h3 className="text-sm font-medium">セッション履歴</h3>
              <div className="space-y-2">
                {sessions.map(session => (
                  <div key={session.id} className="p-3 rounded-lg bg-notion-hover">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{session.name}</span>
                      <span className="text-sm text-notion-secondary">
                        {format(session.startTime, "HH:mm")} - {
                          session.endTime ? format(session.endTime, "HH:mm") : "進行中"
                        }
                      </span>
                    </div>
                    {session.completedTasks.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-notion-secondary">完了タスク:</p>
                        {session.completedTasks.map(task => (
                          <div key={task.id} className="text-sm pl-2">
                            • {task.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
            {sessions.map(session => (
              <div key={session.id} className="space-y-2">
                {session.completedTasks.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium flex items-center justify-between">
                      <span>{session.name}</span>
                      <span className="text-notion-secondary">
                        {format(session.startTime, "M/d HH:mm")}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {session.completedTasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-notion-hover"
                        >
                          <span>{task.title}</span>
                          <span className="text-sm text-notion-secondary">
                            {format(task.completedAt, "HH:mm")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};