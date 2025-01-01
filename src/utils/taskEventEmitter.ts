import { TaskEventType, TaskEventData } from '@/types/taskEvents';

export const emitTaskEvent = (eventData: TaskEventData) => {
  const event = new CustomEvent('taskOperation', {
    detail: eventData
  });
  window.dispatchEvent(event);
  console.log('Task event emitted:', eventData);
};

export const createTaskEvent = (
  type: TaskEventType,
  title: string,
  parentTask?: string,
  groupName?: string
): TaskEventData => ({
  type,
  title,
  parentTask,
  groupName,
  timestamp: new Date()
});