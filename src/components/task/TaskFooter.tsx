import { TaskInput } from "../TaskInput";

interface TaskFooterProps {
  isAddingGroup: boolean;
  newGroup: string;
  setNewGroup: (value: string) => void;
  setIsAddingGroup: (value: boolean) => void;
  addGroup: (name: string) => void;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number, title?: string) => void;
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
          onSubmit={() => addTask(undefined, undefined, newTask)}
          className="bg-white/80 hover:bg-white transition-colors duration-200"
        />
      </div>
    </div>
  );
};