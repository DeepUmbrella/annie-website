import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

const AuthShell = ({ title, description, children }: AuthShellProps) => {
  return (
    <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-annie-hero opacity-70 blur-3xl" />
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.045] p-10 shadow-glow-lg backdrop-blur-2xl md:p-12">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-annie-cyan">Annie AI</p>
          <h1 className="mt-4 text-[2.5rem] font-semibold tracking-[-0.02em] text-white md:text-[3rem] lg:text-[3.5rem]">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-white/68 md:text-base">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthShell;
