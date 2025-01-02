import { Task, Group } from "./types";
import { useEffect } from "react";
import { taskEventEmitter } from "@/utils/taskEventEmitter";
import { TaskEventType } from "@/types/taskEvents";

export const useTaskEvents = () => {
  useEffect(() => {
    const handleGroupAdded = (event: CustomEvent) => {
      console.log('Group added event received:', event.detail);
      taskEventEmitter.emit('GROUP_ADDED', {
        type: 'GROUP_ADDED' as const,
        title: event.detail.name,
        timestamp: event.detail.addedAt,
      });
    };

    window.addEventListener('groupAdded', handleGroupAdded as EventListener);

    return () => {
      window.removeEventListener('groupAdded', handleGroupAdded as EventListener);
    };
  }, []);

  const emitTaskAdded = (task: Task, parentTask?: Task, group?: Group) => {
    const eventData = {
      type: 'TASK_ADDED' as const,
      title: task.title,
      parentTask: parentTask?.title,
      groupName: group?.name,
      timestamp: new Date(),
    };

    console.log('Task operation detected:', eventData);
    taskEventEmitter.emit('TASK_ADDED', eventData);

    if (parentTask) {
      console.log(`サブタスク「${parentTask.title} → ${task.title}」を追加しました`);
    } else {
      console.log(`タスク「${task.title}」を追加しました${group ? `（グループ: ${group.name}）` : ''}`);
    }
  };

  const emitTaskCompleted = (task: Task, parentTask?: Task, group?: Group) => {
    const eventData = {
      type: 'TASK_COMPLETED' as const,
      title: task.title,
      parentTask: parentTask?.title,
      groupName: group?.name,
      timestamp: new Date(),
    };

    taskEventEmitter.emit('TASK_COMPLETED', eventData);
  };

  const emitTaskDeleted = (task: Task, parentTask?: Task, group?: Group) => {
    const eventData = {
      type: 'TASK_DELETED' as const,
      title: task.title,
      timestamp: new Date(),
    };

    console.log('Task event emitted:', eventData);
    taskEventEmitter.emit('TASK_DELETED', eventData);
  };

  const emitGroupAdded = (group: Group) => {
    const eventData = {
      type: 'GROUP_ADDED' as const,
      title: group.name,
      timestamp: new Date(),
    };

    console.log('Group event emitted:', eventData);
    taskEventEmitter.emit('GROUP_ADDED', eventData);
  };

  const emitGroupDeleted = (group: Group) => {
    const eventData = {
      type: 'GROUP_DELETED' as const,
      title: group.name,
      timestamp: new Date(),
    };

    console.log('Group event emitted:', eventData);
    taskEventEmitter.emit('GROUP_DELETED', eventData);
  };

  return {
    emitTaskAdded,
    emitTaskCompleted,
    emitTaskDeleted,
    emitGroupAdded,
    emitGroupDeleted,
  };
};