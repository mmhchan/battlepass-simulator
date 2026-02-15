import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  tooltip?: string;
}

export const Slider = ({ label, value, min, max, step = 1, onChange, suffix = "", prefix = "", tooltip }: SliderProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-sage-500 inline-flex items-center gap-1">
          {label}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info size={12} className="text-sage-300 hover:text-sage-500 cursor-help transition-colors" />
            </Tooltip>
          )}
        </label>
        <span className="text-sm font-mono text-sage-600">
          {prefix}{step < 1 ? localValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : localValue.toLocaleString()}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={(e) => setLocalValue(Number(e.target.value))}
        onMouseUp={() => onChange(localValue)}
        onTouchEnd={() => onChange(localValue)}
        className="w-full h-1.5 bg-sage-100 rounded-lg appearance-none cursor-pointer accent-sage-600"
      />
    </div>
  );
};
