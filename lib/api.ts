import { Rifa, Cota, CheckoutResponse, PagamentoStatus } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface RequestOptions {
  token?: string | null;
  method?: string;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Auth
export async function login(email: string, password: string) {
  return request<{ token: string; user: { id: string; nome: string; role: 'admin' | 'cliente'; email: string } }>(`/api/auth/login`, {
    method: 'POST',
    body: { email, password }
  });
}

export async function register(data: { nome: string; cpf: string; telefone: string; email: string; password: string; role: 'admin' | 'cliente' }) {
  return request<{ message: string }>(`/api/auth/register`, { method: 'POST', body: data });
}

// Rifas
export async function listarRifas(): Promise<Rifa[]> {
  type RifasResponsePossible = Rifa[] | { data: Rifa[] } | { rifas: Rifa[] };
  const raw = await request<RifasResponsePossible>(`/api/rifas`);
  if (Array.isArray(raw)) return raw;
  if ('data' in raw && Array.isArray(raw.data)) return raw.data;
  if ('rifas' in raw && Array.isArray(raw.rifas)) return raw.rifas;
  throw new Error('Formato inesperado da resposta de /api/rifas');
}

export async function criarRifa(token: string, body: { titulo: string; descricao: string; preco: string; totalCotas: number; dataSorteio: string }) {
  return request<Rifa>(`/api/rifas`, { method: 'POST', token, body });
}

export async function listarCotas(rifaId: number): Promise<Cota[]> {
  type CotasResponsePossible = Cota[] | { data: Cota[]; message?: string } | { cotas: Cota[] };
  const raw = await request<CotasResponsePossible>(`/api/rifas/${rifaId}/cotas`);
  if (Array.isArray(raw)) return raw;
  if ('data' in raw && Array.isArray(raw.data)) return raw.data;
  if ('cotas' in raw && Array.isArray(raw.cotas)) return raw.cotas;
  throw new Error('Formato inesperado da resposta de /api/rifas/:id/cotas');
}

export async function reservarCota(token: string, rifaId: number, numeroCota: number) {
  return request<{ message: string }>(`/api/rifas/${rifaId}/reservar`, {
    method: 'POST',
    token,
    body: { numeroCota }
  });
}

export async function comprarCotas(
  rifaId: number,
  numerosCota: number[],
  clienteTelefone: string,
  clienteCpf: string,
  token?: string | null
) {
  return request<CheckoutResponse>(`/api/rifas/${rifaId}/comprar`, {
    method: 'POST',
    token,
    body: { numerosCota, metodoPagamento: 'pix', clienteTelefone, clienteCpf }
  });
}

// Pagamentos
export async function criarCheckoutPix(
  rifaId: number,
  quantidadeCotas: number,
  clienteTelefone: string,
  clienteCpf: string,
  token?: string | null
) {
  return request<CheckoutResponse>(`/api/pagamentos/checkout`, {
    method: 'POST',
    token,
    body: { rifaId, quantidadeCotas, metodoPagamento: 'pix', clienteTelefone, clienteCpf }
  });
}

export async function statusPagamento(token: string, pagamentoId: number) {
  return request<PagamentoStatus>(`/api/pagamentos/${pagamentoId}`, { token });
}

// Utilitário para obter token do cliente (localStorage)
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
}
