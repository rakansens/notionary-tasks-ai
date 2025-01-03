import { useState } from "react";
import { ChatSection } from "@/components/ChatSection";
import { TaskSection } from "@/components/TaskSection";
import { cn } from "@/lib/utils";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [showChat] = useState(true);
  const [showTasks] = useState(true);

  return (
    <div className="h-screen w-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="w-full">
        <ResizablePanel
          defaultSize={50}
          minSize={30}
          maxSize={70}
          className={cn(
            "transition-all duration-300 ease-in-out",
            !showChat && "min-w-[50px] !w-[50px]"
          )}
        >
          <div className="h-full relative">
            <div
              className={cn(
                "h-full transition-opacity duration-300",
                showChat ? "opacity-100" : "opacity-0"
              )}
            >
              {showChat && <ChatSection />}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={50}
          minSize={30}
          maxSize={70}
          className={cn(
            "transition-all duration-300 ease-in-out",
            !showTasks && "min-w-[50px] !w-[50px]"
          )}
        >
          <div className="h-full relative">
            <div
              className={cn(
                "h-full transition-opacity duration-300",
                showTasks ? "opacity-100" : "opacity-0"
              )}
            >
              {showTasks && <TaskSection />}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;