import { useState } from "react";
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
  const [isGroupMode, setIsGroupMode] = useState(false);

  const handleTaskInputClick = () => {
    setIsGroupMode(!isGroupMode);
  };

  return (
    <div className="p-6 border-t border-notion-border space-y-4 bg-white/50 backdrop-blur-sm">
      <div className="relative">
        <TaskInput
          value={isGroupMode ? newGroup : newTask}
          onChange={isGroupMode ? setNewGroup : setNewTask}
          onSubmit={isGroupMode ? addGroup : addTask}
          className="bg-white/80 hover:bg-white transition-colors duration-200"
          isGroupMode={isGroupMode}
          onIconClick={handleTaskInputClick}
        />
      </div>
    </div>
  );
};