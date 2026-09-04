import json

f = json.load(open('dados_faturas.json', encoding='utf-8'))
e = json.load(open('d_Enderecos.json', encoding='utf-8'))

# Simula o que o app.js faz
# 1. Build addressMap
address_map = {}
for addr in e:
    key_new = str(addr.get('NUMERO_UNIDADE_CONSUMIDORA_NOVO', '') or '')
    key_old = str(addr.get('NUMERO_UNIDADE_CONSUMIDORA_ANTIGO', '') or '')
    if key_new and key_new != 'None':
        address_map[key_new] = addr
    elif key_old and key_old != 'None':
        address_map[key_old] = addr

print(f'addressMap.size = {len(address_map)}')

# 2. Enrich faturas with address
matched = 0
for fatura in f:
    key = str(fatura.get('ID_UC', ''))
    if key in address_map:
        fatura['_address'] = address_map[key]
        matched += 1

print(f'Faturas com endereco: {matched} de {len(f)}')

# 3. Simulate KPI calculations
total_faturas = len(f)
total_consumo = sum(
    (r.get('CONSUMO_QUANTIDADE') or 0) +
    (r.get('CONSUMO_P_QUANTIDADE') or 0) +
    (r.get('CONSUMO_FP_QUANTIDADE') or 0) +
    (r.get('CONSUMO_HR_QUANTIDADE') or 0)
    for r in f
)
total_valor = sum(r.get('VALOR_TOTAL') or 0 for r in f)
max_valor = max(r.get('VALOR_TOTAL') or 0 for r in f)

print()
print('=== KPIs SIMULADOS ===')
print(f'Qtd. Faturas: {total_faturas}')
print(f'Consumo Total (kWh): {total_consumo:,.0f}')
print(f'Valor Total (R$): {total_valor:,.2f}')
print(f'Maior Fatura (R$): {max_valor:,.2f}')

# 4. Evolucao mensal
evolution = {}
for r in f:
    mes = r.get('REFERENCIA_MES_ANO')
    if mes:
        evolution[mes] = evolution.get(mes, 0) + (r.get('VALOR_TOTAL') or 0)

print()
print('=== EVOLUCAO MENSAL ===')
for mes, val in sorted(evolution.items()):
    print(f'  {mes}: R$ {val:,.2f}')

# 5. Top 5 UCs
ucs = {}
for r in f:
    uc = str(r.get('ID_UC', ''))
    if uc:
        ucs[uc] = ucs.get(uc, 0) + (r.get('VALOR_TOTAL') or 0)

top5 = sorted(ucs.items(), key=lambda x: -x[1])[:5]
print()
print('=== TOP 5 UCS ===')
for uc, val in top5:
    print(f'  UC {uc}: R$ {val:,.2f}')

# 6. Grupos
grupos = {}
for r in f:
    g = r.get('GRUPO') or 'Outros'
    grupos[g] = grupos.get(g, 0) + (r.get('VALOR_TOTAL') or 0)

print()
print('=== GRUPOS ===')
for g, val in sorted(grupos.items(), key=lambda x: -x[1]):
    print(f'  {g}: R$ {val:,.2f}')

print()
print('SIMULACAO COMPLETA - tudo funcionando!')
