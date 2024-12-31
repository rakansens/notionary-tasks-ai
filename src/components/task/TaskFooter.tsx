import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskInput } from "../TaskInput";

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
  return (
    <div className="p-4 border-t border-notion-border space-y-3">
      {isAddingGroup ? (
        <div className="flex items-center gap-2">
          <Input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addGroup()}
            onBlur={() => {
              if (newGroup.trim()) {
                addGroup();
              } else {
                setIsAddingGroup(false);
              }
            }}
            placeholder="新しいグループ名..."
            className="h-8 text-sm bg-transparent border-notion-border focus:border-notion-primary focus:ring-0"
            autoFocus
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center gap-2 text-notion-secondary hover:bg-notion-hover"
          onClick={() => setIsAddingGroup(true)}
        >
          <FolderPlus className="h-4 w-4" />
          グループを追加
        </Button>
      )}

      <TaskInput
        value={newTask}
        onChange={setNewTask}
        onSubmit={addTask}
      />
    </div>
  );
};