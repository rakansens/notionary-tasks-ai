import { Task } from "@/types/models";
import { normalizeTaskData, calculateTaskLevel } from "@/utils/taskUtils";
import type { UpdateTaskOrderFn } from "./types";

const preserveSubtasks = (tasks: Task[], updatedTasks: Task[]): Task[] => {
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  return updatedTasks.map(task => {
    const originalTask = taskMap.get(task.id);
    if (!originalTask?.subtasks?.length) return task;

    console.log('Preserving subtasks for task:', {
      taskId: task.id,
      taskTitle: task.title,
      subtasksCount: originalTask.subtasks.length,
      subtasks: originalTask.subtasks.map(st => ({
        id: st.id,
        title: st.title,
        level: st.level,
        parentId: st.parentId
      }))
    });

    const updatedSubtasks = originalTask.subtasks.map(subtask => ({
      ...subtask,
      level: calculateTaskLevel(subtask, task),
      parentId: task.id
    }));

    return {
      ...task,
      subtasks: updatedSubtasks
    };
  });
};

export const handleTaskDragEnd = (
  activeId: string,
  overId: string,
  tasks: Task[],
  updateTaskOrder: UpdateTaskOrderFn
) => {
  const activeTaskId = Number(activeId);
  const overTaskId = overId.startsWith('group-') ? undefined : Number(overId);
  const overGroupId = overId.startsWith('group-') ? Number(overId.replace('group-', '')) : undefined;

  const activeTask = tasks.find(task => task.id === activeTaskId);
  const overTask = overTaskId ? tasks.find(task => task.id === overTaskId) : undefined;
  
  if (!activeTask) return;

  console.log('Starting task drag end:', {
    activeTaskId,
    overTaskId,
    overGroupId,
    activeTask,
    overTask
  });

  const isMovingOutOfGroup = activeTask.groupId && (!overTask?.groupId && !overGroupId);
  const isMovingToGroup = overGroupId !== undefined;

  const newGroupId = isMovingToGroup ? overGroupId : (overTask?.groupId || null);

  const updatedTasks = [...tasks];
  const taskToMove = normalizeTaskData({ ...activeTask }); 

  const filteredTasks = updatedTasks.filter(t => t.id !== activeTaskId);
  taskToMove.groupId = newGroupId;

  const tasksInTargetArea = filteredTasks.filter(task => {
    if (newGroupId) {
      return task.groupId === newGroupId && !task.parentId;
    }
    return !task.groupId && !task.parentId;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (isMovingOutOfGroup || isMovingToGroup) {
    taskToMove.order = tasksInTargetArea.length > 0
      ? Math.max(...tasksInTargetArea.map(t => t.order || 0)) + 1
      : 0;
  } else if (overTask) {
    const currentIndex = tasksInTargetArea.findIndex(t => t.id === activeTaskId);
    const targetIndex = tasksInTargetArea.findIndex(t => t.id === overTask.id);

    if (currentIndex === -1) {
      taskToMove.order = overTask.order || 0;
      tasksInTargetArea.forEach(task => {
        if ((task.order || 0) >= (overTask.order || 0)) {
          task.order = (task.order || 0) + 1;
        }
      });
    } else {
      const direction = currentIndex < targetIndex ? 1 : -1;
      taskToMove.order = overTask.order || 0;

      tasksInTargetArea.forEach(task => {
        if (direction > 0) {
          if ((task.order || 0) > (activeTask.order || 0) && (task.order || 0) <= (overTask.order || 0)) {
            task.order = (task.order || 0) - 1;
          }
        } else {
          if ((task.order || 0) >= (overTask.order || 0) && (task.order || 0) < (activeTask.order || 0)) {
            task.order = (task.order || 0) + 1;
          }
        }
      });
    }
  } else {
    taskToMove.order = tasksInTargetArea.length > 0
      ? Math.max(...tasksInTargetArea.map(t => t.order || 0)) + 1
      : 0;
  }

  filteredTasks.push(taskToMove);

  console.log('Before preserving subtasks:', {
    filteredTasksCount: filteredTasks.length,
    taskToMove,
    originalTasks: tasks
  });

  const finalTasks = preserveSubtasks(tasks, filteredTasks);
  
  console.log('After preserving subtasks:', {
    finalTasksCount: finalTasks.length,
    finalTasks
  });

  updateTaskOrder(finalTasks);
};