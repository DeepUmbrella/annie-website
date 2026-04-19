import { Link } from 'react-router-dom';

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const baseClass =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200';

const variantClass = {
  primary:
    'bg-gradient-to-r from-annie-cyan via-sky-400 to-annie-lavender text-slate-950 shadow-glow-lg hover:-translate-y-0.5 hover:brightness-110',
  secondary:
    'border border-white/15 bg-white/6 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/10',
};

const ButtonLink = ({ to, children, variant = 'primary' }: ButtonLinkProps) => (
  <Link to={to} className={`${baseClass} ${variantClass[variant]}`}>
    {children}
  </Link>
);

export default ButtonLink;
