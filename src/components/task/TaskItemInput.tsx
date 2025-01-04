import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface TaskItemInputProps {
  value: string;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const TaskItemInput = ({
  value,
  onBlur,
  onKeyDown,
  placeholder = "新しいタスク",
  autoFocus = true,
}: TaskItemInputProps) => {
  return (
    <Input
      value={value}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="h-6 text-sm"
      autoFocus={autoFocus}
    />
  );
};