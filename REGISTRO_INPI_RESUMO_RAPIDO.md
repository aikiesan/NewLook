# 📝 GUIA RÁPIDO - REGISTRO INPI/INOVA UNICAMP

**CP2B Maps V3 - Plataforma de Análise de Potencial de Biogás**

---

## ✅ RESPOSTAS RÁPIDAS

### Questões 1-4 (Básicas)
```
1. Nome: CP2B Maps V3 - Plataforma de Análise de Potencial de Biogás
2. Data de criação: 12/01/2026
3. Já publicado: Não
4. Estágio: Programa de computador Beta
```

### Questão 5 (Palavras-chave)
```
biogás, energia renovável, análise geoespacial, biomassa, resíduos orgânicos,
mapeamento georreferenciado, análise multicritério, PostGIS, potencial energético,
São Paulo, sustentabilidade, MCDA, proximidade espacial, MapBiomas,
análise econômica input-output, digestão anaeróbica, agricultura, pecuária,
resíduos urbanos, sistema de informação geográfica
```

### Questão 6 (Área CNPq)
```
PRINCIPAL: 3.01.04.05-0 - Fontes Alternativas de Energia

SECUNDÁRIAS:
- 5.01.02.00-3 - Geociências
- 3.08.01.00-3 - Engenharia Sanitária
- 5.07.00.00-5 - Ciência da Computação
- 5.01.01.05-0 - Geografia Física
```

### Questão 7 (Setor CNAE)
```
PRINCIPAL: Seção D - 35.2 - Produção distribuição combustíveis gasosos

CORRELATOS:
- Seção M - 72.1 - Pesquisa desenvolvimento experimental
- Seção J - 62.01-5 - Desenvolvimento programas de computador
- Seção E - 38.2 - Tratamento disposição resíduos
```

### Questão 13 (Linguagens)
```
FRONTEND: TypeScript, JavaScript, JSX/TSX, HTML5, CSS3, JSON
BACKEND: Python, SQL (PostgreSQL/PostGIS), GeoJSON
INFRA: YAML, TOML, Dockerfile, Bash
TESTES: TypeScript (Jest, Playwright), Python (pytest)
```

### Questão 14 (Dependências)
```
SIM - Requer:
- Node.js 18+, Python 3.10+, Navegador moderno
- PostgreSQL 15+, PostGIS 3.4+
- 69 bibliotecas principais (46 frontend + 23 backend)
- Serviços: Supabase, MapBiomas API, Railway, Cloudflare Pages
```

### Questão 15 (Licenças das dependências)
```
MIT License: ~85% (Next.js, React, FastAPI, etc.)
Apache 2.0: ~8% (Supabase, Playwright)
BSD License: ~5% (PostgreSQL, Pandas, NumPy)
ISC: ~1%, LGPL: ~1%

✅ Todas permitem uso comercial
✅ Todas são compatíveis entre si
```

### Questão 16 (Nível de dependência)
```
☑️ Utilização - Funcionalidades das bibliotecas
☑️ Acesso - APIs/serviços externos
☐ Modificação - NÃO modifica código-fonte
☑️ Armazenamento - PostgreSQL/PostGIS
```

### Questão 17 (Derivação)
```
☑️ NÃO - É um programa original, não é fork/derivação
```

### Questão 18 (Campo de aplicação - 5 máx)
```
1. CA10 - Engenharia (PRINCIPAL)
2. CA05 - Ciências Exatas e da Terra
3. CA01 - Agrárias e Biológicas
4. CA09 - Economia/Administração
5. CA16 - Meio Ambiente
```

### Questão 19 (Tipo de programa - 5 máx)
```
1. TC01-Aplc Tcn Ct - Aplicações Técnico-Científicas (PRINCIPAL)
2. FA04-Gerad Gráfc - Geradores de Gráficos
3. GI04-Gerad Relat - Gerador de Relatórios
4. GI01-Gerenc Info - Gerenciador de Informações
5. SM01-Simul & Mod - Simulação e Modelagem
```

### Questão 20 (Hash SHA-256)
```
d11a5674acc33ab8017c5c867e62eb20eeaf4adbb382e48f079eb73855c9cf59

Estatísticas:
- 294 arquivos
- 81.485 linhas de código
- Data: 12/01/2026
```

### Questão 21 (Link Google Drive)
```
[AÇÃO NECESSÁRIA]

1. Criar zip com:
   ✓ /cp2b-workspace/NewLook/frontend
   ✓ /cp2b-workspace/NewLook/backend
   ✓ /cp2b-workspace/NewLook/docs
   ✓ README.md, LICENSE, etc.
   ✗ EXCLUIR: node_modules, .next, venv, __pycache__, .git

2. Upload Google Drive

3. Compartilhar: "Qualquer pessoa com o link"

4. Colar link aqui: _______________________
```

### Questão 22 (Patentes)
```
☑️ NÃO - Não há comunicação de invenção relacionada

Justificativa: Usa algoritmos conhecidos, dados públicos,
frameworks open-source. Valor está na integração sistêmica,
não em invenções patenteáveis.
```

### Questão 29 (Restrições)
```
☑️ SIM - Há restrições

PRINCIPAIS:
1. Dados MapBiomas: CC BY-SA (derivados devem manter licença)
2. Geográficas: Limitado a São Paulo (645 municípios)
3. Técnicas: Requer PostgreSQL+PostGIS, mínimo 2GB RAM
4. LGPD: Dados usuários devem seguir LGPD
5. Funding FAPESP: Deve reconhecer financiamento
6. Rate limits: 10 análises/min, timeout 30s
7. Dados: Atualização anual (defasagem 6-12 meses)
8. Garantia: Software "AS IS", sem garantias
```

---

## 📋 TEXTOS LONGOS (Copiar e Colar)

### Questão 8 (Descrição funcional - 50-200 palavras)

<details>
<summary>Clique para ver texto completo</summary>

```
O CP2B Maps V3 é uma plataforma web profissional desenvolvida para análise
científica do potencial de produção de biogás a partir de resíduos orgânicos
nos 645 municípios do Estado de São Paulo. Desenvolvido em arquitetura
cliente-servidor utilizando Next.js 16 (frontend), FastAPI (backend) e
PostgreSQL com extensão PostGIS (banco de dados geoespacial), o sistema
integra mapas interativos, análise de proximidade espacial, simulação
econômica input-output (modelo Leontief), e base de dados científica com
58+ referências de literatura peer-reviewed.

As funcionalidades principais incluem: visualização cartográfica coroplética
do potencial de biogás por município; análise de raio de coleta (1-100km)
com integração aos dados de uso do solo do MapBiomas; identificação de
infraestrutura próxima (ferrovias, gasodutos, subestações); cálculo de
potencial energético por setor (agrícola, pecuário, urbano); análise
multicritério (MCDA) para seleção de locais ótimos; simulação econômica
regional com estimativa de impactos diretos e indiretos; e consulta a
parâmetros químicos (BMP, sólidos totais/voláteis, relação C/N) de 40+
tipos de resíduos com rastreabilidade científica completa.

O sistema utiliza otimizações de performance como cache LRU com TTL de 5
minutos, compressão gzip, rate limiting, e índices espaciais PostGIS para
consultas geométricas eficientes.
```
</details>

### Questão 9 (Problemas que resolve)

<details>
<summary>Clique para ver texto completo</summary>

```
O CP2B Maps V3 resolve múltiplos desafios na avaliação do potencial de
biogás no Brasil:

1. FRAGMENTAÇÃO DE DADOS: Integra dados dispersos de produção agrícola
(SIDRA/IBGE), rebanhos (IBGE PAM), resíduos urbanos, e uso do solo
(MapBiomas) em uma única plataforma consolidada.

2. FALTA DE ANÁLISE ESPACIAL: Disponibiliza ferramentas de geoprocessamento
avançado (PostGIS) para análise de proximidade, raio de coleta, e
identificação de locais ótimos para plantas de biogás, tradicionalmente
feita manualmente em software GIS desktop (ArcGIS, QGIS).

3. AUSÊNCIA DE PARÂMETROS TÉCNICOS: Consolida parâmetros químicos validados
cientificamente (BMP, TS, VS, C/N) de 40+ tipos de resíduos com
rastreabilidade completa a 58+ artigos científicos peer-reviewed.

4. DIFICULDADE EM ANÁLISE ECONÔMICA: Implementa modelo input-output
(Leontief) para simular impactos econômicos regionais da implantação de
plantas de biogás, incluindo multiplicadores de emprego e renda.

5. TOMADA DE DECISÃO SEM CRITÉRIOS OBJETIVOS: Fornece análise multicritério
(MCDA) com 8 critérios integrados (disponibilidade de biomassa, logística,
infraestrutura, aspectos socioeconômicos) para ranqueamento objetivo dos
645 municípios.

6. INACESSIBILIDADE DE FERRAMENTAS: Democratiza acesso a análises
geoespaciais avançadas via interface web responsiva, eliminando necessidade
de software GIS comercial caro ou conhecimento técnico especializado.

7. DESATUALIZAÇÃO DE DADOS: Integra dados atualizados do IBGE (2018-2024)
e MapBiomas (resolução 10m×10m) com atualização sistemática.
```
</details>

### Questão 10 (Programas similares)

<details>
<summary>Clique para ver texto completo</summary>

```
PROGRAMAS SIMILARES (Escopo Internacional):

1. DBFZ Residue Database (Alemanha)
   - URL: https://datalab.dbfz.de/resdb
   - Desenvolvedor: Deutsches Biomasseforschungszentrum (DBFZ)
   - Funcionalidade: Base de dados de resíduos agrícolas europeus
   - Limitações: Sem análise espacial, foco em Europa Central

2. BiogasWorld Platform (Internacional)
   - Funcionalidade: Diretório global de plantas de biogás
   - Limitações: Sem ferramenta de análise espacial

3. S2Biom (União Europeia)
   - Funcionalidade: Avaliação de biomassa disponível na Europa
   - Limitações: Descontinuado (projeto finalizado em 2017)

FERRAMENTAS GIS GENÉRICAS:

4. ArcGIS Pro (ESRI)
   - Funcionalidade: Software GIS desktop comercial
   - Limitações: Licença cara (US$ 1,500+/ano), requer conhecimento técnico

5. QGIS (Open Source)
   - Funcionalidade: Software GIS desktop gratuito
   - Limitações: Interface complexa, curva de aprendizado acentuada

IMPORTANTE: Não existe ferramenta similar específica para análise de
potencial de biogás no Brasil que combine dados brasileiros (IBGE,
MapBiomas), análise espacial interativa web, base científica com parâmetros
químicos validados, modelo econômico regional brasileiro, e foco no Estado
de São Paulo (645 municípios).
```
</details>

### Questão 28 (Regime de licenças)

<details>
<summary>Clique para ver texto completo</summary>

```
REGIME HÍBRIDO (Dual Licensing):

1. LICENÇA OPEN SOURCE - AGPL-3.0
   Para: Academia, pesquisa, ONGs
   Permite: Uso gratuito, modificação, redistribuição
   Restrições: Uso comercial requer licença separada, modificações públicas

2. LICENÇA COMERCIAL - Proprietária
   A) Professional (R$ 99/mês): SaaS, até 3 usuários
   B) Enterprise (R$ 999/mês): Até 20 usuários, white-labeling, API
   C) On-Premise (R$ 50K + 20%/ano): Instalação própria, código em escrow
   D) White-Label (OEM): Redistribuição permitida, royalties 20-30%

3. LICENÇA GOVERNAMENTAL - Gratuita
   Para: Órgãos públicos (municipal, estadual, federal)
   Requisitos: Citação da fonte (UNICAMP/FAPESP)

PROPRIEDADE INTELECTUAL:
Titular: UNIVERSIDADE ESTADUAL DE CAMPINAS (UNICAMP)
Administrado: INOVA Unicamp
Projeto: FAPESP 2025/08745-2

MODELO OPEN CORE:
- Núcleo open source (AGPL): Funcionalidades básicas
- Proprietário (Comercial): Features avançadas (MCDA, simulação econômica,
  relatórios customizados, integrações corporativas)

RECOMENDAÇÃO: AGPL-3.0 + Licença Comercial Proprietária (modelo dual)
com opção White-Label para parceiros estratégicos.

Justificativa: Maximiza impacto acadêmico/social (open source), gera
receita para sustentabilidade (comercial), protege IP da Unicamp (AGPL
copyleft), flexível para parcerias (white-label).
```
</details>

---

## 🎯 AÇÕES PENDENTES

### ANTES DE ENVIAR:

1. ☐ **Preparar código-fonte para envio**
   ```bash
   cd /home/user/NewLook/cp2b-workspace/NewLook
   zip -r cp2b-maps-v3-source-code.zip \
     frontend/ backend/ docs/ \
     README.md LICENSE \
     -x "*/node_modules/*" "*/.next/*" "*/venv/*" \
     "*/__pycache__/*" "*/.git/*"
   ```

2. ☐ **Upload para Google Drive**
   - Fazer upload do arquivo .zip
   - Compartilhar: "Qualquer pessoa com o link pode visualizar"
   - Copiar link compartilhado

3. ☐ **Confirmar informações com equipe**
   - Lista completa de autores/desenvolvedores
   - Porcentagem de contribuição de cada autor
   - Vínculos institucionais (NIPE-Unicamp)
   - Informações de contato

4. ☐ **Revisar documentação**
   - Verificar se README.md está atualizado
   - Confirmar citação do funding FAPESP
   - Validar URLs de produção

5. ☐ **Preencher formulário online INOVA**
   - Usar este guia rápido para copiar/colar respostas
   - Anexar link do Google Drive na questão 21
   - Revisar antes de enviar final

---

## 📞 CONTATOS ÚTEIS

**INOVA Unicamp:**
- Site: https://www.inova.unicamp.br
- Formulário: https://www.inova.unicamp.br/comunicacao-de-invencao/

**INPI:**
- Site: https://www.gov.br/inpi
- Programas de computador: https://www.gov.br/inpi/pt-br/assuntos/programas-de-computador

---

## ✅ CHECKLIST FINAL

- [ ] Todas as 29 questões respondidas
- [ ] Hash SHA-256 validado
- [ ] Código-fonte compactado (.zip)
- [ ] Upload Google Drive concluído
- [ ] Link Google Drive inserido
- [ ] Autores/titulares confirmados
- [ ] Funding FAPESP mencionado
- [ ] Termos de licença definidos
- [ ] Restrições documentadas
- [ ] Revisão final realizada
- [ ] Formulário enviado

---

**Data de preparação:** 12/01/2026
**Versão:** 1.0
**Status:** ✅ Pronto para envio

**Documento completo:** Ver `REGISTRO_INPI_INOVA_UNICAMP.md`
