# CP2B Maps V3 - Estrutura do Projeto

```
NewLook/
├── app.py                    # 🚀 Entry point Streamlit
├── requirements.txt          # 📦 Dependências Python
├── .env.example             # 🔧 Template variáveis ambiente
├── README.md                # 📖 Documentação principal
├── CHANGELOG.md             # 📝 Histórico de versões
│
├── config/                  # ⚙️ Configurações
│   ├── settings.py          # Configurações gerais
│   ├── database.py          # Config banco de dados
│   └── supabase.py          # Config Supabase
│
├── src/                     # 💻 Código fonte
│   ├── auth/                # 🔐 Autenticação
│   │   ├── __init__.py
│   │   ├── supabase_auth.py # Integração Supabase
│   │   ├── session_manager.py # Gestão de sessões
│   │   └── permissions.py   # Sistema de permissões
│   │
│   ├── ui/                  # 🎨 Interface usuário
│   │   ├── pages/           # Páginas principais
│   │   │   ├── __init__.py
│   │   │   ├── home.py      # Landing page
│   │   │   ├── login.py     # Login/Registro
│   │   │   ├── dashboard.py # Dashboard principal
│   │   │   ├── map_analysis.py # Análise geoespacial
│   │   │   ├── data_explorer.py # Explorar dados
│   │   │   ├── advanced_analysis.py # Análises avançadas
│   │   │   ├── proximity.py # Análise proximidade
│   │   │   ├── mcda.py      # Análise MCDA
│   │   │   ├── assistant.py # Bagacinho IA
│   │   │   ├── references.py # Referências científicas
│   │   │   ├── profile.py   # Perfil usuário
│   │   │   └── about.py     # Sobre o projeto
│   │   │
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── __init__.py
│   │   │   ├── navbar.py    # Barra de navegação
│   │   │   ├── sidebar.py   # Barra lateral
│   │   │   ├── cards.py     # Cards de métricas
│   │   │   ├── maps.py      # Componentes de mapa
│   │   │   ├── charts.py    # Gráficos
│   │   │   ├── filters.py   # Filtros
│   │   │   └── modals.py    # Modais/Dialogs
│   │   │
│   │   └── styles/          # Estilos e temas
│   │       ├── __init__.py
│   │       ├── theme.py     # Tema CP2B (verde)
│   │       ├── custom.css   # CSS customizado
│   │       └── wcag.py      # Estilos acessibilidade
│   │
│   ├── data/                # 📊 Camada de dados
│   │   ├── loaders/         # Carregadores
│   │   │   ├── __init__.py
│   │   │   ├── municipal_loader.py # Dados municipais
│   │   │   ├── spatial_loader.py # Dados geoespaciais
│   │   │   └── research_loader.py # Dados FAPESP
│   │   │
│   │   └── processors/      # Processadores
│   │       ├── __init__.py
│   │       ├── biogas_calculator.py # Cálculos biogás
│   │       └── spatial_processor.py # Processar geometrias
│   │
│   ├── core/                # 🧮 Lógica de negócio
│   │   ├── __init__.py
│   │   ├── mcda.py          # Algoritmo MCDA
│   │   ├── proximity_analyzer.py # Análise proximidade
│   │   └── optimization.py  # Otimização (futuro)
│   │
│   ├── ai/                  # 🤖 Inteligência Artificial
│   │   ├── __init__.py
│   │   ├── gemini_client.py # Cliente Gemini API
│   │   ├── rag_system.py    # Sistema RAG
│   │   └── rate_limiter.py  # Controle de uso
│   │
│   └── utils/               # 🛠 Utilitários
│       ├── __init__.py
│       ├── logger.py        # Sistema de logs
│       ├── cache_manager.py # Gestão de cache
│       ├── validators.py    # Validações
│       └── helpers.py       # Funções auxiliares
│
├── data/                    # 💾 Dados da aplicação
│   ├── database/            # Banco SQLite
│   │   └── municipios.db
│   ├── shapefile/           # Shapefiles
│   │   └── municipios_sp.shp
│   ├── rasters/             # Rasters MapBiomas
│   │   └── mapbiomas_sp.tif
│   ├── raw/                 # Dados brutos
│   │   └── Dados_Por_Municipios_SP.xls
│   └── processed/           # Dados processados
│
├── docs/                    # 📚 Documentação
│   ├── ARCHITECTURE.md      # Arquitetura técnica
│   ├── METHODOLOGY.md       # Metodologia científica
│   ├── USER_GUIDE.md        # Guia do usuário
│   ├── WCAG_COMPLIANCE.md   # Acessibilidade
│   └── API.md               # Documentação API (futuro)
│
├── tests/                   # 🧪 Testes
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_calculations.py
│   └── test_ui.py
│
├── scripts/                 # 📜 Scripts utilitários
│   ├── setup_database.py   # Setup inicial DB
│   ├── sync_data.py         # Sync dados project_map
│   └── deploy.sh            # Script de deploy
│
└── logs/                    # 📋 Logs da aplicação
    └── app.log
```

## Descrição dos Módulos

### 🔐 Autenticação (`src/auth/`)
- **supabase_auth.py**: Integração com Supabase para login/logout
- **session_manager.py**: Gestão de estado de sessão no Streamlit
- **permissions.py**: Sistema de permissões por tipo de usuário

### 🎨 Interface (`src/ui/`)
- **pages/**: Páginas principais da aplicação
- **components/**: Componentes reutilizáveis (navbar, cards, mapas)
- **styles/**: Temas e estilos customizados

### 📊 Dados (`src/data/`)
- **loaders/**: Carregamento de dados de diferentes fontes
- **processors/**: Processamento e transformação de dados

### 🧮 Core (`src/core/`)
- **mcda.py**: Implementação do algoritmo MCDA
- **proximity_analyzer.py**: Análises de proximidade
- **optimization.py**: Algoritmos de otimização (futuro)

### 🤖 IA (`src/ai/`)
- **gemini_client.py**: Cliente para Google Gemini API
- **rag_system.py**: Sistema RAG para o Bagacinho
- **rate_limiter.py**: Controle de rate limiting

### 🛠 Utilitários (`src/utils/`)
- **logger.py**: Sistema de logging estruturado
- **cache_manager.py**: Gestão de cache do Streamlit
- **validators.py**: Validações de entrada
- **helpers.py**: Funções auxiliares gerais