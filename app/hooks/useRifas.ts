import { useState, useEffect } from 'react';
import { listarRifas, listarCotas } from '../../lib/api';
import { Rifa, Cota } from '../../lib/types';

export function useRifas() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [rifasLoading, setRifasLoading] = useState(false);
  const [selectedRifaId, setSelectedRifaId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRifas();
  }, []);

  async function loadRifas() {
    try {
      setRifasLoading(true);
      setError(null);
      const data = await listarRifas();
      setRifas(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao listar rifas');
    } finally {
      setRifasLoading(false);
    }
  }

  function selectRifa(id: number) {
    setSelectedRifaId(id);
  }

  return {
    rifas,
    rifasLoading,
    selectedRifaId,
    error,
    loadRifas,
    selectRifa,
    setError
  };
}

export function useCotas(rifaId: number | null) {
  const [cotas, setCotas] = useState<Cota[]>([]);
  const [cotasLoading, setCotasLoading] = useState(false);

  async function loadCotas() {
    if (rifaId == null) return;
    try {
      setCotasLoading(true);
      const data = await listarCotas(rifaId);
      setCotas(data);
    } finally {
      setCotasLoading(false);
    }
  }

  return {
    cotas,
    cotasLoading,
    loadCotas
  };
}
