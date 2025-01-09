import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useMessages } from "@/hooks/chat/useMessages";

const ChatContainer = () => {
  const { messages, addMessage, isLoading } = useMessages();

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSend={addMessage} />
    </div>
  );
};

export default ChatContainer;