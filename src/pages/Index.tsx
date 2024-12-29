import { useState } from "react";
import { ChatSection } from "@/components/ChatSection";
import { TaskSection } from "@/components/TaskSection";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [showChat, setShowChat] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  return (
    <div className="h-screen flex bg-background">
      <div
        className={cn(
          "transition-all duration-300 ease-in-out border-r border-border",
          showChat ? "w-1/2" : "w-[50px]"
        )}
      >
        <div className="h-full relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={() => setShowChat(!showChat)}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          <div
            className={cn(
              "h-full transition-opacity duration-300",
              showChat ? "opacity-100" : "opacity-0"
            )}
          >
            {showChat && <ChatSection />}
          </div>
        </div>
      </div>
      
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          showTasks ? "w-1/2" : "w-[50px]"
        )}
      >
        <div className="h-full relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-10"
            onClick={() => setShowTasks(!showTasks)}
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
          <div
            className={cn(
              "h-full transition-opacity duration-300",
              showTasks ? "opacity-100" : "opacity-0"
            )}
          >
            {showTasks && <TaskSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;