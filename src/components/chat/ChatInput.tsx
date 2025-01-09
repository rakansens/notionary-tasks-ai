import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ChatMode } from "@/hooks/chat/useMessages";

interface ChatInputProps {
  onSend: (content: string, mode: ChatMode) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim(), "user");
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="タスクについて質問してください..."
        className="flex-1"
      />
      <Button onClick={handleSend} disabled={!message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;