"use client";

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface CompraResumo {
  id: number;
  valor: string;
  status: string;
  metodo: string;
  mpPaymentId?: string | null;
  expiraEm?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  numerosReservados?: number[];
  usuario?: {
    id?: string;
    nome?: string | null;
    cpf?: string | null;
    telefone?: string | null;
    email?: string | null;
  } | null;
  rifa?: {
    id?: number;
    titulo?: string | null;
  } | null;
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  cancelado: 'Cancelado',
  expirado: 'Expirado',
};

const statusBadgeClasses: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pago: 'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-red-100 text-red-700 border-red-200',
  expirado: 'bg-gray-200 text-gray-700 border-gray-300',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
};

const parseValor = (valor: string | number | null | undefined) => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  const parsed = Number(valor);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function AdminComprasPage() {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:4000';
  const [token, setToken] = useState('');
  const [compras, setCompras] = useState<CompraResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'pago' | 'cancelado' | 'expirado'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const autoFetchOnce = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedToken = window.localStorage.getItem('adm-token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (token) {
      window.localStorage.setItem('adm-token', token);
    } else {
      window.localStorage.removeItem('adm-token');
    }
  }, [token]);

  const handleLoadCompras = useCallback(async () => {
    if (!token.trim()) {
      setError('Informe um token de administrador válido para consultar os pagamentos.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/pagamentos`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro ${response.status}: ${text.substring(0, 200)}`);
      }

      const payload = await response.json();
      setCompras(payload.data || []);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar compras');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    if (autoFetchOnce.current || !token) return;
    autoFetchOnce.current = true;
    handleLoadCompras();
  }, [token, handleLoadCompras]);

  const filteredCompras = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return compras.filter((compra) => {
      const matchesStatus = statusFilter === 'todos' || compra.status === statusFilter;
      if (!term) return matchesStatus;
      const content = [
        compra.usuario?.nome,
        compra.usuario?.cpf,
        compra.usuario?.telefone,
        compra.usuario?.email,
        compra.rifa?.titulo,
        compra.id?.toString(),
        compra.mpPaymentId ?? undefined,
      ];
      const normalizedContent = content
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase());
      const matchesTerm = normalizedContent.some((value) => value.includes(term));
      return matchesStatus && matchesTerm;
    });
  }, [compras, searchTerm, statusFilter]);

  const resumoGeral = useMemo(() => {
    return compras.reduce(
      (acc, compra) => {
        const valor = parseValor(compra.valor);
        acc.total += valor;
        acc.qtd += 1;
        acc.status[compra.status || 'pendente'] = (acc.status[compra.status || 'pendente'] || 0) + 1;
        if (compra.status === 'pago') {
          acc.totalPago += valor;
        }
        if (compra.status === 'pendente') {
          acc.totalPendente += valor;
        }
        return acc;
      },
      { total: 0, totalPago: 0, totalPendente: 0, qtd: 0, status: {} as Record<string, number> }
    );
  }, [compras]);

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="card shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase text-gray-500">Painel do administrador</p>
              <h1 className="text-2xl font-bold text-[var(--button-black)]">Monitoramento de compras</h1>
              <p className="text-sm text-gray-600">
                Visualize em tempo real quem comprou, status dos pagamentos e valores consolidados direto do backend.
              </p>
            </div>
            <Link href="/" className="btn-secondary">
              Voltar para a vitrine
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="card p-4 bg-[#f9f7ef]">
            <p className="text-xs uppercase text-gray-500">Compras registradas</p>
            <p className="text-2xl font-bold text-[var(--button-black)]">{resumoGeral.qtd}</p>
          </div>
          <div className="card p-4 bg-[#f0f8f2]">
            <p className="text-xs uppercase text-gray-500">Receita potencial</p>
            <p className="text-2xl font-bold text-[var(--primary-green)]">{currencyFormatter.format(resumoGeral.total)}</p>
          </div>
          <div className="card p-4 bg-[#eef4ff]">
            <p className="text-xs uppercase text-gray-500">Pagos</p>
            <p className="text-2xl font-bold text-[var(--button-black)]">
              {resumoGeral.status.pago || 0}
              <span className="block text-sm text-gray-600">{currencyFormatter.format(resumoGeral.totalPago)}</span>
            </p>
          </div>
          <div className="card p-4 bg-[#fff8f0]">
            <p className="text-xs uppercase text-gray-500">Pendentes</p>
            <p className="text-2xl font-bold text-[var(--button-black)]">
              {resumoGeral.status.pendente || 0}
              <span className="block text-sm text-gray-600">{currencyFormatter.format(resumoGeral.totalPendente)}</span>
            </p>
          </div>
        </div>

        <div className="card shadow-lg">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Token do administrador</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole aqui o token JWT"
                className="border rounded-lg px-3 py-2 w-full mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Filtrar por status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="border rounded-lg px-3 py-2 w-full mt-1"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
                <option value="expirado">Expirado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Busca rápida</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, CPF, e-mail, rifa..."
                className="border rounded-lg px-3 py-2 w-full mt-1"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button type="button" className="btn-primary" onClick={handleLoadCompras} disabled={loading}>
              {loading ? 'Carregando...' : 'Carregar compras'}
            </button>
            {lastUpdated && <span className="text-xs text-gray-500">Atualizado em {formatDateTime(lastUpdated)}</span>}
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </div>

        <div className="card shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[var(--button-black)]">{filteredCompras.length} registros encontrados</p>
              <p className="text-xs text-gray-500">Resultados já filtrados por status e busca</p>
            </div>
            <button
              type="button"
              onClick={() => setCompras([])}
              className="text-xs text-gray-500 underline"
              title="Limpar lista local"
            >
              Limpar memória local
            </button>
          </div>
          {filteredCompras.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-10">
              Nenhuma compra encontrada. Carregue os dados com o token de admin ou ajuste os filtros.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompras.map((compra) => (
                <div key={`${compra.id}-${compra.mpPaymentId ?? 'sem-mp'}`} className="border border-[#ece7da] rounded-xl p-4 bg-[#fcfaf5]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-gray-500">Rifa</p>
                      <p className="text-lg font-semibold text-[var(--button-black)]">{compra.rifa?.titulo || `Rifa #${compra.rifa?.id ?? '—'}`}</p>
                      <p className="text-sm text-gray-600">Pagamento #{compra.id}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadgeClasses[compra.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {statusLabels[compra.status] || compra.status || '—'}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-5 mt-3 text-sm">
                    <div>
                      <p className="text-xs uppercase text-gray-500">Comprador</p>
                      <p className="font-semibold text-[var(--button-black)]">{compra.usuario?.nome || '—'}</p>
                      <p className="text-xs text-gray-600">CPF: {compra.usuario?.cpf || '—'}</p>
                      <p className="text-xs text-gray-600">Contato: {compra.usuario?.telefone || compra.usuario?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Valor e método</p>
                      <p className="font-semibold text-[var(--primary-green)]">{currencyFormatter.format(parseValor(compra.valor))}</p>
                      <p className="text-xs text-gray-600">{compra.metodo?.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Identificadores</p>
                      <p className="text-xs text-gray-700">MP: {compra.mpPaymentId || '—'}</p>
                      <p className="text-xs text-gray-700">Expira em: {formatDateTime(compra.expiraEm)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Números</p>
                      {compra.numerosReservados && compra.numerosReservados.length > 0 ? (
                        <p className="text-xs text-gray-700 leading-5 break-words">
                          {compra.numerosReservados.join(', ')}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Linha do tempo</p>
                      <p className="text-xs text-gray-700">Criado: {formatDateTime(compra.createdAt)}</p>
                      <p className="text-xs text-gray-700">Atualizado: {formatDateTime(compra.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
