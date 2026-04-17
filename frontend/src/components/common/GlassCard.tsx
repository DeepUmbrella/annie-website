import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-glow backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
