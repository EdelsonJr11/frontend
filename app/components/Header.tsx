"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-[var(--logo-beige-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--logo-beige-bg)]/80 shadow-sm"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/LogoResidencial.jpg"
            alt="Residencial Pôr do Sol"
            width={60}
            height={60}
            className="rounded-lg shadow-md"
            priority
          />
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--logo-green-dark)] leading-tight">
              Residencial Pôr do Sol
            </h1>
            <p className="text-xs text-[var(--logo-green-mid)] font-medium">
              Reveillon 2026
            </p>
          </div>
        </div>
        
        <nav className="hidden sm:flex items-center gap-4">
          <a
            href="#rifas"
            className="text-sm font-medium text-[var(--logo-green-dark)] hover:text-[var(--logo-orange)] transition-colors"
          >
            Sorteios
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-[var(--logo-green-dark)] hover:text-[var(--logo-orange)] transition-colors"
          >
            Como Funciona
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
