import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types/models";

export const useTaskItemHandlers = (
  task: Task,
  parentTask: Task | undefined,
  updateTaskTitle: (id: number, title: string, parentId?: number) => void,
  setEditingTaskId: (id: number | null) => void,
  setAddingSubtaskId: (id: number | null) => void,
  addTask: (groupId?: number, parentId?: number) => void
) => {
  const { toast } = useToast();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value) {
        updateTaskTitle(task.id, value, parentTask?.id);
      }
      setEditingTaskId(null);
    } else if (e.key === "Escape") {
      setEditingTaskId(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && value !== task.title) {
      updateTaskTitle(task.id, value, parentTask?.id);
    }
    setEditingTaskId(null);
  };

  const handleAddSubtask = () => {
    if (task.level >= 3) {
      toast({
        title: "エラー",
        description: "サブタスクは3階層までしか作成できません",
        variant: "destructive",
      });
      return;
    }
    setAddingSubtaskId(task.id);
  };

  return {
    handleKeyDown,
    handleBlur,
    handleAddSubtask,
  };
};