import { motion } from 'motion/react';
import clsx from 'clsx';

export function Card({ children, className, hover = false, glow = false, padding = 'p-5', ...rest }) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? { whileHover: { y: -2, transition: { type: 'spring', stiffness: 300, damping: 20 } } }
    : {};

  return (
    <Component
      className={clsx(
        'glass-card rounded-2xl',
        padding,
        glow && 'shadow-glow-accent',
        hover && 'cursor-pointer',
        className
      )}
      {...motionProps}
      {...rest}
    >
      {children}
    </Component>
  );
}
