import type { CompletedTask } from "@/types/pomodoro";

export const createLogEvent = (eventType: CompletedTask['eventType'], title: string, description?: string): Partial<CompletedTask> => {
  return {
    id: Date.now(),
    title,
    addedAt: new Date(),
    completedAt: new Date(),
    status: 'completed',
    eventType,
    description
  };
};