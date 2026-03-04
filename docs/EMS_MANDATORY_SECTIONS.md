# EMS Mandatory Sections — PILAR-2b Manuscript

*Prepared for submission to Environmental Modelling & Software (Elsevier)*
*Extracted from repository: https://github.com/aikiesan/CP2B_Maps_V3*

---

## TASK 1 — Software and Data Availability

*Name of software:* PILAR-2b (Plataforma Inteligente de Localização e Aproveitamento de Resíduos para Biogás e Bioprodutos). *Developer(s):* Lucas Nakamura Cerejo (lead developer, NIPE/Unicamp); Carol [VERIFY surname]; Rubens Augusto Camargo Lamparelli; Bruna de Souza Moraes; Ana Beatriz Soares Aguiar. *Contact:* lucassnakamura@gmail.com; Núcleo Interdisciplinar de Planejamento Energético (NIPE), Universidade Estadual de Campinas (Unicamp), Campinas, SP, Brazil. *Year first available:* 2025 (initial commit: 16 November 2025; registered with INPI/Inova Unicamp January 2026). *Hardware required:* No local hardware installation required for end users. The platform is deployed on cloud infrastructure: frontend via Cloudflare Pages CDN, backend API via Railway, and spatial database via Supabase (PostgreSQL 15 + PostGIS 3.4). Any device capable of running a modern web browser is sufficient. *Software required:* Standard modern web browser (Google Chrome ≥ 114, Mozilla Firefox ≥ 115, or Apple Safari ≥ 16); no local software installation required. *Program language:* TypeScript / JavaScript (Next.js 15.5.7 + React 18, frontend); Python (FastAPI 0.104.1 + SQLAlchemy 2.0, backend); SQL (PostgreSQL 15 + PostGIS 3.4, spatial database). *Program size:* 429 tracked source files; total repository size approximately 94 MB (including data assets and shapefiles). *Availability:* Open-source; freely accessible via web browser at https://cp2bmaps.pages.dev. Source code is publicly available at the repository listed below. *Cost:* No cost for end users. Self-hosted deployment incurs estimated infrastructure costs of US$ 0–50 per month depending on usage tier (Cloudflare Pages free tier, Railway Starter plan, Supabase free/Pro tier). *Repository:* https://github.com/aikiesan/CP2B_Maps_V3. *License:* MIT License (Copyright © 2025 PILAR-2b Contributors; see LICENSE file in repository root).

---

## TASK 2 — CRediT Author Contributions

Lucas Nakamura Cerejo: Conceptualization, Methodology, Software, Data curation, Formal analysis, Validation, Visualization, Writing – original draft. Carol [VERIFY surname]: Conceptualization, Methodology, Formal analysis, Writing – original draft, Writing – review and editing. Rubens Augusto Camargo Lamparelli: Supervision, Resources, Funding acquisition, Writing – review and editing. Bruna de Souza Moraes: Investigation, Data curation, Writing – review and editing. Ana Beatriz Soares Aguiar: Investigation, Formal analysis, Writing – review and editing.

---

## TASK 3 — Declaration of Competing Interests

The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.

---

## TASK 4 — Acknowledgements

The authors gratefully acknowledge the Núcleo Interdisciplinar de Planejamento Energético (NIPE) at the Universidade Estadual de Campinas (Unicamp) for institutional support and research infrastructure. We thank MapBiomas for providing open land use and land cover data, the Instituto Brasileiro de Geografia e Estatística (IBGE) for municipal statistics and cartographic boundaries, the Sistema Nacional de Informações sobre Saneamento (SNIS) for sanitation data, the Agência Nacional de Energia Elétrica (ANEEL) for energy infrastructure data, and the Companhia Ambiental do Estado de São Paulo (CETESB) for environmental data on waste generation and management in the State of São Paulo. The authors also acknowledge the open-source communities behind Next.js, FastAPI, PostGIS, and React Leaflet, whose tools form the technical foundation of PILAR-2b.

**Funding statement:** This work was supported by the Fundação de Amparo à Pesquisa do Estado de São Paulo (FAPESP) [grant number 2025/08745-2]; and by the Núcleo Interdisciplinar de Planejamento Energético (NIPE), Universidade Estadual de Campinas (Unicamp).

---

## TASK 5 — Reference Audit Notes

**Status:** Full manuscript text (Sections 1–5) was not available in the repository for automated citation scanning. The following observations are based on repository content only.

- The platform's scientific references database contains **58 peer-reviewed references** (as documented in README and frontend source).
- Target for EMS submission: 50–60 total references, with 10–12 citing *Environmental Modelling & Software* (ISSN 1364-8152; DOI prefix `10.1016/j.envsoft`).
- **[VERIFY]** A full citation audit (in-text vs. reference list cross-check, EMS-source DOI scan) requires the manuscript `.docx` or `.tex` source, which is not present in this repository. Please run the audit against the manuscript file directly before submission.

---

*[VERIFY] items require manual confirmation before submission:*
- *Carol's surname* — not found in git history, package metadata, or any repository documentation
- *Full reference list audit* — requires manuscript source file
