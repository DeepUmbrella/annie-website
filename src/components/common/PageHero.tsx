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
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
          {description}
        </p>
        {actions ? <div className="mt-8 flex flex-wrap justify-center gap-4">{actions}</div> : null}
      </div>
    </Section>
  );
};

export default PageHero;
