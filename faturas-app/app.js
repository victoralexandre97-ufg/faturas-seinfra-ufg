// Configuração Global Chart.js
Chart.defaults.color = '#9090B0';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = '#252535';

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('pt-BR').format(val || 0);

// Clock update
setInterval(() => {
    const now = new Date();
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    const days = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
    const months = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
    document.getElementById('clock-date').textContent = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]}`;
}, 1000);

// Slideshow logic
const slides = document.querySelectorAll('.sg-slide');
let currentSlide = 0;
const slideDotsContainer = document.getElementById('slide-dots');

slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'pulse-dot';
    dot.style.animation = 'none';
    dot.style.backgroundColor = i === 0 ? 'var(--cyan)' : 'var(--border2)';
    dot.style.transition = 'all 0.3s ease';
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
}, 15000); // 15s per slide

// Data Fetching and Chart Rendering
async function init() {
    try {
        const res = await fetch('faturas_data.json');
        const data = await res.json();
        const faturas = data['f_Faturas'];

        if(!faturas || faturas.length === 0) return;

        // Process KPIs
        const latestMonthFaturas = faturas; // In a real scenario, filter by the latest `referencia_mes_ano`
        const totalFaturas = latestMonthFaturas.length;
        const totalConsumo = latestMonthFaturas.reduce((acc, curr) => acc + (curr.CONSUMO_quantidade || 0), 0);
        const totalValor = latestMonthFaturas.reduce((acc, curr) => acc + (curr.valor_total || 0), 0);
        const maxValor = Math.max(...latestMonthFaturas.map(f => f.valor_total || 0));

        document.getElementById('kpi-qtd-faturas').textContent = totalFaturas;
        document.getElementById('kpi-consumo').textContent = formatNumber(totalConsumo);
        document.getElementById('kpi-valor').textContent = formatCurrency(totalValor);
        document.getElementById('kpi-maior-fatura').textContent = formatCurrency(maxValor);

        // Chart 1: Evolução
        // Aggregate by mes_ano
        const evolution = {};
        faturas.forEach(f => {
            const mes = f.referencia_mes_ano;
            if(mes) {
                if(!evolution[mes]) evolution[mes] = 0;
                evolution[mes] += f.valor_total || 0;
            }
        });
        const labelsEvo = Object.keys(evolution).sort().slice(-12);
        const dataEvo = labelsEvo.map(k => evolution[k]);

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

        // Top 5 Unidades
        const unidades = {};
        faturas.forEach(f => {
            const uc = f.id_uc;
            if(uc) {
                if(!unidades[uc]) unidades[uc] = 0;
                unidades[uc] += f.valor_total || 0;
            }
        });
        const top5 = Object.entries(unidades).sort((a,b) => b[1] - a[1]).slice(0, 5);
        const tbody = document.querySelector('#table-top-unidades tbody');
        top5.forEach(([uc, val]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>UC ${uc}</td><td class="td-mono" style="text-align:right">${formatCurrency(val)}</td>`;
            tbody.appendChild(tr);
        });

        // Chart 2: Distribuição por Grupo
        const grupos = {};
        faturas.forEach(f => {
            const g = f.grupo || 'Outros';
            if(!grupos[g]) grupos[g] = 0;
            grupos[g] += f.valor_total || 0;
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
        const totalIcms = latestMonthFaturas.reduce((acc, curr) => acc + (curr.valor_icms || 0), 0);
        const totalCofins = latestMonthFaturas.reduce((acc, curr) => acc + (curr.valor_cofins || 0), 0);
        const totalPis = latestMonthFaturas.reduce((acc, curr) => acc + (curr.pis_valor || 0), 0);
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

    } catch (e) {
        console.error('Error loading faturas:', e);
    }
}

init();
