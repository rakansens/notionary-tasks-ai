import { FolderPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskInput } from "../TaskInput";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TaskFooterProps {
  isAddingGroup: boolean;
  newGroup: string;
  setNewGroup: (value: string) => void;
  setIsAddingGroup: (value: boolean) => void;
  addGroup: () => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: () => void;
}

export const TaskFooter = ({
  isAddingGroup,
  newGroup,
  setNewGroup,
  setIsAddingGroup,
  addGroup,
  newTask,
  setNewTask,
  addTask,
}: TaskFooterProps) => {
  const [isGroupMode, setIsGroupMode] = useState(false);

  const handleGroupButtonClick = () => {
    if (isGroupMode) {
      if (newGroup.trim()) {
        addGroup();
      }
      setIsGroupMode(false);
    } else {
      setIsGroupMode(true);
      setIsAddingGroup(true);
    }
  };

  return (
    <div className="p-6 border-t border-notion-border space-y-4 bg-white/50 backdrop-blur-sm">
      {isGroupMode ? (
        <div className="flex items-center gap-2">
          <Input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && newGroup.trim()) {
                addGroup();
                setIsGroupMode(false);
              }
            }}
            onBlur={() => {
              if (newGroup.trim()) {
                addGroup();
                setIsGroupMode(false);
              } else {
                setIsAddingGroup(false);
                setIsGroupMode(false);
              }
            }}
            placeholder="新しいグループ名..."
            className="h-9 text-sm bg-white/80 border-notion-border focus:border-notion-primary focus:ring-1 focus:ring-notion-primary/20 transition-all duration-200"
            autoFocus
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full flex items-center gap-2 transition-colors duration-200 group",
            isGroupMode
              ? "text-[#1EAEDB] hover:text-[#0FA0CE]"
              : "text-[#9b87f5] hover:text-[#8a73f4]"
          )}
          onClick={handleGroupButtonClick}
        >
          {isGroupMode ? (
            <Check className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <FolderPlus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          )}
          {isGroupMode ? "グループを追加" : "グループを追加"}
        </Button>
      )}

      <div className="relative">
        <TaskInput
          value={newTask}
          onChange={setNewTask}
          onSubmit={addTask}
          className="bg-white/80 hover:bg-white transition-colors duration-200"
        />
      </div>
    </div>
  );
};