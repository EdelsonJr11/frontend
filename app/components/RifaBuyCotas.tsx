"use client";

import { useEffect, useState } from 'react';
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

export function RifaBuyCotas() {
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || 'http://localhost:4000';
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [cotasQuantidade, setCotasQuantidade] = useState(MIN_COTAS);
  const [precoFinal, setPrecoFinal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aba, setAba] = useState<'principal' | 'espaco'>('principal');

  useEffect(() => {
    fetchRifas();
  }, []);

  const fetchRifas = async () => {
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
  };

  const handleComprar = async () => {
    if (!selectedRifa || cotasQuantidade < MIN_COTAS) {
      alert(`Selecione pelo menos ${MIN_COTAS} cotas`);
      return;
    }

    const rifaSelecionada = selectedRifa;
    const cotaIds: number[] = [];
    for (let i = 0; i < cotasQuantidade; i++) {
      const randomCota = Math.floor(Math.random() * rifaSelecionada.totalCotas) + 1;
      cotaIds.push(randomCota);
    }

    try {
      const response = await fetch(`${API_BASE}/api/rifas/${rifaSelecionada.id}/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rifaId: rifaSelecionada.id,
          cotaIds,
          metodo: 'pix',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        alert(`Erro ao comprar cotas: ${response.status} ${response.statusText} - ${text}`);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        alert(`Resposta inválida do servidor durante a compra: ${text.substring(0, 200)}`);
        return;
      }

      const result = await response.json();
      alert('Compra realizada com sucesso! ID: ' + (result.data?.pagamento?.id || result.data?.id || 'N/A'));
      setCotasQuantidade(MIN_COTAS);
    } catch (error) {
      console.error('Erro ao comprar cotas:', error);
      alert('Erro ao realizar compra. Verifique a conexão com o servidor.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando rifas...</div>;
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
    <div className="min-h-screen bg-[var(--background)] p-2 md:p-4">
      <div className="max-w-md mx-auto">
        <div className="card shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 bg-[var(--button-black)] p-3 rounded-t-lg">
            <img src={logoPath} alt="Logo" className="h-10 w-10 rounded object-cover" />
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
                  <img src={src} alt={`Foto ${idx + 1}`} className="object-cover w-full h-48" />
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
                      <button onClick={handleComprar} disabled={cotasQuantidade === 0} className="btn-primary w-full text-lg">
                        Quero participar R$ {precoFinal.toFixed(2)}
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
  );
}
