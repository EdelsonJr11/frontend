.PHONY: help install dev build start lint clean test docker-up docker-down

# Variáveis
NODE_VERSION := $(shell node -v 2>/dev/null)
NPM_VERSION := $(shell npm -v 2>/dev/null)

# Cores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
RESET  := \033[0m

help: ## Mostra esta mensagem de ajuda
	@echo "$(GREEN)Comandos disponíveis para o projeto Residencial Pôr do Sol:$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Ambiente:$(RESET)"
	@echo "  Node: $(NODE_VERSION)"
	@echo "  NPM:  $(NPM_VERSION)"

install: ## Instala todas as dependências do projeto
	@echo "$(GREEN)Instalando dependências...$(RESET)"
	npm install
	@echo "$(GREEN)✓ Dependências instaladas com sucesso!$(RESET)"

dev: ## Inicia o servidor de desenvolvimento (localhost:3000)
	@echo "$(GREEN)Iniciando servidor de desenvolvimento...$(RESET)"
	npm run dev

build: ## Gera build de produção
	@echo "$(GREEN)Gerando build de produção...$(RESET)"
	npm run build
	@echo "$(GREEN)✓ Build concluído!$(RESET)"

start: ## Inicia servidor de produção (requer build prévio)
	@echo "$(GREEN)Iniciando servidor de produção...$(RESET)"
	npm run start

lint: ## Executa verificação de linting
	@echo "$(GREEN)Executando linter...$(RESET)"
	npm run lint

format: ## Formata código (se configurado)
	@echo "$(GREEN)Formatando código...$(RESET)"
	@command -v prettier >/dev/null 2>&1 && npx prettier --write . || echo "$(YELLOW)Prettier não instalado$(RESET)"

clean: ## Remove node_modules e arquivos de build
	@echo "$(YELLOW)Limpando projeto...$(RESET)"
	rm -rf node_modules
	rm -rf .next
	rm -rf out
	rm -rf dist
	@echo "$(GREEN)✓ Projeto limpo!$(RESET)"

clean-install: clean install ## Remove tudo e reinstala dependências

check: ## Verifica se o ambiente está configurado corretamente
	@echo "$(GREEN)Verificando ambiente...$(RESET)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)✗ Node.js não instalado$(RESET)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)✗ NPM não instalado$(RESET)"; exit 1; }
	@echo "$(GREEN)✓ Node.js $(NODE_VERSION)$(RESET)"
	@echo "$(GREEN)✓ NPM $(NPM_VERSION)$(RESET)"
	@test -f package.json || { echo "$(RED)✗ package.json não encontrado$(RESET)"; exit 1; }
	@echo "$(GREEN)✓ package.json encontrado$(RESET)"
	@echo "$(GREEN)✓ Ambiente OK!$(RESET)"

update: ## Atualiza dependências do projeto
	@echo "$(GREEN)Atualizando dependências...$(RESET)"
	npm update
	@echo "$(GREEN)✓ Dependências atualizadas!$(RESET)"

outdated: ## Lista dependências desatualizadas
	@echo "$(GREEN)Verificando dependências desatualizadas...$(RESET)"
	npm outdated

docker-up: ## Sobe containers Docker (se houver docker-compose.yml)
	@test -f docker-compose.yml && docker compose up -d || echo "$(YELLOW)docker-compose.yml não encontrado$(RESET)"

docker-down: ## Para containers Docker
	@test -f docker-compose.yml && docker compose down || echo "$(YELLOW)docker-compose.yml não encontrado$(RESET)"

docker-logs: ## Mostra logs dos containers
	@test -f docker-compose.yml && docker compose logs -f || echo "$(YELLOW)docker-compose.yml não encontrado$(RESET)"

analyze: ## Analisa o bundle de produção
	@echo "$(GREEN)Analisando bundle...$(RESET)"
	@command -v npx >/dev/null 2>&1 && ANALYZE=true npm run build || echo "$(YELLOW)Análise não disponível$(RESET)"

test: ## Executa testes (se configurados)
	@echo "$(YELLOW)Testes não configurados ainda$(RESET)"
	@# npm run test

deps-graph: ## Mostra gráfico de dependências
	@echo "$(GREEN)Gerando gráfico de dependências...$(RESET)"
	@command -v npx >/dev/null 2>&1 && npx madge --image deps-graph.png app/ || echo "$(YELLOW)madge não disponível$(RESET)"

setup: check install ## Setup inicial completo do projeto
	@echo "$(GREEN)Setup concluído! Execute 'make dev' para iniciar$(RESET)"

.DEFAULT_GOAL := help
