# Prompt Architecture — Painel de Faturas de Energia (SEINFRA/UFG)

> **Propósito deste documento:** servir de "memória de longo prazo" para qualquer IA (ou humano) que for **editar, corrigir ou melhorar** este dashboard. Leia este arquivo ANTES de tocar no código. Ele descreve a arquitetura atual, os padrões obrigatórios e as armadilhas conhecidas.

**Site publicado (GitHub Pages):** `https://victoralexandre97-ufg.github.io/faturas-seinfra-ufg/`

---

## 1. Visão geral da aplicação

Dashboard **HTML puro + CSS + JavaScript (vanilla)**, tema escuro, tela cheia, exibido em **slides rotativos automáticos (15s cada)**. Não há framework, bundler nem build. O deploy é feito via **GitHub Pages** estático.

- **Entrada de dados:** planilhas `.xlsx`
- **Pipeline:** `xlsx` → `json` (script Python + GitHub Actions) → lido por `app.js`
- **Visualização:** gráficos **Chart.js**, mapa **Leaflet** (dark tiles), tabelas, KPIs

Repositórios "irmãos" seguem o mesmo padrão visual:
- `obras-pac-seinfra-ufg`
- `projetos-seinfra-ufg`

| Arquivo | Papel |
|---|---|
| `index.html` | Estrutura/marcação da página (sem dados) |
| `styles.css` | TODO o visual (tokens, layout, componentes, responsividade) |
| `app.js` | Relógio, slideshow, fetch dos JSON, KPIs, gráficos, mapa |
| `dados_faturas.json` | Dados das faturas (fonte principal do painel) |
| `d_Enderecos.json` | Dados de endereço/geolocalização (gerado por script) |
| `update_info.json` | Timestamp da última modificação dos dados |
| `d_Enderecos.xlsx` | Fonte histórica/legado dos endereços |
| `sync_dados_faturas.py` | Sincroniza `dados_faturas.json` do servidor para o repo |
| `simulate_js.py` | Depuração: simula em Python o que `app.js` calcula |
| `DESIGN.md` | Especificação visual detalhada do design system |
| `.github/workflows/sync_dados_faturas.yml` | CI: valida `dados_faturas.json` em push |

---

## 2. Pipeline de dados (importante — não quebrar)

O fluxo de atualização dos dados funciona assim:

1. **Extrator no servidor** atualiza `\\SERVIDOR\Dir. Manutenção\Estagiários\Victor Lemes\FATURAS UFG\DADOS JSON\dados_faturas.json`.
2. **`sync_dados_faturas.py`** compara o JSON do servidor com o JSON do clone local do repo.
3. Se houver diferença, o script copia, atualiza `update_info.json`, faz `git add/commit/push`.
4. **GitHub Actions** roda a cada `push` que altere `dados_faturas.json` e valida estrutura/conteúdo.

### Como sincronizar localmente
```bash
python sync_dados_faturas.py
```

### Como rodar a simulação de cálculo (depuração)
```bash
python simulate_js.py
```

> ⚠️ **Regra:** `dados_faturas.json` é gerado no servidor e sincronizado para o repo. Não editar à mão. Correção estrutural deve ser feita no extrator do servidor ou no sync script.

### Estrutura do JSON gerado (`dados_faturas.json`)
É uma **lista plana** de objetos (não um dict com chave `f_Faturas`). Chaves ficam em **MAIÚSCULAS** e sem acentos (normalizadas pelo script):

- `ID_UC` — unidade consumidora
- `REFERENCIA_MES_ANO` — ex. `"JAN/2026"`
- `VALOR_TOTAL`, `VALOR_ICMS`, `VALOR_COFINS`, `PIS_VALOR`
- `CONSUMO_QUANTIDADE`, `CONSUMO_P_QUANTIDADE`, `CONSUMO_FP_QUANTIDADE`, `CONSUMO_HR_QUANTIDADE`
- `GRUPO` — grupo tarifário

### Estrutura do mapa de endereços (`d_Enderecos.json`)
- `NUMERO_UNIDADE_CONSUMIDORA_NOVO` / `NUMERO_UNIDADE_CONSUMIDORA_ANTIGO` (chaves de busca)
- `LATITUDE`, `LONGITUDE` (usados no mapa)
- `NOME_LOCAL`, `ENDERECO_REAL`

---

## 3. Arquitetura do frontend

### 3.1 `index.html`
Estrutura em 3 blocos:
- `<header>` (72px): logo **à esquerda**; badge de status e relógio **à direita**
- `.slides-container`: contém os 3 `.sg-slide` (posicionamento absoluto)
  - **Slide 1** — Visão geral: 4 KPIs + evolução de custos (barra) + top 5 UCs (tabela)
  - **Slide 2** — Detalhamento: distribuição por grupo (doughnut) + composição da fatura (barra horizontal)
  - **Slide 3** — Mapa Leaflet + série temporal de valores
- `<footer>` (52px): **flex com `justify-content: space-between`** e 3 filhos:
  1. `#slide-dots` — dots de navegação (**esquerda**)
  2. `.slideshow-controls` — botão play/pause (**centro**, herdado do layout)
  3. texto "DADOS ATUALIZADOS EM `<span id="update-timestamp">`..." (**direita**)

> ⚠️ O botão play/pause **fica no rodapé, no centro**. Não movê-lo de volta para dentro dos slides.

### 3.2 `app.js` (escopo por bloco)

| Bloco | Linhas aprox. | Função |
|---|---|---|
| Defaults Chart.js | 1–9 | cores/fonte globais dos gráficos |
| Helpers | 6–9 | `formatCurrency`, `formatNumber` (pt-BR) |
| Responsividade | 11–21 | `updateScreenSizeMode()` aplica classe `tela-*` no `<body>` |
| Mapa | 23–31, 355–404 | `refreshMap()`, init Leaflet, marcadores |
| Relógio | 33–40 | atualiza `#clock-time` e `#clock-date` a cada 1s |
| Slideshow | 50–118 | rotação a cada 15s, dots, botão play/pause |
| Dados + gráficos | 120–409 | `init()`: fetch, KPIs, charts, mapa |

#### Lógica central: slideshow e botão play/pause
- Variáveis: `currentSlide`, `slideInterval`, `isPaused`
- `activateSlide(i)` — **retorna cedo se `isPaused`** (bloqueia avanço auto e manual quando pausado); ativa slide + atualiza dots; se for slide 3, chama `refreshMap()` com delay
- `startSlideInterval()` / `stopSlideInterval()` — controlam `setInterval` de 15s
- Botão (`.pause-btn`): a cada clique alterna `isPaused`, e as classes CSS `.active` (pausado) e `.playing` (rotação):
  ```js
  isPaused = !isPaused;
  pauseBtn.classList.toggle('active', isPaused);
  pauseBtn.classList.toggle('playing', !isPaused);
  ```
- **Estados visuais do botão:**
  - `playing` (padrão): ícone verde pulsante (`.playing-icon`) + texto "ROTAÇÃO EM ANDAMENTO" em verde (`--ok`)
  - `active` / pausado: ícone de pause + texto "PAUSADO" em vermelho (`--danger`)

#### Lógica de dados (`init()`)
1. Usa `Promise.all` para buscar `dados_faturas.json`, `d_Enderecos.json` e `update_info.json` (o último com `catch(() => null)`, pois é opcional).
2. Monta `addressMap` (mapeia UC → registro de endereço pelas chaves nova/antiga) e **enriquece** cada fatura com `f._address`.
3. Calcula KPIs, agrega evolução por `REFERENCIA_MES_ANO`, top 5 UCs, grupos tarifários, composição de impostos.
4. Cria os gráficos Chart.js e inicializa o mapa Leaflet com marcadores `L.divIcon`.
5. Exibe o timestamp de atualização no rodapé via `displayUpdateTimestamp()` (formato `DD/MMM/AAAA ÀS HH:MM:SS`).

> ⚠️ **Faturamento atual:** `latestMonthFaturas = faturas` (comentário indica que, em cenário real, deveria filtrar pelo mês de referência mais recente).

---

## 4. Design system (resumo — ver `DESIGN.md` para a especificação completa)

### Tokens de cor (obrigatórios — `:root` em `styles.css`)
| Token | Valor | Uso |
|---|---:|---|
| `--bg` | `#09090D` | fundo da página |
| `--surface` | `#111118` | header, footer, cards, KPIs |
| `--surface2` | `#1A1A24` | mapa |
| `--border` / `--border2` | `#252535` / `#333348` | bordas + estado inativo |
| `--text` / `--text2` / `--text3` | `#F0F0FA` / `#9090B0` / `#5A5A7A` | texto |
| `--cyan` | `#00D4FF` | destaque principal |
| `--ok` | `#00E676` | **sucesso / status ativo (verde)** |
| `--warn` | `#FFB300` | aviso |
| `--danger` | `#FF4444` | erro / alerta |
| `--blue` / `--purple` | `#4B8BFF` / `#9B59FF` | destaque secundário/terciário |

> ⚠️ **Não existe `--green`.** Para verde, use **`--ok`**. Não invente cores novas se houver token equivalente.

### Fontes
- **Inter** — interface/títulos/labels/tabela
- **JetBrains Mono** — números, valores financeiros, relógio

### Badge de status "DADOS ATIVOS"
- `.status-badge` — pill verde (fundo/borda/`--ok`)
- `.status-dot` — **círculo verde com animação `pulse-dot` (piscando)**. Uso dedicado **APENAS** no badge do header.
- ⚠️ Não confundir com `.pulse-dot` (dos **dots de navegação do rodapé**), que deve ficar **cinza (estáticos / `animation: none`)**.

### Classes `pulse-dot` vs `status-dot` (armadilha conhecida)
- `.pulse-dot` → usado nos **dots de navegação de slide** (`#slide-dots`), criados por `app.js` com `style.animation = 'none'` e cor inline (ativo `--cyan`, inativo `--border2`). **Não deve pulsar.**
- `.status-dot` → usado **somente** no badge "DADOS ATIVOS" (header). **Deve pulsar em verde.**

> Sempre que mexer em animação de ponto, verifique **qual** classe está alterando para não fazer os dots de navegação piscarem.

---

## 5. Responsividade

- **Não usa media queries tradicionais** no conteúdo principal.
- Usa classes no `<body>` aplicadas por `updateScreenSizeMode()`:
  | Classe | Largura | `--scale-ui` |
  |---|---|---:|
  | `tela-p` | < 800px | 0.2 |
  | `tela-pm` | 800–1279px | 0.4 |
  | `tela-m` | 1280–1599px | 0.6 |
  | `tela-mg` | 1600–2400px | 1 |
  | `tela-g` | > 2400px | 1.2 |
- Tipografia fluida com `clamp()`; layout em proporções `fr`.

---

## 6. Dependências externas (CDN, sem build local)

Tudo vem de CDN no `index.html`;
- **Chart.js** (`chart.js`)
- **chartjs-plugin-datalabels** (usado no gráfico de série temporal, slide 3)
- **Leaflet 1.9.4** (CSS + JS) — mapa com tiles escuros da CARTO
  - `dark_all` (base) + `dark_only_labels` (rótulos em pane separada)

---

## 7. Fluxo de trabalho recomendado para uma IA

Ao receber uma tarefa para este projeto:

1. **Leia `prompt-architecture.md` e `DESIGN.md`** antes de qualquer edição.
2. **Identifique o arquivo certo:**
   - Visual → `styles.css`
   - Estrutura → `index.html`
   - Comportamento/lógica/dados → `app.js`
   - Dados brutos/pipeline → `convert_excel.py`
   - CI → `.github/workflows/excel_to_json.yml`
3. **Siga as convenções:** tokens de cor, fontes existentes, classes existentes. Não invente tokens novos.
4. **Respeite as armadilhas conhecidas:**
   - `update_info.json` / `d_Enderecos.json` / `dados_faturas.json` são **gerados** — não editá-los à mão.
   - Chaves de dados em Maiúsculas (`VALOR_TOTAL`, `ID_UC`, etc.).
   - Botão play/pause fica **no rodapé central**.
   - `.status-dot` (header) deve **pulsar verde**; `.pulse-dot` (dots de slides) **não**.
   - Verde = `--ok` (não existe `--green`).
   - Mapa precisa de `invalidateSize()` / `fitBounds()` / `ResizeObserver` para redimensionar.
   - `activateSlide` ignora avanço quando `isPaused` (não remover esse guarda).
5. **Teste local:** simplesmente abrir `index.html`. Um `python -m http.server` na raiz resolve o `fetch` dos JSON (fetch de arquivo local via `file://` pode ser bloqueado pelo navegador).

---

## 8. Checklist de edição (não quebrar o que já funciona)

- [ ] Tema escuro e tokens preservados
- [ ] `--ok` para verde, nunca `--green`
- [ ] Botão play/pause continua centralizado no footer
- [ ] Dots de navegação continuam estáticos (`pulse-dot`), status badge continua pulsando (`status-dot`)
- [ ] Mapa mantém `invalidateSize()/fitBounds()/ResizeObserver`
- [ ] Não editar os `.json` gerados diretamente
- [ ] Formatação pt-BR de moeda/número via helpers existentes (`formatCurrency`/`formatNumber`)
- [ ] Não quebrar guarda de `isPaused` no `activateSlide`
