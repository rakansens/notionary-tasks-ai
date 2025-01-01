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
  newTask,
  setNewTask,
  addTask,
}: TaskFooterProps) => {
  return (
    <div className="p-6 border-t border-notion-border space-y-4 bg-white/50 backdrop-blur-sm">
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