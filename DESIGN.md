# DESIGN.md

Documento de referência do design system deste projeto.

Use este arquivo como especificação única para recriar a mesma aparência, a mesma hierarquia visual e as mesmas regras de responsividade do dashboard.

Projeto: **Painel de Faturas de Energia - SEINFRA/UFG**
Tipo: dashboard HTML em tela cheia, com tema escuro e navegação por slides.
Arquivos relacionados:
- `styles.css`: tokens, layout, componentes e responsividade visual
- `app.js`: gráficos, mapa, atualização de hora e lógica de telas

---

## 1. Objetivo do design

O dashboard deve ser:
- Escuro, limpo e institucional
- Visualmente consistente em todos os slides
- Legível em telas grandes e em resoluções menores
- Baseado em tokens de cor e em escalas de tipografia já definidas
- Compatível com gráficos Chart.js e mapa Leaflet

Regras principais:
- Não inventar novas cores se já existir um token equivalente
- Não mudar a linguagem visual para estilo claro
- Não adicionar sombras, bordas ou raios fora do padrão do sistema
- Não quebrar o comportamento de tela cheia nem o comportamento responsivo por classes de `<body>`

---

## 2. Paleta de cores

### Tokens CSS obrigatórios
Use sempre as variáveis definidas em `:root`.

| Token | Valor | Uso |
|---|---:|---|
| `--bg` | `#09090D` | Fundo geral da página |
| `--surface` | `#111118` | Fundo de header, footer, cards e KPIs |
| `--surface2` | `#1A1A24` | Fundo secundário, principalmente o mapa |
| `--surface3` | `#22222F` | Fundo terciário |
| `--border` | `#252535` | Borda padrão |
| `--border2` | `#333348` | Borda secundária e estados inativos |
| `--text` | `#F0F0FA` | Texto principal |
| `--text2` | `#9090B0` | Texto secundário, labels e ticks |
| `--text3` | `#5A5A7A` | Texto terciário, como rodapé |
| `--cyan` | `#00D4FF` | Destaque principal |
| `--ok` | `#00E676` | Sucesso / status ativo |
| `--warn` | `#FFB300` | Aviso |
| `--danger` | `#FF4444` | Erro / alerta |
| `--blue` | `#4B8BFF` | Destaque secundário |
| `--purple` | `#9B59FF` | Destaque terciário |

### Usos permitidos por intenção visual
- `--cyan`: principal destaque visual, linhas, barra do título, estado ativo, detalhes do mapa e dos gráficos
- `--blue`: séries e KPIs secundários
- `--purple`: apoio visual e gradientes
- `--ok`: status positivo e indicador ativo
- `--warn`: alerta intermediário
- `--danger`: alerta crítico

### Cores RGBA já adotadas no sistema
- `rgba(255,255,255,0.7)`: subtexto de KPI
- `rgba(255,255,255,0.05)`: fundo de `icon-box` e halo dos cards
- `rgba(255,255,255,0.05)` e `rgba(255,255,255,0.03)`: linhas de tabela
- `rgba(0,212,255,0.35)`: sombra do logotipo
- `rgba(0,230,118,0.1)` com borda `rgba(0,230,118,0.25)`: badge de status ativo

### Gradiente padrão
A faixa inferior do header usa:

```css
linear-gradient(90deg, #00D4FF 0%, #4B8BFF 50%, #9B59FF 100%)
```

### Classes utilitárias de cor
- `.c-cyan` usa `--cyan`
- `.c-ok` usa `--ok`
- `.c-warn` usa `--warn`
- `.c-danger` usa `--danger`
- `.c-blue` usa `--blue`

Essas classes são usadas principalmente nos cards KPI.

---

## 3. Tipografia

### Fontes
- Fonte principal: `Inter`, para títulos, labels, cards, tabela e interface geral
- Fonte monoespaçada: `JetBrains Mono`, para números, valores monetários e relógio
- Fontes importadas via Google Fonts com os pesos já definidos no projeto

### Hierarquia tipográfica
| Elemento | Fonte | Tamanho | Peso | Cor | Observações |
|---|---|---:|---:|---|---|
| `.logo-name` | Inter | 22px | 800 | `--cyan` | Tracking leve negativo e sombra ciano |
| `.logo-sub` | Inter | 12px | 800 | `--text` | Caixa alta e espaçamento entre letras |
| `.slide-title` | Inter | 16px | 800 | `--text` | Título do slide |
| `.kpi-label` | Inter | 13px | 800 | `--text2` | Caixa alta |
| `.kpi-value` | JetBrains Mono | 32px | 800 | herda do card | Valor principal |
| `.kpi-sub` | Inter | 12px | 500 | rgba(255,255,255,0.7) | Texto de apoio |
| `.card-title` | Inter | 18px | 800 | `#FFFFFF` | Barra ciano lateral obrigatória |
| `.card-subtitle` | Inter | 14px | 500 | `--text2` | Subtítulo do card |
| `.status-badge` | Inter | 11px | 500 | `--ok` | Pill de status |
| `.clock-time` | JetBrains Mono | 26px | 600 | `--text` | Relógio |
| `.clock-date` | Inter | 12px | 800 | `--text` | Data em caixa alta |
| `th` | Inter | 13px | 800 | `--text2` | Caixa alta |
| `td` | Inter | 15px | 400 | `--text` | Texto da tabela |
| `.td-mono` | JetBrains Mono | herda | herda | herda | Colunas numéricas |

### Regras de legibilidade
- Use Inter para leitura geral
- Use JetBrains Mono para números e valores financeiros
- Mantenha contraste alto entre texto e fundo
- Não reduza agressivamente o peso dos títulos e labels principais

---

## 4. Layout geral

### Estrutura da página
A tela é montada como uma coluna única em viewport cheia.

Regras base:
- `body` ocupa `100vw` por `100vh`
- `body` usa `display: flex` e `flex-direction: column`
- `body` tem `overflow: hidden`
- O conteúdo principal ocupa o espaço restante entre header e footer

### Dimensões fixas do layout
- Header: `72px`
- Footer: `52px`
- Área central (`.slides-container`): flexível, com `padding: 16px 24px`
- Slide (`.sg-slide`): posicionado de forma absoluta dentro do container
- Transição entre slides: `opacity 0.6s ease`

### Grid principal
- Linha de KPIs: 4 colunas iguais com `gap: 12px`
- Linha de conteúdo: 2 colunas iguais com `gap: 16px`
- O layout deve continuar proporcional, sem empilhar por padrão em telas grandes

### Raios e espaçamentos
- Cards KPI e content card: `14px`
- `icon-box`: `8px`
- `status-badge`: `12px`
- `#map`: `8px`
- Barra lateral do título: `3px`
- `kpi-card`: `12px 18px`
- `content-card`: `20px 22px`
- Tabela (`th` e `td`): `8px 10px`

### Alturas mínimas
- `.chart-container`: `min-height: 200px`
- Mapa no slide 3: altura visual de referência de `500px`

---

## 5. Componentes

### Header
- Fundo `--surface`
- Borda inferior `1px solid --border`
- Linha de gradiente inferior obrigatória
- Deve conter logo à esquerda e status/relógio à direita

### Footer
- Fundo `--surface`
- Borda superior `1px solid --border`
- Deve conter os dots de navegação à esquerda e o texto institucional à direita

### KPI card (`.kpi-card`)
- Fundo `--surface`
- Borda `1px solid --border`
- Raio `14px`
- Deve conter halo decorativo circular no canto superior direito
- Deve conter `icon-box`, label, valor e texto de apoio
- A cor do cartão é definida por `.c-*`

### Content card (`.content-card`)
- Fundo `--surface`
- Borda `1px solid --border`
- Raio `14px`
- Padding `20px 22px`
- Título via `.card-title`
- Subtítulo via `.card-subtitle`

### Status badge (`.status-badge`)
- Fundo verde translúcido
- Borda verde translúcida
- Texto em `--ok`
- Formato pill com `border-radius: 12px`
- Inclui `pulse-dot`

### Tabela
- `width: 100%`
- `border-collapse: collapse`
- Cabeçalho em caixa alta e com cor secundária
- Linhas com separação sutil
- Valores numéricos usam `.td-mono`

### Dots de navegação de slides
Os dots de navegação ficam no rodapé, dentro de `#slide-dots`, e permitem trocar manualmente entre os slides.

#### Design
- Container: flexbox com `gap: 8px`, posicionado no footer
- Cada dot é um `<div class="pulse-dot">` criado dinamicamente por `app.js`
- Tamanho: definido por `.pulse-dot` com `clamp(7px, 0.9vw, 11px)`
- Formato: círculo com `border-radius: 50%`
- A animação original de pulso da classe base é desativada inline com `animation: none`
- Estado ativo: fundo `--cyan` e `transform: scale(1.3)`
- Estado inativo: fundo `--border2` e escala normal
- Transição visual: `all 0.3s ease`

#### Lógica em `app.js`
1. Um dot é criado para cada `.sg-slide`.
2. O índice do slide é salvo em `data-index`.
3. O primeiro slide inicia ativo, com dot ciano e `scale(1.3)`.
4. Ao clicar em um dot, o slide e o dot atuais são desativados, o slide escolhido é ativado e o mapa Leaflet do slide de destino recebe `invalidateSize()` com delay de 100ms para redesenho correto.
5. O avanço automático troca de slide a cada 15s, usando a regra `(currentSlide + 1) % slides.length`.
6. O estado visual do dot deve sempre acompanhar a variável `currentSlide`, tanto no autoplay quanto no clique.

---

## 6. Gráficos

### Regras globais do Chart.js
O `app.js` define padrões globais para manter consistência:
- `Chart.defaults.color` deve seguir `--text2`
- `Chart.defaults.font.family` deve ser `Inter`
- `Chart.defaults.borderColor` deve seguir `--border`

### Paletas já usadas no dashboard
- Evolução de custos: último ponto em `--cyan`, demais pontos em `--blue`
- Barras: preenchimento em `--blue`
- Distribuição por grupo tarifário: `['#00D4FF', '#4B8BFF', '#9B59FF', '#00E676', '#FFB300']`
- Composição da fatura: `['#00D4FF', '#FF4444', '#FFB300', '#9B59FF']`

### Regras de eixo e legenda
- Ticks do eixo X: branco ou muito claro
- Ticks do eixo Y: tom claro secundário
- Grid: tom escuro compatível com `--border`
- Legendas: branco quando presentes
- Data labels: branco quando usados

### Regras de comportamento
- Todos os gráficos devem ser responsivos
- `maintainAspectRatio` deve ser `false` quando o container controlar a altura
- O gráfico precisa ocupar o espaço do card sem estourar o layout

---

## 7. Mapa (Leaflet)

### Papel do mapa no dashboard
O mapa é um componente central do slide 3 e deve seguir estas regras sem exceção:
- Ser responsivo ao tamanho do container
- Manter aparência escura consistente com o tema do dashboard
- Não quebrar quando o card ou o slide mudar de tamanho
- Recalcular o tamanho corretamente depois de renderização ou redimensionamento

### Regras visuais do mapa
- O container do mapa usa `--surface2` como fundo
- O mapa deve preencher `100%` da largura e altura do seu container
- O mapa tem cantos arredondados de `8px`
- O fundo do tile layer deve continuar escuro

### Regras funcionais de responsividade do mapa
- O mapa deve chamar `invalidateSize()` quando necessário
- Se houver bounds disponíveis, deve usar `fitBounds()` com padding
- Um `ResizeObserver` deve observar o elemento do mapa e disparar o ajuste de tamanho
- O mapa precisa continuar legível dentro do card mesmo após troca de slides

### Rótulos do mapa
- Rótulos devem ficar visíveis sobre o fundo escuro
- A camada de labels deve ser tratada separadamente do tile base, se o projeto usar esse recurso
- O tratamento visual dos rótulos deve aumentar brilho e contraste sem destruir a estética escura

### Recomendações para editar o mapa
- Nunca aplicar fundo claro no container do mapa
- Nunca remover o `ResizeObserver` se ele já existir
- Nunca deixar o mapa com tamanho fixo que impeça adaptação ao card
- Se o mapa estiver em slide oculto, garantir revalidação visual quando ele voltar a ser exibido

### Marcador de Obra (`customIcon`)

Definido em `app.js` como `L.divIcon` (classe `custom-div-icon`), usado nos dois mapas:

| Propriedade | Valor |
|-------------|-------|
| Formato | Círculo (`border-radius: 50%`) |
| Tamanho | `16px × 16px` |
| Cor de fundo | `--cyan` (`#00D4FF`) |
| Borda | `2px solid #fff` |
| Glow | `box-shadow: 0 0 10px var(--cyan)` |
| Âncora | Centro do ponto (`iconAnchor: [8, 8]`) |

O marcador é HTML inline no `divIcon`, permitindo customização livre (cor, tamanho, anel pulsante, rótulo numérico etc.).

---

## 8. Animações

### Animações existentes
- `fadeUp`: entrada com opacidade de `0` para `1` e deslocamento vertical de `16px` para `0`
- `pulse-dot`: pulsação do ponto de status
- Transição de slide: `opacity 0.6s ease`

### Uso
- `fade-up-1` até `fade-up-6` controlam atraso escalonado de entrada
- A animação deve ser sutil, sem competir com os dados

---

## 9. Responsividade

### Estratégia geral
A responsividade não depende de media queries tradicionais no conteúdo principal. Ela usa classes aplicadas ao `<body>` para ajustar escala visual por faixa de largura.

### Modos de tela
A função `updateScreenSizeMode()` em `app.js` aplica uma classe ao `<body>` conforme a largura da janela.

| Classe | Largura | `--scale-ui` |
|---|---:|---:|
| `tela-p` | menor que 800px | `0.2` |
| `tela-pm` | 800px a 1279px | `0.4` |
| `tela-m` | 1280px a 1599px | `0.6` |
| `tela-mg` | 1600px a 2400px | `1` |
| `tela-g` | maior que 2400px | `1.2` |

### Regras obrigatórias de responsividade
- O layout deve continuar usando proporções com `fr`
- Os gráficos devem ser responsivos
- O mapa deve redimensionar corretamente com o container
- Tipografia e espaçamentos podem usar `clamp()` quando houver override por faixa de tela
- Não introduzir media queries novas sem necessidade real

### Override de cabeçalho para `tela-mg`
Para a faixa entre `1600px` e `2400px`, o cabeçalho usa ajustes fluidos controlados por `clamp()`.

| Elemento | Classe | Regra |
|---|---|---|
| Nome da marca | `.logo-name` | `clamp(18px, 1.35vw, 22px)` |
| Subtítulo da marca | `.logo-sub` | `clamp(10px, 0.7vw, 12px)` |
| Badge de status | `.status-badge` | `clamp(10px, 0.65vw, 11px)` |
| Relógio | `.clock-time` | `clamp(20px, 1.45vw, 26px)` |

### Comportamento esperado
- Em telas menores, a interface reduz escala visual, mas preserva a estrutura
- Em telas médias e grandes, o layout permanece em duas colunas e quatro KPIs
- O mapa e os gráficos devem continuar ocupando o espaço disponível sem overflow

---

## 10. Regras para qualquer IA que editar este design

1. Preserve os tokens existentes antes de criar qualquer valor novo.
2. Prefira reutilizar classes já existentes em vez de inventar outra nomenclatura.
3. Mantenha o tema escuro e a linguagem visual institucional.
4. Não altere a estrutura geral de header, footer, slides, KPIs e cards sem necessidade clara.
5. Não remova as regras de mapa nem as regras de responsividade por classes no `<body>`.
6. Se algum elemento precisar de ajuste responsivo, primeiro tente resolver com a escala já existente.
7. Se algum gráfico novo for adicionado, siga as mesmas cores e a mesma lógica de eixos/legendas.
8. Se o mapa for refeito, mantenha `invalidateSize()`, `fitBounds()` e `ResizeObserver` como parte do fluxo.

---

## 11. Resumo operacional

Se você precisar recriar este dashboard em outro projeto, siga esta ordem:
1. Aplicar os tokens de cor
2. Aplicar a tipografia Inter + JetBrains Mono
3. Montar o layout full-screen com header, slides e footer
4. Aplicar os cards KPI e content card com os raios e paddings definidos
5. Configurar gráficos com Chart.js usando as cores e defaults documentados
6. Configurar o mapa Leaflet para fundo escuro e redimensionamento correto
7. Aplicar a responsividade por classes no `<body>` e pelos `clamp()` do cabeçalho

Esse é o comportamento visual que deve ser preservado.
