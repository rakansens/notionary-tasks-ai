import { Task } from "@/types/models";
import { TaskItemInput } from "./TaskItemInput";
import { useToast } from "@/components/ui/use-toast";

interface TaskSubtaskInputProps {
  task: Task;
  newTask: string;
  setNewTask: (value: string) => void;
  addTask: (groupId?: number, parentId?: number) => void;
  setAddingSubtaskId: (id: number | null) => void;
}

export const TaskSubtaskInput = ({
  task,
  newTask,
  setNewTask,
  addTask,
  setAddingSubtaskId,
}: TaskSubtaskInputProps) => {
  const { toast } = useToast();

  const handleAddSubtaskKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault();
      if (newTask.trim()) {
        try {
          await addTask(undefined, task.id);
          setTimeout(() => {
            setAddingSubtaskId(null);
            setNewTask("");
          }, 1000);
        } catch (error) {
          console.error('Error adding subtask:', error);
          toast({
            title: "エラー",
            description: "サブタスクの追加に失敗しました",
            variant: "destructive",
          });
        }
      }
    } else if (e.key === "Escape") {
      setAddingSubtaskId(null);
      setNewTask("");
    }
  };

  const handleAddSubtaskBlur = async () => {
    if (newTask.trim()) {
      try {
        await addTask(undefined, task.id);
        setTimeout(() => {
          setAddingSubtaskId(null);
          setNewTask("");
        }, 1000);
      } catch (error) {
        console.error('Error adding subtask:', error);
        toast({
          title: "エラー",
          description: "サブタスクの追加に失敗しました",
          variant: "destructive",
        });
      }
    } else {
      setAddingSubtaskId(null);
      setNewTask("");
    }
  };

  return (
    <div className="pl-6 mt-1">
      <TaskItemInput
        value={newTask}
        onBlur={handleAddSubtaskBlur}
        onKeyDown={handleAddSubtaskKeyDown}
        placeholder="新しいサブタスク"
      />
    </div>
  );
};