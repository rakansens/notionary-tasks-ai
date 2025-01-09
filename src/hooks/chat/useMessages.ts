import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type ChatMode = 'user' | 'assistant';

export interface Message {
  id: number;
  content: string;
  mode: ChatMode;
  taskId?: number;
  groupId?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UseMessagesProps {
  taskId?: number;
  groupId?: number;
}

export const useMessages = ({ taskId, groupId }: UseMessagesProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "こんにちは！タスクの整理や提案をお手伝いします。",
      mode: "assistant",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMessage = async (content: string, mode: ChatMode = 'user') => {
    try {
      setIsLoading(true);
      
      // ユーザーメッセージを追加
      const userMessage: Message = {
        id: Date.now(),
        content,
        mode,
        taskId,
        groupId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Edge Functionを呼び出し
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: {
          messages: [...messages, userMessage],
        },
      });

      if (error) throw error;

      // AIの応答を追加
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: data.content,
        mode: 'assistant',
        taskId,
        groupId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error adding message:', error);
      toast({
        title: 'エラー',
        description: 'メッセージの送信に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    addMessage,
  };
};