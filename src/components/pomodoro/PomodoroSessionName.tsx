import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import type { PomodoroSession } from "@/types/pomodoro";

interface PomodoroSessionNameProps {
  currentSession: PomodoroSession | null;
  isEditingName: boolean;
  sessionName: string;
  setSessionName: (name: string) => void;
  setIsEditingName: (isEditing: boolean) => void;
  updateSessionName: () => void;
}

export const PomodoroSessionName = ({
  currentSession,
  isEditingName,
  sessionName,
  setSessionName,
  setIsEditingName,
  updateSessionName,
}: PomodoroSessionNameProps) => {
  if (!currentSession) return null;

  if (isEditingName) {
    return (
      <Input
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        onBlur={updateSessionName}
        onKeyPress={(e) => e.key === "Enter" && updateSessionName()}
        className="h-6 text-sm"
        autoFocus
      />
    );
  }

  return (
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
  );
};