export interface User {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  role: 'admin' | 'cliente';
}

export interface Rifa {
  id: number;
  titulo: string;
  descricao: string;
  preco?: string; // mantido como string conforme payload
  precoCota?: string; // campo alternativo do backend
  totalCotas: number;
  dataSorteio: string; // ISO
}

export interface Cota {
  id?: number;
  rifaId?: number;
  numero: number;
  numeroCota?: number; // alias legado
  status: 'livre' | 'reservada' | 'vendida' | 'disponivel' | 'reservado';
  usuarioId?: string | null;
  reservaExpiraEm?: string | null;
}

export interface CheckoutResponse {
  message: string;
  data: {
    pagamentoId: number;
    mpPaymentId: string;
    status: string;
    qrCode: string;
    pixPayload: string;
    valor: number;
    expiraEm: string;
    cotas: number[];
  };
}

export interface PagamentoStatus {
  id: number;
  status: string;
  metodoPagamento: string;
  valor: number;
  rifasId?: number;
}
