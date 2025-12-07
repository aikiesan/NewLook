# Changelog - CP2B Maps V3

Todas mudanças notáveis serão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### 🚀 Planejado
- MCDA configurável
- WCAG 2.1 AA compliance
- Bagacinho IA Assistant
- Sistema completo de referências científicas

---

## [3.0.1] - 2025-12-07

### 🔒 Segurança
- **CRÍTICO**: Atualizado Next.js de 15.0.3 para 15.5.7
- Corrigido CVE-2025-66478 (CVSS 10.0 - RCE em React Server Components)
- 0 vulnerabilidades de segurança detectadas

### 🧹 Limpeza e Organização
- Removido código legado V2 (Streamlit) - ~97MB de arquivos
- Removidas 31 arquivos da raiz do repositório → 8 arquivos essenciais
- Organizados 18 documentos em `docs/` e `docs/archive/`
- Movidos scripts SQL para `backend/migrations/`
- Movidos scripts Python para `backend/scripts/utilities/`
- Removidos diretórios: `config/`, `src/` (código Streamlit antigo)
- Criado script de limpeza de branches: `scripts/cleanup-stale-branches.sh`

### 📚 Documentação
- Atualizado README.md com Next.js 15.5.7 e nota de segurança
- Criado REPOSITORY_ORGANIZATION_REPORT.md com análise completa
- Criado V2_PROJECT_MAP_ARCHIVED.md com instruções de restauração
- Adicionado deployment para Vercel além de Cloudflare Pages

### 🔧 Configuração
- Removida opção deprecated `swcMinify` do next.config.js (agora padrão)
- Atualizado eslint-config-next para 15.5.7

### 📊 Impacto
- Redução de 80% no tamanho do repositório (120MB → 23MB)
- Estrutura mais profissional e organizada
- Repositório 100% focado em V3 (Next.js + FastAPI)

---

## [3.0.0-alpha] - 2025-11-16

### ✨ Adicionado
- Estrutura inicial do projeto
- Configuração de ambiente
- Cópia de dados do project_map
- Documentação base

### 🔧 Configuração
- Setup Cursor + Claude Code
- Git workflow definido
- Scripts de sync e verificação

---

## [2.0.0] - 2025-10-13 (project_map - Referência)

Ver: https://github.com/aikiesan/project_map/blob/main/CHANGELOG.md

**Base para migração V3:**
- 8 módulos funcionais
- Bagacinho IA com RAG
- Sistema WCAG 2.1 Level A
- 20+ referências científicas
- Dados validados FAPESP

---

**Convenções:**
- ✨ Adicionado: Novas features
- 🔧 Configuração: Mudanças de config
- 🐛 Corrigido: Bug fixes
- 📚 Documentação: Docs
- ♻️ Refatoração: Code refactor
- 🚀 Performance: Melhorias