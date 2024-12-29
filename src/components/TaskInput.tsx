import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  groupId?: number;
}

export const TaskInput = ({ value, onChange, onSubmit, groupId }: TaskInputProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded-md border border-input"
        onClick={() => onSubmit()}
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && onSubmit()}
        placeholder="新しいタスクを追加..."
        className={cn("flex-1", !groupId && "h-7 py-0")}
      />
    </div>
  );
};