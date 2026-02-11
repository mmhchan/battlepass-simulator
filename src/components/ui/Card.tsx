import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  subtitle?: string;
}

export const Card = ({ title, children, subtitle }: CardProps) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};