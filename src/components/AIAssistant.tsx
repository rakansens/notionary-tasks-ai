import { FC } from 'react';
import { ChatContainer } from './chat/ChatContainer';

interface AIAssistantProps {
  isOpen: boolean;
}

export const AIAssistant: FC<AIAssistantProps> = ({ isOpen }) => {
  return (
    <div className={`fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-lg ${
      isOpen ? 'block' : 'hidden'
    }`}>
      <ChatContainer />
    </div>
  );
};