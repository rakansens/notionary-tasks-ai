import { ChatSection } from "@/components/ChatSection";
import { TaskSection } from "@/components/TaskSection";

const Index = () => {
  return (
    <div className="h-screen flex">
      <div className="w-1/2 h-full">
        <ChatSection />
      </div>
      <div className="w-1/2 h-full">
        <TaskSection />
      </div>
    </div>
  );
};

export default Index;