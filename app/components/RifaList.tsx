"use client";
import { Rifa } from '../../lib/types';
import { motion } from 'framer-motion';
import { AnimatedButton } from './AnimatedButton';

interface RifaListProps {
  rifas: Rifa[];
  selectedRifaId: number | null;
  onSelectRifa: (id: number) => void;
  loading?: boolean;
}

export function RifaList({ rifas, selectedRifaId, onSelectRifa, loading }: RifaListProps) {
  if (loading) {
    return <SkeletonGrid />;
  }

  if (!Array.isArray(rifas) || rifas.length === 0) {
    return (
      <div className="text-gray-500 text-sm bg-white/40 backdrop-blur rounded p-4 border">
        Nenhuma rifa disponível.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rifas.map((rifa, idx) => {
        const isSelected = selectedRifaId === rifa.id;
        return (
          <motion.div
            key={rifa.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative group rounded-xl border shadow-sm overflow-hidden bg-gradient-to-br from-white to-[var(--logo-beige-bg)] hover:shadow-lg transition ${isSelected ? 'ring-2 ring-[var(--logo-orange)]' : ''}`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition" style={{background:'radial-gradient(circle at 30% 20%, rgba(255,143,28,0.15), transparent 70%)'}} />
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-800 leading-snug line-clamp-2">{rifa.titulo}</h3>
                {isSelected && (
                  <motion.span
                    layoutId={`badge-${rifa.id}`}
                    className="text-xs px-2 py-1 rounded-full bg-[var(--logo-orange)] text-[var(--logo-green-dark)] font-semibold shadow"
                  >Selecionada</motion.span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{rifa.descricao || 'Rifa sem descrição.'}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <InfoPill label="Preço da Cota" value={`R$ ${rifa.precoCota || rifa.preco || '0,00'}`} />
                <InfoPill label="Total" value={`${rifa.totalCotas} cotas`} />
                {rifa.dataSorteio && <InfoPill label="Sorteio" value={new Date(rifa.dataSorteio).toLocaleDateString('pt-BR')} />}
              </div>
              <AnimatedButton
                ariaLabel={`Selecionar rifa ${rifa.titulo}`}
                variant={isSelected ? 'secondary' : 'primary'}
                full
                onClick={() => onSelectRifa(rifa.id)}
              >
                {isSelected ? 'Continuar escolhendo cotas' : 'Selecionar Rifa'}
              </AnimatedButton>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="px-2 py-1 rounded bg-[var(--logo-beige-bg)] text-[var(--logo-green-dark)] font-medium border border-[var(--logo-green-dark)]/20">
      {label}: <span className="font-semibold">{value}</span>
    </span>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border bg-white p-5 space-y-3">
          <div className="h-5 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
