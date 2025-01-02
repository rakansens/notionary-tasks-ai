import { cn } from "@/lib/utils";
import { Message } from "@/types/messages";
import { TaskAnalysis } from "../TaskAnalysis";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  if (message.taskAnalysis) {
    return (
      <div className="w-full">
        <TaskAnalysis tasks={message.taskAnalysis} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-[80%] p-4 rounded-lg transition-all duration-200",
        message.isUser
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground"
      )}
    >
      {message.text}
    </div>
  );
};