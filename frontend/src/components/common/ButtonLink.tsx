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
    'bg-gradient-to-r from-annie-purple to-annie-lavender text-white shadow-glow hover:-translate-y-0.5',
  secondary:
    'border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10',
};

const ButtonLink = ({ to, children, variant = 'primary' }: ButtonLinkProps) => (
  <Link to={to} className={`${baseClass} ${variantClass[variant]}`}>
    {children}
  </Link>
);

export default ButtonLink;
