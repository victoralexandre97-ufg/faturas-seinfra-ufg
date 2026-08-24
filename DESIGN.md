# DESIGN.md — Especificação de Design (Design Tokens)

> Documento de referência de design system deste projeto. Qualquer IA/ferramenta deve
> usar estes parâmetros para manter consistência visual ao criar ou editar telas,
> componentes, gráficos e estilos.

Projeto: **Painel de Faturas de Energia — SEINFRA/UFG**
Tipo: Dashboard HTML (tela cheia / apresentação de slides) com tema escuro ("dark mode").
Arquivos de estilo: `styles.css` (tokens e classes), `app.js` (config de gráficos Chart.js).

---

## 1. Cores

### Tokens de cores (CSS variables em `:root`)
Definidos em `styles.css:3-24`. Usar sempre as variáveis, não valores hardcoded.

| Token | Valor HEX | Uso |
|-------|-----------|-----|
| `--bg` | `#09090D` | Fundo da página (body) |
| `--surface` | `#111118` | Fundo de header, footer, cards e KPIs |
| `--surface2` | `#1A1A24` | Fundo de superfícies secundárias (ex.: mapa Leaflet) |
| `--surface3` | `#22222F` | Fundo de superfícies terciárias |
| `--border` | `#252535` | Borda padrão de cards/header/footer |
| `--border2` | `#333348` | Borda secundária / estado de dots |
| `--text` | `#F0F0FA` | Texto principal |
| `--text2` | `#9090B0` | Texto secundário / labels |
| `--text3` | `#5A5A7A` | Texto terciário (ex.: rodapé) |
| `--cyan` | `#00D4FF` | Cor de destaque primária |
| `--ok` | `#00E676` | Verde — sucesso / status ativo |
| `--warn` | `#FFB300` | Âmbar — aviso |
| `--danger` | `#FF4444` | Vermelho — perigo / alerta |
| `--blue` | `#4B8BFF` | Azul — destaque secundário |
| `--purple` | `#9B59FF` | Roxo — destaque terciário |

### Cores RGBA pontuais (não tokenizadas)
- `rgba(255,255,255,0.7)` — subtexto de KPI (`.kpi-sub`)
- `rgba(255,255,255,0.05)` — fundo de `.icon-box` e halo dos cards
- `rgba(255,255,255,0.05)` / `rgba(255,255,255,0.03)` — bordas de `th`/`td`
- `rgba(0,212,255,0.35)` — sombra de texto do logo (`text-shadow`)
- `rgba(0,230,118,0.1)` + borda `rgba(0,230,118,0.25)` — fundo/borda do `.status-badge`

### Gradientes
- Barra inferior do header: `linear-gradient(90deg, #00D4FF 0%, #4B8BFF 50%, #9B59FF 100%)`

### Classes utilitárias de cor de texto (em `styles.css:311-331`)
`.c-cyan` (#00D4FF), `.c-ok` (#00E676), `.c-warn` (#FFB300),
`.c-danger` (#FF4444), `.c-blue` (#4B8BFF). Aplicadas principalmente nos cards KPI.

---

## 2. Tipografia

### Fontes
- **Família principal (UI/textos):** `'Inter', sans-serif`
- **Família mono (números/valores/relógio):** `'JetBrains Mono', monospace`
- Import via Google Fonts (pesos Inter: 300–900; JetBrains Mono: 400–700):
  `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap`

### Escala de tamanhos e pesos (classes em `styles.css`)
| Classe / Seletor | Tamanho | Peso | Fonte | Cor | Observações |
|------------------|---------|------|-------|-----|-------------|
| `.logo-name` | 22px | 800 | Inter | `--cyan` | `letter-spacing:-0.5px`, text-shadow ciano |
| `.logo-sub` | 12px | 800 | Inter | `--text` | uppercase, `letter-spacing:0.12em` |
| `.slide-title` | 16px | 800 | Inter | `--text` | `letter-spacing:0.04em` |
| `.kpi-label` | 13px | 800 | Inter | `--text2` | uppercase, `letter-spacing:0.05em` |
| `.kpi-value` | 32px | 800 | JetBrains Mono | herda cor do card | valor numérico principal |
| `.kpi-sub` | 12px | 500 | Inter | `rgba(255,255,255,0.7)` | — |
| `.card-title` | 18px | 800 | Inter | `#FFFFFF` | com barra lateral ciano (`::before`) |
| `.card-subtitle` | 14px | 500 | Inter | `--text2` | — |
| `.status-badge` | 11px | 500 | Inter | `--ok` | pill, `border-radius:12px` |
| `.clock-time` | 26px | 600 | JetBrains Mono | `--text` | — |
| `.clock-date` | 12px | 800 | Inter | `--text` | uppercase, `letter-spacing:0.08em` |
| `th` (tabela) | 13px | 800 | Inter | `--text2` | uppercase |
| `td` (tabela) | 15px | 400 | Inter | `--text` | — |
| `.td-mono` | (herda td) | — | JetBrains Mono | — | colunas numéricas |
| rodapé inline | 11px | italic | — | `--text3` | texto "ATUALIZADO EM TEMPO REAL" |
| `.icon-box` (ícone) | 20px | — | emoji | — | dentro dos KPIs |

---

## 3. Espaçamento, Layout e Dimensões

### Estrutura de tela (full-screen, `100vw x 100vh`)
- `body`: `display:flex; flex-direction:column; overflow:hidden`
- **Header:** altura `72px`, padding `0 24px`, fundo `--surface`, borda inferior `--border`
- **Footer:** altura `52px`, padding `0 24px`, fundo `--surface`, borda superior `--border`
- **`.slides-container`:** `flex:1`, padding `16px 24px`, `position:relative; overflow:hidden`
- **`.sg-slide`:** posicionado absoluto preenchendo o container (top/left/right/bottom com os paddings), `gap:12px`, transição de opacidade `0.6s ease`

### Grids
- **`.kpi-row`:** `grid-template-columns: repeat(4, 1fr)`, `gap:12px`
- **`.content-row`:** `grid-template-columns: 1fr 1fr`, `gap:16px`, `flex:1`

### Raios (border-radius)
- Cards KPI e content: `14px`
- `.icon-box`: `8px`
- `.status-badge`: `12px`
- Mapa (`#map`): `8px`
- Barra lateral do `.card-title`: `3px`
- Dots do rodapé / pulse-dot: `50%` (círculo)

### Paddings internos
- `.kpi-card`: `12px 18px`
- `.content-card`: `20px 22px`
- `th`/`td` (tabela): `8px 10px`

### Alturas mínimas
- `.chart-container`: `min-height:200px`, `flex:1`
- Mapa slide 3 cards: `height:500px` (inline)

---

## 4. Componentes

### KPI Card (`.kpi-card`)
- Fundo `--surface`, borda `1px solid --border`, raio `14px`
- Halo decorativo: círculo `80x80px` `currentColor` a `opacity:0.06` no canto sup. direito
- Conteúdo: `.icon-box` (36x36, raio 8, fundo `rgba(255,255,255,0.05)`, ícone 20px emoji)
  + `.kpi-label` + `.kpi-value` (mono) + `.kpi-sub`
- Cor de destaque definida pela classe `.c-*` (azul/ciano/âmbar/vermelho) aplicada ao card

### Content Card (`.content-card`)
- Fundo `--surface`, borda `1px solid --border`, raio `14px`, padding `20px 22px`
- Título via `.card-title` (barra ciano `4x18px` à esquerda) + `.card-subtitle`

### Status Badge (`.status-badge`)
- Fundo `rgba(0,230,118,0.1)`, borda `1px solid rgba(0,230,118,0.25)`, cor `--ok`
- Pill `border-radius:12px`, fonte 11px/500
- Contém `.pulse-dot` (8x8, `--ok`, animação `pulse-dot` 2s infinite)

### Tabela
- `border-collapse:collapse`, `width:100%`
- Cabeçalho `th`: 13px/800/`--text2`/uppercase, borda inf. `rgba(255,255,255,0.05)`
- Célula `td`: 15px/400/`--text`, borda inf. `rgba(255,255,255,0.03)`
- Colunas numéricas usam `.td-mono`

### Navegação (dots do rodapé)
- Gerados via JS; cor ativa `var(--cyan)`, inativa `var(--border2)`

---

## 5. Gráficos (Chart.js — config em `app.js`)

### Defaults globais (app.js:2-4)
- `Chart.defaults.color = '#9090B0'` (== `--text2`)
- `Chart.defaults.font.family = "'Inter', sans-serif"`
- `Chart.defaults.borderColor = '#252535'` (== `--border`)

### Cores usadas nos gráficos
- **Linha evolução de custos** (`chart-evolucao`): último ponto `#00D4FF` (cyan), demais `#4B8BFF` (blue)
- **Barras** (`chart-grupos`, etc.): preenchimento `#4B8BFF`, ticks `#FFF`, grid `#2A2A35`
- **Pizza/Distribuição grupo tarifário** (`chart-grupos`): paleta
  `['#00D4FF', '#4B8BFF', '#9B59FF', '#00E676', '#FFB300']`
- **Composição da fatura** (`chart-composicao`): paleta
  `['#00D4FF', '#FF4444', '#FFB300', '#9B59FF']`
- **Eixo Y ticks:** `#C0C0D8` (grid `#2A2A35` ou oculto); **Eixo X ticks:** `#FFF`
- **Legendas:** `color:'#FFF'`, posição `right` (pizza)
- **Data labels** (plugin chartjs-plugin-datalabels): `color:'#FFFFFF'`

### Bibliotecas de gráfico
- `chart.js` (CDN jsDelivr)
- `chartjs-plugin-datalabels@2` (CDN jsDelivr)
- `leaflet@1.9.4` (mapa, CDN unpkg) — fundo do container forçado para `--surface2`

---

## 6. Animações

- `fadeUp`: `opacity 0 -> 1`, `translateY(16px) -> 0`, `0.5s ease`
  - Delays escalonados: `.fade-up-1` (0.05s) … `.fade-up-6` (0.30s)
- `pulse-dot`: escala `1 -> 0.8` e opacidade `1 -> 0.6`, `2s infinite`
- Transição de slide: `opacity 0.6s ease`

---

## 7. Diretrizes para IA / manutenção

1. **Nunca** use cores hardcoded onde já exista um token `--*`; referencie a variável.
2. Toda cor de destaque deve vir do conjunto
   `{cyan, blue, purple, ok, warn, danger}` já definido.
3. Textos principais: Inter; números/valores monetários e relógio: JetBrains Mono.
4. Mantenha o tema escuro — fundo nunca claro; contraste mínimo respeitado pelos tokens.
5. Ao adicionar gráficos, reuse `Chart.defaults` e as paletas de pizza documentadas acima.
6. Raios de cantos: cards 14px, pills 12px, ícones 8px.
7. Espaçamentos de grid: KPI `gap:12px` (4 colunas), conteúdo `gap:16px` (2 colunas).
