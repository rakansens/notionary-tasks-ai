export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  taskAnalysis?: {
    title: string;
    priority: "high" | "low";
    group?: string;
    dependencies?: string[];
    completed?: boolean;
  }[];
}