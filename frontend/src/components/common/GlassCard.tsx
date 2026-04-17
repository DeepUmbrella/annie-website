import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div className={`rounded-[2rem] border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-glow backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
