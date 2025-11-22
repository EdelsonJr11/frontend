"use client";
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  full?: boolean;
  ariaLabel?: string;
}

const base = 'relative inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<string, string> = {
  primary: 'bg-gradient-to-r from-[var(--logo-orange)] to-[var(--logo-orange-light)] text-[var(--logo-green-dark)] shadow hover:shadow-lg',
  secondary: 'bg-gradient-to-r from-[var(--logo-green-mid)] to-[var(--logo-green-dark)] text-[var(--logo-beige-text)] shadow hover:shadow-lg',
  danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow hover:shadow-lg',
  outline: 'border-2 border-[var(--logo-green-dark)] text-[var(--logo-green-dark)] hover:bg-[var(--logo-beige-bg)]'
};

export function AnimatedButton({ children, onClick, disabled, variant='primary', full, ariaLabel }: AnimatedButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${full ? 'w-full px-5 py-3 text-sm' : 'px-4 py-2 text-sm'}`}
    >
      <span className="pointer-events-none select-none">
        {children}
      </span>
      {/* Glow */}
      {!disabled && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 70%)' }}
        />
      )}
    </motion.button>
  );
}
