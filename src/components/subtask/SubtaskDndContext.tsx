import { Task } from "@/hooks/taskManager/types";
import { createContext, useContext } from "react";
import { DndContext } from "@dnd-kit/core";

interface SubtaskDndContextProps {
  subtasks: Task[];
  parentTask: Task;
  onReorderSubtasks?: (startIndex: number, endIndex: number, parentId: number) => void;
}

const SubtaskDndContext = createContext<SubtaskDndContextProps | undefined>(undefined);

export const SubtaskDndProvider: React.FC<SubtaskDndContextProps> = ({ children, subtasks, parentTask, onReorderSubtasks }) => {
  return (
    <SubtaskDndContext.Provider value={{ subtasks, parentTask, onReorderSubtasks }}>
      <DndContext>
        {children}
      </DndContext>
    </SubtaskDndContext.Provider>
  );
};

export const useSubtaskDndContext = () => {
  const context = useContext(SubtaskDndContext);
  if (!context) {
    throw new Error("useSubtaskDndContext must be used within a SubtaskDndProvider");
  }
  return context;
};
