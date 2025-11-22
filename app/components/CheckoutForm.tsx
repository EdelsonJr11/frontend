"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CheckoutFormProps {
  onSubmit: (telefone: string, cpf: string, quantidade: number) => void;
  loading?: boolean;
  precoCota?: string;
}

export function CheckoutForm({ onSubmit, loading, precoCota = '1' }: CheckoutFormProps) {
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  
  const precoNumerico = parseFloat(precoCota.replace(',', '.')) || 1;
  const valorTotal = (precoNumerico * quantidade).toFixed(2).replace('.', ',');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(telefone, cpf, quantidade);
  }

  function formatTelefone(value: string) {
    const nums = value.replace(/\D/g, '');
    if (nums.length <= 11) setTelefone(nums);
  }

  function formatCpf(value: string) {
    const nums = value.replace(/\D/g, '');
    if (nums.length <= 11) setCpf(nums);
  }

  function clampQuantidade(val: number) {
    if (val < 1) return 1;
    if (val > 1000) return 1000; // limite arbitrário de proteção
    return val;
  }

  const isValid = telefone.length >= 10 && cpf.length === 11 && quantidade > 0;
  const progress = Math.min(100,
    (telefone.length/11)*40 + (cpf.length/11)*40 + (quantidade>0?20:0)
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 p-6 rounded-xl border shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-black">Gerar Checkout PIX</h3>
        <Progress value={isValid ? 100 : progress} />
      </div>

      <div className="space-y-1">
        <label htmlFor="telefone" className="block text-sm font-medium text-black mb-1">
          Telefone (com DDD)
        </label>
        <input
          id="telefone"
          type="tel"
          value={telefone}
          onChange={(e) => formatTelefone(e.target.value)}
          placeholder="11999999999"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
          minLength={10}
          maxLength={11}
        />
        <p className="text-xs text-black mt-1">{telefone.length}/11 dígitos</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="cpf" className="block text-sm font-medium text-black mb-1">
          CPF
        </label>
        <input
          id="cpf"
          type="text"
          value={cpf}
          onChange={(e) => formatCpf(e.target.value)}
          placeholder="12345678901"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
          minLength={11}
          maxLength={11}
        />
        <p className="text-xs text-black mt-1">{cpf.length}/11 dígitos</p>
      </div>

      <div className="space-y-3">
        <div className="text-center py-3 bg-gradient-to-r from-[var(--logo-beige-bg)] to-white rounded-lg border">
          <p className="text-sm text-black font-medium">Quanto mais comprar, maiores são as suas chances de ganhar!</p>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📢</span>
            <h4 className="font-bold text-black">Promoção</h4>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <QuickButton quantidade={10} atual={quantidade} onClick={setQuantidade} popular />
            <QuickButton quantidade={20} atual={quantidade} onClick={setQuantidade} />
            <QuickButton quantidade={50} atual={quantidade} onClick={setQuantidade} />
            <QuickButton quantidade={100} atual={quantidade} onClick={setQuantidade} />
            <QuickButton quantidade={200} atual={quantidade} onClick={setQuantidade} />
            <QuickButton quantidade={300} atual={quantidade} onClick={setQuantidade} />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-lg border p-2">
          <button
            type="button"
            onClick={() => setQuantidade(clampQuantidade(quantidade - 1))}
            className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Diminuir quantidade"
          >
            <span className="text-2xl leading-none text-black">−</span>
          </button>
          <input
            id="quantidade"
            type="number"
            min={1}
            max={1000}
            value={quantidade}
            onChange={(e) => setQuantidade(clampQuantidade(parseInt(e.target.value) || 1))}
            className="flex-1 text-center text-2xl font-bold border-none focus:outline-none text-black"
            required
          />
          <button
            type="button"
            onClick={() => setQuantidade(clampQuantidade(quantidade + 1))}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"
            aria-label="Aumentar quantidade"
          >
            <span className="text-2xl leading-none">+</span>
          </button>
        </div>
        <p className="text-xs text-black">Será feita a atribuição automática de números disponíveis.</p>
      </div>

      <motion.button
        type="submit"
        whileHover={isValid && !loading ? { scale: 1.03 } : undefined}
        whileTap={isValid && !loading ? { scale: 0.95 } : undefined}
        disabled={!isValid || loading}
        className="w-full relative overflow-hidden bg-[var(--logo-green-mid)] text-white px-5 py-4 rounded-lg font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--logo-orange)] flex items-center justify-between"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="text-xl">✓</span>
          {loading ? 'Processando...' : 'Quero participar'}
        </span>
        <span className="relative z-10 text-xl font-bold">R$ {valorTotal}</span>
        {isValid && !loading && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0"
            style={{ background:'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4), transparent 70%)'}}
          />
        )}
      </motion.button>
    </motion.form>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="relative w-28 h-2 rounded-full bg-gray-200 overflow-hidden" aria-label="Progresso preenchimento">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
      />
    </div>
  );
}

function QuickButton({ 
  quantidade, 
  atual, 
  onClick, 
  popular 
}: { 
  quantidade: number; 
  atual: number; 
  onClick: (q: number) => void; 
  popular?: boolean 
}) {
  const isSelected = atual === quantidade;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(quantidade)}
      className={`relative overflow-hidden rounded-lg py-3 px-2 font-bold transition ${
        isSelected 
          ? 'bg-[var(--logo-green-mid)] text-white border-2 border-[var(--logo-green-dark)]' 
          : 'bg-gray-200 text-black border-2 border-transparent hover:border-gray-400'
      }`}
    >
      {popular && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--logo-green-dark)] text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
          Mais popular
        </span>
      )}
      <div className="text-lg">+{quantidade}</div>
      <div className="text-xs uppercase">Selecionar</div>
    </motion.button>
  );
}
