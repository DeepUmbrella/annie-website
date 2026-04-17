import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
}

const Section = ({ children, className }: SectionProps) => {
  const baseClass = 'mx-auto w-full max-w-8xl px-6 py-16 md:px-8 md:py-24';
  return (
    <section className={className ? `${baseClass} ${className}` : baseClass}>
      {children}
    </section>
  );
};

export default Section;
