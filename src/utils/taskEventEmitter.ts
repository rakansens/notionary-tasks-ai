import { TaskEventType, TaskEventData } from '@/types/taskEvents';

export const emitTaskEvent = (eventData: TaskEventData) => {
  const event = new CustomEvent('taskOperation', {
    detail: eventData
  });
  window.dispatchEvent(event);
  if (eventData.message) {
    console.log(eventData.message);
  } else {
    console.log('Task event emitted:', eventData);
  }
};

export const createTaskEvent = (
  type: TaskEventType,
  title: string,
  parentTask?: string,
  groupName?: string,
  message?: string
): TaskEventData => ({
  type,
  title,
  parentTask,
  groupName,
  message,
  timestamp: new Date()
});