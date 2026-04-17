import type { ReactNode } from 'react';
import Section from './Section';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

const PageHero = ({ eyebrow, title, description, actions }: PageHeroProps) => {
  return (
    <Section className="pt-12 md:pt-20">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
          {eyebrow}
        </span>
        <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-white md:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-xl">
          {description}
        </p>
        {actions ? <div className="mt-8 flex flex-wrap justify-center gap-4">{actions}</div> : null}
      </div>
    </Section>
  );
};

export default PageHero;
