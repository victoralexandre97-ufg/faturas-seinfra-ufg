// Configuração Global Chart.js
Chart.defaults.color = '#9090B0';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = '#252535';

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(val || 0);
let faturas = [];
const addressMap = new Map();

// Clock update
const fullDayNames = ['DOMINGO','SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA','QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO'];
const fullMonthNames = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
setInterval(() => {
    const now = new Date();
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    document.getElementById('clock-date').textContent = `${fullDayNames[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} DE ${fullMonthNames[now.getMonth()]} DE ${now.getFullYear()}`;
}, 1000);

// Slideshow logic
const slides = document.querySelectorAll('.sg-slide');
let currentSlide = 0;
const slideDotsContainer = document.getElementById('slide-dots');

slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'pulse-dot';
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.backgroundColor = 'var(--cyan)';
    dot.style.borderRadius = '50%';
    dot.style.animation = 'pulse-dot 2s infinite';
    dot.dataset.index = i;
    dot.addEventListener('click', () => {
        // Deactivate current slide
        slides[currentSlide].classList.remove('active');
        slideDotsContainer.children[currentSlide].style.backgroundColor = 'var(--border2)';
        slideDotsContainer.children[currentSlide].style.transform = 'scale(1)';
        // Update currentSlide
        currentSlide = i;
        // Activate selected slide
        slides[currentSlide].classList.add('active');
        slideDotsContainer.children[currentSlide].style.backgroundColor = 'var(--cyan)';
        slideDotsContainer.children[currentSlide].style.transform = 'scale(1.3)';
        if (currentSlide === 2 && window.map) {
            setTimeout(() => {
                window.map.invalidateSize();
                if (window.mapBounds && window.mapBounds.length > 0) window.map.fitBounds(window.mapBounds, { padding: [20, 20] });
            }, 100);
        }
    });
    slideDotsContainer.appendChild(dot);
});

setInterval(() => {
    slides[currentSlide].classList.remove('active');
    slideDotsContainer.children[currentSlide].style.backgroundColor = 'var(--border2)';
    slideDotsContainer.children[currentSlide].style.transform = 'scale(1)';

    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    slideDotsContainer.children[currentSlide].style.backgroundColor = 'var(--cyan)';
    slideDotsContainer.children[currentSlide].style.transform = 'scale(1.3)';

    if (currentSlide === 2 && window.map) {
        setTimeout(() => {
            window.map.invalidateSize();
            if (window.mapBounds && window.mapBounds.length > 0) window.map.fitBounds(window.mapBounds, { padding: [20, 20] });
        }, 100);
    }
}, 15000); // 15s per slide

// Data Fetching and Chart Rendering
async function init() {
    try {
        // Busca as faturas e os dados de endereço
        const [resF, resAddr] = await Promise.all([
            fetch('./f_2026.json'),
            fetch('./d_Enderecos.json')
        ]);
        const dataF = await resF.json();
        console.log('Dados f_2026 carregados:', dataF);
        const addressData = await resAddr.json();
        console.log('Dados d_Enderecos carregados:', addressData);
        // Bug #1 fix: f_2026.json é uma lista plana (não um dict com chave 'f_Faturas')
        faturas = Array.isArray(dataF) ? dataF : (dataF['f_Faturas'] || []);
        // Construir mapa de endereços
        addressMap.clear();
        addressData.forEach(addr => {
            const keyNew = String(addr.NUMERO_UNIDADE_CONSUMIDORA_NOVO || '').replace(/\D/g, '');
            const keyOld = String(addr.NUMERO_UNIDADE_CONSUMIDORA_ANTIGO || '').replace(/\D/g, '');
            if (keyNew) addressMap.set(keyNew, addr);
            if (keyOld && keyOld !== keyNew) addressMap.set(keyOld, addr);
        });
        console.log('Mapa de endereços construído, tamanho:', addressMap.size);
        // Enriquecer faturas com referência ao endereço
        faturas.forEach(f => {
            // Limpar formatação para encontrar a UC no map
            const cleanId = String(f.ID_UC || '').replace(/\D/g, '');
            const addr = addressMap.get(cleanId);
            if (addr) f._address = addr;
        });
// Duplicated addressMap construction removed


        if(!faturas || faturas.length === 0) return;

        // Process KPIs
        const latestMonthFaturas = faturas; // In a real scenario, filter by the latest `referencia_mes_ano`
        const totalFaturas = latestMonthFaturas.length;
        // Total consumption across all four fields (UPPER_CASE keys)
        const totalConsumo = latestMonthFaturas.reduce((acc, curr) =>
            acc + (curr.CONSUMO_QUANTIDADE || 0) +
            (curr.CONSUMO_P_QUANTIDADE || 0) +
            (curr.CONSUMO_FP_QUANTIDADE || 0) +
            (curr.CONSUMO_HR_QUANTIDADE || 0), 0);
        const totalValor = latestMonthFaturas.reduce((acc, curr) => acc + (curr.VALOR_TOTAL || 0), 0);
        const maxValor = Math.max(...latestMonthFaturas.map(f => f.VALOR_TOTAL || 0));

        document.getElementById('kpi-qtd-faturas').textContent = totalFaturas;
        document.getElementById('kpi-consumo').textContent = formatNumber(totalConsumo);
        document.getElementById('kpi-valor').textContent = formatCurrency(totalValor);
        document.getElementById('kpi-maior-fatura').textContent = formatCurrency(maxValor);
        // New cards for slide 3
        document.getElementById('card-valor-faturas').textContent = formatCurrency(totalValor);
        document.getElementById('card-consumo').textContent = formatNumber(totalConsumo);
        document.getElementById('card-ucs').textContent = addressData.length;
        document.getElementById('card-qtd-faturas').textContent = totalFaturas;

        // Chart 1: Evolução
        // Aggregate by mes_ano (UPPER_CASE keys)
        const evolution = {};
        faturas.forEach(f => {
            const mes = f.REFERENCIA_MES_ANO;
            if(mes) {
                if(!evolution[mes]) evolution[mes] = 0;
                evolution[mes] += f.VALOR_TOTAL || 0;
            }
        });
        const monthOrder = { 'JAN':1, 'FEV':2, 'MAR':3, 'ABR':4, 'MAI':5, 'JUN':6, 'JUL':7, 'AGO':8, 'SET':9, 'OUT':10, 'NOV':11, 'DEZ':12 };
        const labelsEvo = Object.keys(evolution).sort((a, b) => {
            if(!a || !b || !a.includes('/') || !b.includes('/')) return 0;
            const [mA, yA] = a.toUpperCase().split('/');
            const [mB, yB] = b.toUpperCase().split('/');
            if (yA !== yB) return parseInt(yA) - parseInt(yB);
            return (monthOrder[mA] || 0) - (monthOrder[mB] || 0);
        }).slice(-12);
        const dataEvo = labelsEvo.map(k => evolution[k]);

        // Evolution chart (already on slide 1)
        new Chart(document.getElementById('chart-evolucao'), {
            type: 'bar',
            data: {
                labels: labelsEvo,
                datasets: [{
                    data: dataEvo,
                    backgroundColor: dataEvo.map((_, i) => i === dataEvo.length - 1 ? '#00D4FF' : '#4B8BFF'),
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#FFF' } },
                    y: { grid: { color: '#2A2A35' }, ticks: { color: '#C0C0D8' } }
                }
            }
        });
        // Time‑series chart for slide 3 (same data, different container)
        new Chart(document.getElementById('chart-faturas-tempo'), {
            type: 'bar',
            data: {
                labels: labelsEvo,
                datasets: [{
                    label: 'Valor (R$)',
                    data: dataEvo,
                    backgroundColor: '#4B8BFF',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#FFF' } },
                    y: { grid: { color: '#2A2A35' }, ticks: { color: '#C0C0D8' } }
                }
            }
        });

        // Top 5 Unidades (UPPER_CASE keys)
        const unidades = {};
        faturas.forEach(f => {
            const uc = f.ID_UC;
            if(uc) {
                if(!unidades[uc]) unidades[uc] = 0;
                unidades[uc] += f.VALOR_TOTAL || 0;
            }
        });
        const top5 = Object.entries(unidades).sort((a,b) => b[1]-a[1]).slice(0, 5);
        const tbody = document.querySelector('#table-top-unidades tbody');
        top5.forEach(([uc, val]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>UC ${uc}</td><td class="td-mono" style="text-align:right">${formatCurrency(val)}</td>`;
            tbody.appendChild(tr);
        });

        // Chart 2: Distribuição por Grupo (UPPER_CASE keys)
        const grupos = {};
        faturas.forEach(f => {
            const g = f.GRUPO || 'Outros';
            if(!grupos[g]) grupos[g] = 0;
            grupos[g] += f.VALOR_TOTAL || 0;
        });
        new Chart(document.getElementById('chart-grupos'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(grupos),
                datasets: [{
                    data: Object.values(grupos),
                    backgroundColor: ['#00D4FF', '#4B8BFF', '#9B59FF', '#00E676', '#FFB300'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#FFF' } } },
                cutout: '70%'
            }
        });

        // Chart 3: Composição (Impostos vs Consumo etc)
        // UPPER_CASE keys for tax fields
        const totalIcms = latestMonthFaturas.reduce((acc, curr) => acc + (curr.VALOR_ICMS || 0), 0);
        const totalCofins = latestMonthFaturas.reduce((acc, curr) => acc + (curr.VALOR_COFINS || 0), 0);
        const totalPis = latestMonthFaturas.reduce((acc, curr) => acc + (curr.PIS_VALOR || 0), 0);
        const baseLiquida = totalValor - (totalIcms + totalCofins + totalPis);

        new Chart(document.getElementById('chart-composicao'), {
            type: 'bar',
            data: {
                labels: ['Consumo Líquido', 'ICMS', 'COFINS', 'PIS'],
                datasets: [{
                    data: [baseLiquida, totalIcms, totalCofins, totalPis],
                    backgroundColor: ['#00D4FF', '#FF4444', '#FFB300', '#9B59FF'],
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: '#2A2A35' }, ticks: { color: '#C0C0D8' } },
                    y: { grid: { display: false }, ticks: { color: '#FFF' } }
                }
            }
        });

        // Initialize Map
        const map = L.map('map', { zoomControl: false }).setView([-16.68, -49.25], 11);
        window.map = map;
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        new ResizeObserver(() => {
            map.invalidateSize();
            if (window.mapBounds && window.mapBounds.length > 0) {
                map.fitBounds(window.mapBounds, { padding: [20, 20] });
            }
        }).observe(document.getElementById('map'));

        const bounds = [];
        faturas.forEach(f => {
            const addr = f._address;
            if (addr && addr.LATITUDE && addr.LONGITUDE) {
                const lat = Number(addr.LATITUDE);
                const lng = Number(addr.LONGITUDE);
                if (!isNaN(lat) && !isNaN(lng)) {
                    const marker = L.marker([lat, lng]).addTo(map);
                    const nomeLocal = addr.NOME_LOCAL || addr.ENDERECO_REAL || 'Unidade Consumidora';
                    const popupContent = `<strong>${nomeLocal}</strong><br>UC: ${f.ID_UC}<br>Valor Atual: ${formatCurrency(f.VALOR_TOTAL)}`;
                    marker.bindPopup(popupContent);
                    bounds.push([lat, lng]);
                }
            }
        });
        window.mapBounds = bounds;
        if (bounds.length > 0) map.fitBounds(bounds, { padding: [20, 20] });

    } catch (e) {
        console.error('Error loading faturas:', e);
    }
}

init();
