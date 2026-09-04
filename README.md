# faturas-seinfra-ufg

Painel de Faturas de Energia da **SEINFRA/UFG** — dashboard HTML em tela cheia, tema escuro, com gráficos (Chart.js), mapa (Leaflet) e rotação automática de slides.

**Site publicado:** `https://victoralexandre97-ufg.github.io/faturas-seinfra-ufg/`

## Estrutura

| Arquivo | Papel |
|---|---|
| `index.html` | Estrutura da página (slides, KPIs, gráficos, footer) |
| `styles.css` | Todo o visual (design system escuro) |
| `app.js` | Relógio, slideshow, dados, gráficos e mapa |
| `sync_dados_faturas.py` | Sincroniza `dados_faturas.json` do servidor para o repo + commit/push |
| `sync_dados_faturas.bat` | Atalho para rodar sync no clone local |
| `convert_excel.py` | Legado: conversor de planilhas, fora do fluxo principal |
| `simulate_js.py` | Simula em Python os cálculos do `app.js` (depuração) |
| `dados_faturas.json`, `d_Enderecos.json`, `update_info.json` | Dados gerados |
| `.github/workflows/sync_dados_faturas.yml` | CI — valida `dados_faturas.json` em push |

## Atualizar os dados

1. Atualize `dados_faturas.json` no servidor via extrator.
2. Rode `sync_dados_faturas.bat` no clone local do repo.
3. O script compara conteúdo normalizado e, se houver mudança, faz commit/push automático.
4. O GitHub Actions valida o JSON e publica o Pages.

## Documentação para editar/melhorar o projeto

- **`prompt-architecture.md`** — leia primeiro: arquitetura, pipeline de dados, padrões e armadilhas para editores/IA.
- **`DESIGN.md`** — especificação completa do design system (tokens, tipografia, layout, regras).
