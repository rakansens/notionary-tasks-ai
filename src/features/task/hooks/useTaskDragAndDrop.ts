import { useState } from 'react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { TaskNode, TaskDragItem, TaskDropResult } from '../types/taskTypes';
import { validateTaskMove } from '../utils/taskStructureUtils';
import { reorderTasks } from '../utils/taskOrderUtils';
import { useToast } from '@/components/ui/use-toast';

export const useTaskDragAndDrop = (
  tasks: TaskNode[],
  onTasksUpdate: (tasks: TaskNode[]) => void
) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(Number(active.id));
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

    // Validate move
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
      // Reorder tasks
      const updatedTasks = await reorderTasks(
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

  return {
    activeId,
    handleDragStart,
    handleDragEnd
  };
};