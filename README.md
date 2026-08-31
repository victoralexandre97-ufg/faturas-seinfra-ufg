# faturas-seinfra-ufg

Painel de Faturas de Energia da **SEINFRA/UFG** — dashboard HTML em tela cheia, tema escuro, com gráficos (Chart.js), mapa (Leaflet) e rotação automática de slides.

**Site publicado:** `https://victoralexandre97-ufg.github.io/faturas-seinfra-ufg/`

## Estrutura

| Arquivo | Papel |
|---|---|
| `index.html` | Estrutura da página (slides, KPIs, gráficos, footer) |
| `styles.css` | Todo o visual (design system escuro) |
| `app.js` | Relógio, slideshow, dados, gráficos e mapa |
| `convert_excel.py` | Converte `.xlsx` → `.json` + gera `update_info.json` |
| `simulate_js.py` | Simula em Python os cálculos do `app.js` (depuração) |
| `f_2026.json`, `d_Enderecos.json`, `update_info.json` | Dados gerados |
| `.github/workflows/excel_to_json.yml` | CI — converte novas planilhas em JSON |

## Atualizar os dados

1. Atualize as planilhas `*.xlsx` na raiz.
2. Rode `python convert_excel.py` para regenerar os JSON.
3. Faça o commit/push — o GitHub Actions converte e o Pages publica.

## Documentação para editar/melhorar o projeto

- **`prompt-architecture.md`** — leia primeiro: arquitetura, pipeline de dados, padrões e armadilhas para editores/IA.
- **`DESIGN.md`** — especificação completa do design system (tokens, tipografia, layout, regras).
