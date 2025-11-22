"use client";

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

interface Rifa {
  id: number;
  titulo: string;
  descricao?: string;
  precoCota: string;
  totalCotas: number;
  status: string;
  promocaoQuantidade?: number;
  promocaoValor?: string;
  promocaoAtiva?: string;
}

const carouselImages = [
  '/IMG-20251120-WA0002.jpg',
  '/IMG-20251120-WA0006.jpg',
  '/IMG-20251120-WA0009.jpg',
  '/IMG-20251120-WA0010.jpg',
  '/IMG-20251120-WA0013.jpg',
  '/IMG-20251120-WA0014.jpg',
  '/IMG-20251120-WA0017.jpg',
  '/IMG-20251120-WA0018.jpg',
  '/IMG-20251120-WA0021.jpg',
  '/IMG-20251120-WA0024.jpg',
];

const logoPath = '/LogoResidencial.jpg';
const videoPath = '/IMG_3309.mp4';
const MIN_COTAS = 3;

type CheckoutResumo = {
  quantidade: number;
  total: number;
  rifaTitulo: string;
  numeros?: number[];
  pagamentoId?: number;
  reservaExpiraEm?: string;
};

export function RifaBuyCotas() {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:4000';
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [cotasQuantidade, setCotasQuantidade] = useState(MIN_COTAS);
  const [precoFinal, setPrecoFinal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aba, setAba] = useState<'principal' | 'espaco'>('principal');
  const [checkoutPreview, setCheckoutPreview] = useState<CheckoutResumo | null>(null);
  const [showCheckoutOverlay, setShowCheckoutOverlay] = useState(false);
  const [overlayStep, setOverlayStep] = useState<'form' | 'preview'>('form');
  const [customerInfo, setCustomerInfo] = useState({ nome: '', cpf: '', telefone: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [reservaLoading, setReservaLoading] = useState(false);
  const [reservaError, setReservaError] = useState<string | null>(null);
  const [reservaMensagem, setReservaMensagem] = useState<string | null>(null);

  const fetchRifas = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await fetch(`${API_BASE}/api/rifas`);
      if (!response.ok) {
        const text = await response.text();
        setErrorMessage(`Falha ao carregar rifas: ${response.status} ${response.statusText} - ${text}`);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        setErrorMessage(`Resposta inválida do servidor: esperado JSON, recebido: ${text.substring(0, 200)}`);
        return;
      }

      const data = await response.json();
      const lista = data.data || [];
      setRifas(lista);
      if (lista.length > 0) {
        setSelectedRifa(lista[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar rifas:', error);
      setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está rodando (porta 4000).');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchRifas();
  }, [fetchRifas]);

  

  const handleConfirmarReserva = async () => {
    if (!checkoutPreview || !selectedRifa) return;
    if (!customerInfo.nome.trim() || !customerInfo.cpf.trim() || !customerInfo.telefone.trim()) {
      setOverlayStep('form');
      setFormError('Preencha todos os dados para confirmar a reserva.');
      return;
    }

    setFormError(null);
    setReservaError(null);
    setReservaMensagem(null);
    setReservaLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/rifas/${selectedRifa.id}/reserva-rapida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: customerInfo.nome.trim(),
          cpf: customerInfo.cpf.trim(),
          telefone: customerInfo.telefone.trim(),
          quantidade: checkoutPreview.quantidade,
          metodo: 'pix',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro ${response.status}: ${text.substring(0, 200)}`);
      }

      const payload = await response.json();
      const data = payload.data || payload;

      setCheckoutPreview((prev) =>
        prev
          ? {
              ...prev,
              numeros: data.numerosReservados,
              pagamentoId: data.pagamentoId,
              reservaExpiraEm: data.reservaExpiraEm,
            }
          : prev
      );

      setReservaMensagem('Reserva confirmada! Gere o pagamento PIX em até 20 minutos para garantir suas cotas.');
    } catch (error) {
      setReservaError(error instanceof Error ? error.message : 'Erro ao registrar reserva.');
    } finally {
      setReservaLoading(false);
    }
  };

  const calcularPrecoFinal = (quantidade: number, rifa: Rifa | null) => {
    if (!rifa || quantidade === 0) return 0;

    const precoCota = parseFloat(rifa.precoCota);
    const promocaoAtiva = rifa.promocaoAtiva === 'true';
    const promocaoQuantidade = rifa.promocaoQuantidade || 50;
    const promocaoValor = parseFloat(rifa.promocaoValor || '10.00');

    if (!promocaoAtiva || quantidade < promocaoQuantidade) {
      return quantidade * precoCota;
    }

    const pacotes = Math.floor(quantidade / promocaoQuantidade);
    const cotasRestantes = quantidade % promocaoQuantidade;

    const totalPromo = pacotes * promocaoValor;
    const totalRestante = cotasRestantes * precoCota;

    return totalPromo + totalRestante;
  };

  useEffect(() => {
    setPrecoFinal(calcularPrecoFinal(cotasQuantidade, selectedRifa));
  }, [cotasQuantidade, selectedRifa]);

  const handleAdicionarCotas = (quantidade: number) => {
    setCotasQuantidade((prev) => prev + quantidade);
  };

  const handleRemoverCotas = () => {
    setCotasQuantidade(MIN_COTAS);
    setCheckoutPreview(null);
    setShowCheckoutOverlay(false);
    setCustomerInfo({ nome: '', cpf: '', telefone: '' });
    setOverlayStep('form');
    setFormError(null);
    setReservaError(null);
    setReservaMensagem(null);
  };

  const handleComprar = () => {
    if (!selectedRifa || cotasQuantidade < MIN_COTAS) {
      alert(`Selecione pelo menos ${MIN_COTAS} cotas`);
      return;
    }

    const rifaSelecionada = selectedRifa;
    const totalCalculado = calcularPrecoFinal(cotasQuantidade, rifaSelecionada);

    setFormError(null);
    setReservaError(null);
    setReservaMensagem(null);
    setCustomerInfo({ nome: '', cpf: '', telefone: '' });
    setCheckoutPreview({
      quantidade: cotasQuantidade,
      total: totalCalculado,
      rifaTitulo: rifaSelecionada.titulo,
    });
    setOverlayStep('form');
    setShowCheckoutOverlay(true);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando rifa...</div>;
  }

  if (errorMessage) {
    return (
      <div className="text-center py-8">
        <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-300 rounded">
          <h2 className="text-xl font-bold text-red-700">Erro ao carregar rifas</h2>
          <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          <p className="text-sm text-gray-600 mt-3">
            Verifique se o backend está rodando em <code>http://localhost:4000</code> e se as variáveis de ambiente foram configuradas corretamente.
          </p>
        </div>
      </div>
    );
  }

  if (rifas.length === 0) {
    return <div className="text-center py-8">Nenhuma rifa disponível</div>;
  }

  const promocaoAtiva = selectedRifa?.promocaoAtiva === 'true';
  const promocaoQuantidade = selectedRifa?.promocaoQuantidade || 50;
  const precoPorCota = selectedRifa ? parseFloat(selectedRifa.precoCota) : 0;

  return (
    <div className="relative">
      <div className="min-h-screen bg-[var(--background)] p-2 md:p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="max-w-md mx-auto">
            <div className="card shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 bg-[var(--button-black)] p-3 rounded-t-lg">
              <Image src={logoPath} alt="Logo" width={40} height={40} className="h-10 w-10 rounded object-cover" />
              <div className="flex-1">
                <h1 className="text-lg font-bold text-[var(--button-beige)] leading-tight">Réveillon no Residencial Pôr do Sol</h1>
                <span className="block text-xs text-[var(--button-beige)]">Ver meus números</span>
                <span className="block text-xs text-[var(--primary-green)] font-semibold">Top compradores</span>
              </div>
            </div>

            <div className="mb-4">
              <Carousel showThumbs={false} showStatus={false} infiniteLoop autoPlay interval={4000} className="rounded-lg overflow-hidden">
                {carouselImages.map((src, idx) => (
                  <div key={idx}>
                    <Image src={src} alt={`Foto ${idx + 1}`} width={600} height={320} className="object-cover w-full h-48" />
                  </div>
                ))}
              </Carousel>
            </div>

            <div className="flex gap-2 mb-4 px-4">
              {aba === 'espaco' && (
                <button
                  className="btn-secondary flex-1 border-2 border-[var(--primary-green)]"
                  onClick={() => setAba('principal')}
                >
                  Concorrer já!
                </button>
              )}
              <button
                className={`btn-secondary ${aba === 'espaco' ? 'flex-1' : 'w-full'} text-sm py-2 ${aba === 'espaco' ? '' : 'border-2 border-[var(--primary-green)]'}`}
                onClick={() => setAba('espaco')}
              >
                Conheça seu espaço
              </button>
            </div>

            <div className="p-4">
              {aba === 'principal' ? (
                <>
                  {rifas.length > 1 && (
                    <div className="mb-6">
                      <label className="block text-lg font-semibold text-gray-800 mb-3">Selecione a Rifa:</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rifas.map((rifa) => (
                          <button
                            key={rifa.id}
                            onClick={() => setSelectedRifa(rifa)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedRifa?.id === rifa.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-300 bg-white hover:border-orange-300'
                            }`}
                          >
                            <div className="font-semibold text-gray-800">{rifa.titulo}</div>
                            <div className="text-sm text-gray-600">{rifa.descricao}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRifa && (
                    <>
                      {promocaoAtiva && (
                        <div className="mb-4 flex items-center gap-2">
                          <span className="bg-[var(--primary-green)] text-[var(--button-beige)] px-3 py-1 rounded font-bold text-sm">
                            {promocaoQuantidade} por R$ {selectedRifa.promocaoValor}
                          </span>
                          <span className="text-xs bg-[var(--button-black)] text-[var(--button-beige)] px-2 py-1 rounded">Promoção</span>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {[10, 20, 50, 100, 200, 300].map((qtd) => (
                            <button
                              key={qtd}
                              onClick={() => handleAdicionarCotas(qtd)}
                              className={`btn-quick py-2 rounded-lg font-bold text-sm border-2 transition-all ${
                                qtd === 50
                                  ? 'bg-[var(--button-beige)] text-[var(--primary-green)] border-[var(--primary-green)] shadow-md'
                                  : 'bg-[#f3f3e6] text-[var(--button-black)] border-[#e0e0c0]'
                              }`}
                            >
                              +{qtd}
                              {qtd === 50 && (
                                <span className="pulse-badge absolute -top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                                  Mais popular
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-2 my-2">
                          <button
                            onClick={() => setCotasQuantidade((prev) => Math.max(MIN_COTAS, prev - 1))}
                            className="btn-secondary w-8 h-8 flex items-center justify-center"
                            disabled={cotasQuantidade <= MIN_COTAS}
                          >
                            -
                          </button>
                          <span className="text-xl font-bold w-8 text-center">{cotasQuantidade}</span>
                          <button onClick={() => setCotasQuantidade((prev) => prev + 1)} className="btn-secondary w-8 h-8 flex items-center justify-center">
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mb-4 card border border-[var(--primary-green)]">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-[var(--button-black)]">Subtotal</span>
                          <span className="font-semibold">R$ {(cotasQuantidade * precoPorCota).toFixed(2)}</span>
                        </div>
                        {promocaoAtiva && cotasQuantidade >= promocaoQuantidade && (
                          <div className="flex justify-between mb-2 text-[var(--primary-green)]">
                            <span>Desconto (Promoção)</span>
                            <span className="font-semibold">-R$ {(cotasQuantidade * precoPorCota - precoFinal).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-bold mt-2">
                          <span>Total a Pagar:</span>
                          <span className="text-[var(--primary-green)]">R$ {precoFinal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <button onClick={handleRemoverCotas} className="btn-secondary self-end text-sm px-3 py-1.5">
                          Limpar
                        </button>
                        <button
                          onClick={handleComprar}
                          disabled={cotasQuantidade < MIN_COTAS}
                          className="btn-primary w-full text-lg"
                        >
                          {`Quero participar R$ ${precoFinal.toFixed(2)}`}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <video controls className="w-full rounded-lg shadow-lg">
                    <source src={videoPath} type="video/mp4" />
                    Seu navegador não suporta vídeo.
                  </video>
                </div>
              )}
            </div>
            </div>
          </div>

        </div>
      </div>

      {showCheckoutOverlay && checkoutPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              aria-label="Fechar"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setShowCheckoutOverlay(false);
                setOverlayStep('form');
                setFormError(null);
                setCustomerInfo({ nome: '', cpf: '', telefone: '' });
                setCheckoutPreview(null);
                setReservaError(null);
                setReservaMensagem(null);
              }}
            >
              ✕
            </button>

            {overlayStep === 'form' ? (
              <div>
                <h3 className="text-xl font-semibold text-[var(--button-black)] mb-4">Para finalizar, preencha seus dados</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                    <input
                      type="text"
                      value={customerInfo.nome}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, nome: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                      placeholder="Ex: Maria Souza"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input
                      type="text"
                      value={customerInfo.cpf}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, cpf: e.target.value }))}
                      maxLength={14}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Celular</label>
                    <input
                      type="tel"
                      value={customerInfo.telefone}
                      onChange={(e) => setCustomerInfo((prev) => ({ ...prev, telefone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                      placeholder="(00) 90000-0000"
                    />
                  </div>
                </div>
                {formError && <p className="text-red-600 text-sm mt-3">{formError}</p>}
                <button
                  className="btn-primary w-full mt-5"
                  onClick={() => {
                    if (!customerInfo.nome.trim() || !customerInfo.cpf.trim() || !customerInfo.telefone.trim()) {
                      setFormError('Preencha todos os campos para continuar.');
                      return;
                    }
                    setFormError(null);
                    setOverlayStep('preview');
                  }}
                >
                  Ver prévia do pagamento
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-[var(--button-black)] mb-4">Prévia do pagamento</h3>
                <div className="space-y-2 text-sm text-[var(--button-black)]">
                  <p>
                    <strong>Nome:</strong> {customerInfo.nome}
                  </p>
                  <p>
                    <strong>CPF:</strong> {customerInfo.cpf}
                  </p>
                  <p>
                    <strong>Contato:</strong> {customerInfo.telefone}
                  </p>
                  <p>
                    <strong>Rifa:</strong> {checkoutPreview?.rifaTitulo}
                  </p>
                  <p>
                    <strong>Total:</strong> R$ {checkoutPreview?.total.toFixed(2)}
                  </p>
                  <p>
                    <strong>Quantidade:</strong> {checkoutPreview?.quantidade} cotas
                  </p>
                  {checkoutPreview?.numeros && (
                    <p>
                      <strong>Números confirmados:</strong> {checkoutPreview.numeros.slice(0, 12).join(', ')}
                      {checkoutPreview.numeros.length > 12 && ' ...'}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  Ao confirmar, as cotas são reservadas por 20 minutos no sistema. Finalize o pagamento PIX com nossa equipe nesse prazo para garantir sua participação.
                </p>
                {reservaError && <p className="text-xs text-red-600 mt-2">{reservaError}</p>}
                {reservaMensagem && checkoutPreview?.reservaExpiraEm && (
                  <div className="mt-3 p-3 bg-[#f0f8f2] border border-[var(--primary-green)] rounded text-xs text-[var(--button-black)]">
                    <p className="font-semibold">{reservaMensagem}</p>
                    <p>Pagamento #{checkoutPreview.pagamentoId}</p>
                    <p>Validade até: {new Date(checkoutPreview.reservaExpiraEm).toLocaleString()}</p>
                    {checkoutPreview.numeros && <p>Números reservados: {checkoutPreview.numeros.join(', ')}</p>}
                  </div>
                )}
                <div className="flex gap-2 mt-5">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => {
                      setOverlayStep('form');
                      setReservaError(null);
                      setReservaMensagem(null);
                    }}
                  >
                    Corrigir dados
                  </button>
                  <button
                    className="btn-primary flex-1"
                    onClick={handleConfirmarReserva}
                    disabled={reservaLoading}
                  >
                    {reservaLoading ? 'Reservando...' : 'Confirmar reserva'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
