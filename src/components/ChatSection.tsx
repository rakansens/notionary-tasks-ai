import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTaskManager } from "@/hooks/useTaskManager";
import { ChatMessage } from "./chat/ChatMessage";
import { ChatInput } from "./chat/ChatInput";
import { Message } from "@/types/messages";

export const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { tasks, groups } = useTaskManager();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: { 
          message: input,
          tasks,
          groups
        }
      });

      if (error) throw error;

      const isTaskAnalysis = data.response.includes("優先度の高いタスク") || 
                            data.response.includes("優先度の低いタスク");

      const parsedTasks = isTaskAnalysis ? parseTaskAnalysis(data.response) : null;

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        taskAnalysis: parsedTasks
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      toast({
        title: "エラーが発生しました",
        description: "AIアシスタントとの通信中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseTaskAnalysis = (text: string) => {
    const tasks: any[] = [];
    
    // 緊急タスクの抽出
    const urgentMatch = text.match(/緊急タスク：([\s\S]*?)(?=高|優先度の高いタスク|$)/);
    if (urgentMatch) {
      const urgentTasks = urgentMatch[1].match(/\* ([^\n]+)/g);
      urgentTasks?.forEach(task => {
        const title = task.replace('* ', '').trim();
        tasks.push({ title, priority: 'urgent' });
      });
    }

    // 高優先度タスクの抽出
    const highPriorityMatch = text.match(/優先度の高いタスク：([\s\S]*?)(?=中|優先度の中程度のタスク|優先度の低いタスク|$)/);
    if (highPriorityMatch) {
      const highPriorityTasks = highPriorityMatch[1].match(/\* ([^\n]+)/g);
      highPriorityTasks?.forEach(task => {
        const title = task.replace('* ', '').trim();
        tasks.push({ title, priority: 'high' });
      });
    }

    // 中優先度タスクの抽出
    const mediumPriorityMatch = text.match(/優先度の中程度のタスク：([\s\S]*?)(?=低|優先度の低いタスク|$)/);
    if (mediumPriorityMatch) {
      const mediumPriorityTasks = mediumPriorityMatch[1].match(/\* ([^\n]+)/g);
      mediumPriorityTasks?.forEach(task => {
        const title = task.replace('* ', '').trim();
        tasks.push({ title, priority: 'medium' });
      });
    }

    // 低優先度タスクの抽出
    const lowPriorityMatch = text.match(/優先度の低いタスク：([\s\S]*?)(?=依存関係|$)/);
    if (lowPriorityMatch) {
      const lowPriorityTasks = lowPriorityMatch[1].match(/\* ([^\n]+)/g);
      lowPriorityTasks?.forEach(task => {
        const title = task.replace('* ', '').trim();
        tasks.push({ title, priority: 'low' });
      });
    }

    // 依存関係の抽出と設定
    const dependenciesMatch = text.match(/依存関係：([\s\S]*?)(?=最適化されたタスクリスト|$)/);
    if (dependenciesMatch) {
      const dependencies = dependenciesMatch[1].match(/\* ([^\n]+)/g);
      dependencies?.forEach(dep => {
        const depText = dep.replace('* ', '').trim();
        const [taskTitle, dependsOn] = depText.split('は、');
        const task = tasks.find(t => t.title.includes(taskTitle));
        if (task) {
          task.dependencies = task.dependencies || [];
          task.dependencies.push(dependsOn.replace('後に', '').replace('する必要があります。', ''));
        }
      });
    }

    // コンテキストの抽出
    const workMatch = text.match(/仕事：([\s\S]*?)(?=個人|$)/);
    if (workMatch) {
      const workTasks = workMatch[1].match(/\* ([^\n]+)/g);
      workTasks?.forEach(taskText => {
        const title = taskText.replace('* ', '').trim();
        const task = tasks.find(t => t.title === title);
        if (task) {
          task.context = 'work';
        }
      });
    }

    const personalMatch = text.match(/個人：([\s\S]*?)(?=優先度|$)/);
    if (personalMatch) {
      const personalTasks = personalMatch[1].match(/\* ([^\n]+)/g);
      personalTasks?.forEach(taskText => {
        const title = taskText.replace('* ', '').trim();
        const task = tasks.find(t => t.title === title);
        if (task) {
          task.context = 'personal';
        }
      });
    }

    // グループの抽出
    const projectMatch = text.match(/プロジェクト：([\s\S]*?)(?=コンテキスト別|$)/);
    if (projectMatch) {
      let currentGroup = '';
      const lines = projectMatch[1].split('\n');
      lines.forEach(line => {
        if (line.startsWith('* ')) {
          const groupName = line.replace('* ', '').trim();
          currentGroup = groupName;
        } else if (line.startsWith('  * ')) {
          const title = line.replace('  * ', '').trim();
          const task = tasks.find(t => t.title === title);
          if (task) {
            task.group = currentGroup;
          }
        }
      });
    }

    return tasks;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-foreground">AIアシスタント</h2>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <ChatMessage message={message} />
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={handleSend}
      />
    </div>
  );
};
