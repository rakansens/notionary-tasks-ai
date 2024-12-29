import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  groupId?: number;
}

export const TaskInput = ({ value, onChange, onSubmit, groupId }: TaskInputProps) => {
  const [isInputVisible, setIsInputVisible] = useState(false);

  const handleSubmit = () => {
    onSubmit();
    setIsInputVisible(false);
  };

  return (
    <div className="flex items-center gap-1 group/input">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-5 w-5 rounded-md border border-input transition-colors duration-200",
          !isInputVisible && "hover:border-primary/50"
        )}
        onClick={() => setIsInputVisible(true)}
      >
        <Plus className="h-3 w-3" />
      </Button>
      {isInputVisible && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          onBlur={() => {
            if (!value) setIsInputVisible(false);
          }}
          placeholder="新しいタスクを追加..."
          className={cn(
            "flex-1 transition-colors duration-200",
            !groupId && "h-7 py-0",
            "bg-transparent hover:bg-muted/50 focus:bg-background"
          )}
          autoFocus
        />
      )}
    </div>
  );
};