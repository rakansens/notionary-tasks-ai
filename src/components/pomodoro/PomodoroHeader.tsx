import { useEffect } from "react";
import { PomodoroTimer } from "./PomodoroTimer";
import { PomodoroStats } from "./PomodoroStats";
import { CompletedTasks } from "./CompletedTasks";
import { PomodoroSessionName } from "./PomodoroSessionName";
import { PomodoroCalendarModal } from "./PomodoroCalendarModal";
import { usePomodoroTimer } from "@/hooks/pomodoro/usePomodoroTimer";
import { useSessionManager } from "@/hooks/pomodoro/useSessionManager";
import type { CompletedTask } from "@/types/pomodoro";

export const PomodoroHeader = () => {
  const {
    minutes,
    seconds,
    isRunning,
    pomodoroCount,
    totalMinutes,
    setMinutes,
    toggleTimer,
    resetTimer
  } = usePomodoroTimer();

  const {
    currentSession,
    sessions,
    isEditingName,
    sessionName,
    setIsEditingName,
    setSessionName,
    createNewSession,
    endCurrentSession,
    updateSessionName,
    addCompletedTask
  } = useSessionManager();

  useEffect(() => {
    const handleUpdateTimer = (event: CustomEvent<{ minutes: number }>) => {
      setMinutes(event.detail.minutes);
    };

    window.addEventListener('updateTimer', handleUpdateTimer as EventListener);
    
    return () => {
      window.removeEventListener('updateTimer', handleUpdateTimer as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleTaskCompleted = (event: CustomEvent<CompletedTask>) => {
      if (currentSession) {
        addCompletedTask(event.detail);
      }
    };

    window.addEventListener('taskCompleted', handleTaskCompleted as EventListener);
    
    return () => {
      window.removeEventListener('taskCompleted', handleTaskCompleted as EventListener);
    };
  }, [currentSession]);

  return (
    <div className="flex items-center gap-3 ml-auto relative">
      {currentSession && (
        <div className="flex items-center gap-2">
          <PomodoroSessionName
            currentSession={currentSession}
            isEditingName={isEditingName}
            sessionName={sessionName}
            setSessionName={setSessionName}
            setIsEditingName={setIsEditingName}
            updateSessionName={updateSessionName}
          />
        </div>
      )}

      <PomodoroTimer
        minutes={minutes}
        seconds={seconds}
        isRunning={isRunning}
        pomodoroCount={pomodoroCount}
        totalMinutes={totalMinutes}
        toggleTimer={() => toggleTimer(currentSession, () => createNewSession(pomodoroCount))}
        resetTimer={() => {
          resetTimer();
          endCurrentSession();
        }}
      />

      <CompletedTasks 
        sessions={sessions}
        currentSession={currentSession}
        onAddCompletedTask={addCompletedTask}
      />
      <PomodoroStats
        pomodoroCount={pomodoroCount}
        totalMinutes={totalMinutes}
        sessions={sessions}
      />
      <PomodoroCalendarModal />
    </div>
  );
};