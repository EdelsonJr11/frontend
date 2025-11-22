"use client";

import { useState, useEffect } from 'react';
import { criarCheckoutPix, getToken } from '../../lib/api';
import { motion } from 'framer-motion';
import { CheckoutResponse } from '../../lib/types';
import { useRifas, useCotas } from '../hooks/useRifas';
import { RifaList } from './RifaList';
import { CotaGrid } from './CotaGrid';
import { CheckoutDisplay } from './CheckoutDisplay';
import { CheckoutForm } from './CheckoutForm';

export function RifaBuyCotas() {
	const [token, setToken] = useState<string | null>(null);
	const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);

	useEffect(() => {
		setToken(getToken());
	}, []);
	const [checkoutLoading, setCheckoutLoading] = useState(false);
	
	const {
		rifas,
		rifasLoading,
		selectedRifaId,
		error,
		selectRifa,
		setError
	} = useRifas();

	const { cotas, cotasLoading, loadCotas } = useCotas(selectedRifaId);
	
	const rifaSelecionada = rifas.find(r => r.id === selectedRifaId);
	const precoCota = rifaSelecionada?.precoCota || rifaSelecionada?.preco || '1';

async function handleSelectRifa(id: number) {
	selectRifa(id);
	try {
		await loadCotas();
	} catch (e: unknown) {
		setError(e instanceof Error ? e.message : 'Erro ao listar cotas');
	}
}

	async function handleCheckout(telefone: string, cpf: string, quantidade: number) {
		if (selectedRifaId == null) {
			setError('Selecione uma rifa.');
			return;
		}
		if (quantidade <= 0) {
			setError('Informe uma quantidade válida.');
			return;
		}
		try {
			setCheckoutLoading(true);
			setError(null);
			const resposta = await criarCheckoutPix(
				selectedRifaId,
				quantidade,
				telefone,
				cpf,
				token
			);
			setCheckout(resposta);
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Erro ao criar checkout');
		} finally {
			setCheckoutLoading(false);
		}
	}

	return (
			<div className="px-4 py-10 space-y-10 max-w-7xl mx-auto">
				<Hero />

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			)}

			<section aria-label="Lista de Rifas">
				<RifaList
					rifas={rifas}
					selectedRifaId={selectedRifaId}
					onSelectRifa={handleSelectRifa}
					loading={rifasLoading}
				/>
			</section>

			{selectedRifaId != null && (
				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">
							Cotas da Rifa #{selectedRifaId}
						</h2>
						<span className="text-sm text-gray-600">Seleção automática por quantidade.</span>
					</div>

					<CotaGrid
						cotas={cotas}
						loading={cotasLoading}
					/>

					{!checkout ? (
						<CheckoutForm
							onSubmit={handleCheckout}
							loading={checkoutLoading}
							precoCota={precoCota}
						/>
					) : (
						<CheckoutDisplay checkout={checkout} />
					)}
				</section>
			)}
		</div>
	);
}

function Hero() {
	return (
		<motion.section
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="relative overflow-hidden rounded-2xl border bg-hero-residencial px-6 py-12 shadow-lg"
			aria-label="Introdução e chamada para ação"
		>
			<div className="absolute inset-0 opacity-30" style={{background:'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5), transparent 60%)'}} />
			<div className="relative space-y-6 max-w-2xl">
				<motion.h1 layout className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--logo-beige-text)]">
					Reveillon no Residencial Pôr do Sol
				</motion.h1>
				<p className="text-sm sm:text-base leading-relaxed text-[var(--logo-beige-text)]/90">
					Garanta sua chance de celebrar o Ano Novo em um paraíso tranquilo. Escolha a quantidade de cotas e gere seu PIX agora mesmo.
				</p>
				<div className="flex flex-wrap gap-3 pt-2">
					<CTAChip text="Sem cadastro" />
					<CTAChip text="PIX imediato" />
					<CTAChip text="Reveillon exclusivo" />
				</div>
			</div>
		</motion.section>
	);
}

function CTAChip({ text }: { text: string }) {
	return (
		<motion.span
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ type: 'spring', stiffness: 300, damping: 20 }}
			className="text-xs px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/30 font-medium"
		>
			{text}
		</motion.span>
	);
}

