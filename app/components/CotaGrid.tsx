"use client";
import { Cota } from '../../lib/types';
import { motion } from 'framer-motion';

interface CotaGridProps {
  cotas: Cota[];
  loading?: boolean;
}

export function CotaGrid({ cotas, loading }: CotaGridProps) {
  if (loading) {
    return <div className="text-gray-500">Carregando cotas...</div>;
  }

  if (!Array.isArray(cotas) || cotas.length === 0) {
    return <div className="text-gray-500">Nenhuma cota disponível.</div>;
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-8 gap-2 max-h-64 overflow-auto border p-3 rounded-xl bg-white/70 backdrop-blur">
        {cotas.map((cota, idx) => {
          const numero = cota.numero ?? cota.numeroCota ?? idx;
          const isLivre = cota.status === 'livre' || cota.status === 'disponivel';
          const isReservada = cota.status === 'reservada' || cota.status === 'reservado';
          const isVendida = cota.status === 'vendida';
          return (
            <motion.div
              key={cota.id ?? numero}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs h-9 flex items-center justify-center rounded-md border font-medium select-none relative overflow-hidden
                ${isLivre ? 'bg-white text-gray-700' : ''}
                ${isReservada ? 'bg-yellow-400 text-black' : ''}
                ${isVendida ? 'bg-red-500 text-white' : ''}
              `.trim().replace(/\s+/g, ' ')}
              aria-label={`Cota ${numero} status ${cota.status}`}
            >
              {numero}
            </motion.div>
          );
        })}
      </div>
      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 mt-4 text-xs">
      <LegendItem color="bg-white border" label="Livre" />
      <LegendItem color="bg-green-600 text-white" label="Selecionada" />
      <LegendItem color="bg-yellow-400" label="Reservada" />
      <LegendItem color="bg-red-500 text-white" label="Vendida" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`h-4 w-4 rounded-sm inline-block border ${color}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
