import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTaskManager } from "@/hooks/useTaskManager";
import { TaskAnalysis } from "./TaskAnalysis";

interface Message {
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

      // タスク分析の応答かどうかを判断
      const isTaskAnalysis = data.response.includes("優先度の高いタスク") || 
                            data.response.includes("優先度の低いタスク");

      // 応答をパースしてタスクオブジェクトに変換
      const parsedTasks = isTaskAnalysis ? parseTaskAnalysis(data.response) : null;

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        taskAnalysis: parsedTasks // 新しいプロパティを追加
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

  // タスク分析テキストをパースする関数
  const parseTaskAnalysis = (text: string) => {
    const tasks: any[] = [];
    
    // 高優先度タスクの抽出
    const highPriorityMatch = text.match(/優先度の高いタスク：([\s\S]*?)(?=優先度の低いタスク|$)/);
    if (highPriorityMatch) {
      const highPriorityTasks = highPriorityMatch[1].match(/\* ([^\n]+)/g);
      highPriorityTasks?.forEach(task => {
        const title = task.replace('* ', '').trim();
        tasks.push({ title, priority: 'high' });
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
              {message.taskAnalysis ? (
                <div className="w-full">
                  <TaskAnalysis tasks={message.taskAnalysis} />
                </div>
              ) : (
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
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-6 border-t">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="icon"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
