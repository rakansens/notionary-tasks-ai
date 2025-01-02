import { Task, Group } from "./types";
import { useEffect } from "react";
import { taskEventEmitter } from "@/utils/taskEventEmitter";

export const useTaskEvents = () => {
  useEffect(() => {
    const handleGroupAdded = (event: CustomEvent) => {
      console.log('Group added event received:', event.detail);
      taskEventEmitter.emit('groupAdded', {
        type: 'groupAdded',
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
      type: parentTask ? 'SUBTASK_ADDED' : 'TASK_ADDED',
      title: task.title,
      parentTask: parentTask?.title,
      groupName: group?.name,
      timestamp: new Date(),
    };

    console.log('Task operation detected:', eventData);
    taskEventEmitter.emit('taskOperation', eventData);

    if (parentTask) {
      console.log(`サブタスク「${parentTask.title} → ${task.title}」を追加しました`);
    } else {
      console.log(`タスク「${task.title}」を追加しました${group ? `（グループ: ${group.name}）` : ''}`);
    }
  };

  const emitTaskCompleted = (task: Task, parentTask?: Task, group?: Group) => {
    const eventData = {
      type: 'TASK_COMPLETED',
      title: task.title,
      parentTask: parentTask?.title,
      groupName: group?.name,
      timestamp: new Date(),
    };

    taskEventEmitter.emit('taskOperation', eventData);
  };

  const emitTaskDeleted = (task: Task, parentTask?: Task, group?: Group) => {
    const eventData = {
      type: 'TASK_DELETED',
      title: task.title,
      timestamp: new Date(),
    };

    console.log('Task event emitted:', eventData);
    taskEventEmitter.emit('taskOperation', eventData);
  };

  const emitGroupAdded = (group: Group) => {
    const eventData = {
      type: 'GROUP_ADDED',
      title: group.name,
      timestamp: new Date(),
    };

    console.log('Group event emitted:', eventData);
    taskEventEmitter.emit('groupOperation', eventData);
  };

  const emitGroupDeleted = (group: Group) => {
    const eventData = {
      type: 'GROUP_DELETED',
      title: group.name,
      timestamp: new Date(),
    };

    console.log('Group event emitted:', eventData);
    taskEventEmitter.emit('groupOperation', eventData);
  };

  return {
    emitTaskAdded,
    emitTaskCompleted,
    emitTaskDeleted,
    emitGroupAdded,
    emitGroupDeleted,
  };
};