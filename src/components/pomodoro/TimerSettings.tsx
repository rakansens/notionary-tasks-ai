import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimerSettingsProps {
  onPresetSelect: (minutes: number) => void;
  onBreakSelect: (minutes: number) => void;
  breakMinutes: number;
}

export const PRESET_TIMES = [
  { label: "5分", value: 5 },
  { label: "10分", value: 10 },
  { label: "15分", value: 15 },
  { label: "25分", value: 25 },
  { label: "60分", value: 60 },
  { label: "90分", value: 90 },
];

export const BREAK_TIMES = [
  { label: "3分", value: 3 },
  { label: "5分", value: 5 },
  { label: "10分", value: 10 },
  { label: "15分", value: 15 },
];

export const TimerSettings = ({
  onPresetSelect,
  onBreakSelect,
  breakMinutes,
}: TimerSettingsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-medium">作業時間</h4>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_TIMES.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              className="w-full"
              onClick={() => onPresetSelect(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">休憩時間</h4>
        <div className="grid grid-cols-2 gap-2">
          {BREAK_TIMES.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              className={cn(
                "w-full",
                breakMinutes === preset.value && "bg-green-50 text-green-500"
              )}
              onClick={() => onBreakSelect(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};