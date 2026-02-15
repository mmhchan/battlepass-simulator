import type { ReactNode } from 'react';

interface CardProps {
  title: ReactNode;
  children: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  accentColor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Card = ({ title, children, subtitle, action, accentColor, onMouseEnter, onMouseLeave }: CardProps) => {
  return (
    <div
      className="border border-sage-200 rounded-xl p-6 shadow-sm"
      style={{
        backgroundColor: accentColor ? `color-mix(in srgb, ${accentColor} 4%, white)` : 'white',
        borderTopColor: accentColor || undefined,
        borderTopWidth: accentColor ? '2px' : undefined,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-sage-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-sage-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
};
