import { useState } from "react";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { TaskNode, TaskDragItem } from "@/types/taskTypes";
import { useTaskValidation } from "./useTaskValidation";
import { useToast } from "@/components/ui/use-toast";

export const useTaskDragAndDrop = (
  tasks: TaskNode[],
  onTasksUpdate: (tasks: TaskNode[]) => void
) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const { validateTaskMove } = useTaskValidation();
  const { toast } = useToast();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(Number(active.id));
    console.log('Drag started:', { activeId: active.id });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const sourceId = Number(active.id);
    const sourceTask = tasks.find(t => t.id === sourceId);
    
    if (!sourceTask) {
      setActiveId(null);
      return;
    }

    const destinationId = over ? Number(over.id) : null;
    const destinationIndex = tasks.findIndex(t => t.id === destinationId);

    // 移動の検証
    const validation = validateTaskMove(sourceTask, destinationId, tasks);
    if (!validation.isValid) {
      toast({
        title: "移動できません",
        description: validation.error,
        variant: "destructive"
      });
      setActiveId(null);
      return;
    }

    try {
      // タスクの並び替え
      const updatedTasks = reorderTasks(
        tasks,
        sourceId,
        destinationId,
        destinationIndex
      );
      
      onTasksUpdate(updatedTasks);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      toast({
        title: "エラー",
        description: "タスクの移動に失敗しました",
        variant: "destructive"
      });
    }

    setActiveId(null);
  };

  const reorderTasks = (
    tasks: TaskNode[],
    sourceId: number,
    destinationId: number | null,
    destinationIndex: number
  ): TaskNode[] => {
    const updatedTasks = [...tasks];
    const sourceIndex = tasks.findIndex(t => t.id === sourceId);
    
    if (sourceIndex === -1) return tasks;

    const [movedTask] = updatedTasks.splice(sourceIndex, 1);
    
    // 新しい順序位置の計算
    const newOrder = calculateNewOrder(
      updatedTasks,
      destinationIndex
    );

    // タスクの更新
    movedTask.order = newOrder;
    if (destinationId) {
      const destinationTask = tasks.find(t => t.id === destinationId);
      if (destinationTask) {
        movedTask.parentId = destinationTask.parentId;
        movedTask.level = destinationTask.level;
      }
    } else {
      movedTask.parentId = null;
      movedTask.level = 1;
    }

    // 更新されたタスクを挿入
    updatedTasks.splice(destinationIndex, 0, movedTask);

    return updatedTasks;
  };

  const calculateNewOrder = (
    tasks: TaskNode[],
    destinationIndex: number
  ): number => {
    if (tasks.length === 0) return 0;
    
    if (destinationIndex === 0) {
      return tasks[0].order / 2;
    }
    
    if (destinationIndex >= tasks.length) {
      return tasks[tasks.length - 1].order + 1024;
    }
    
    const prevOrder = tasks[destinationIndex - 1].order;
    const nextOrder = tasks[destinationIndex].order;
    return prevOrder + (nextOrder - prevOrder) / 2;
  };

  return {
    activeId,
    handleDragStart,
    handleDragEnd
  };
};