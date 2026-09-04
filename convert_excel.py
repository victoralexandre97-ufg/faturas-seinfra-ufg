import pandas as pd
import glob
import json
import unicodedata
import re
import os
from datetime import datetime, timezone

# LEGADO: fluxo principal agora usa dados_faturas.json do servidor.
# Mantido só por compatibilidade histórica.

def normalize_column_name(col):
    col = str(col).strip().upper()
    col = ''.join(c for c in unicodedata.normalize('NFD', col) if unicodedata.category(c) != 'Mn')
    col = col.replace('%', 'PERCENTUAL')
    col = re.sub(r'[^A-Z0-9]+', '_', col)
    return col.strip('_')

def main():
    # Find all .xlsx files in the repository root
    files = glob.glob('*.xlsx')
    if not files:
        print("Nenhum arquivo .xlsx encontrado no repositório.")
        return

    for file_path in files:
        print(f"Lendo o arquivo: {file_path}")
        try:
            df = pd.read_excel(file_path)  # pandas infers appropriate engine
        except Exception as e:
            print(f"Erro ao ler o arquivo {file_path}: {e}")
            continue

        # Discard any unnamed column (e.g., the first blank column "Unnamed: 0")
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

        # Normalize column names
        df.columns = [normalize_column_name(c) for c in df.columns]

        # Replace NaNs with None for valid JSON nulls
        df = df.astype(object).where(pd.notnull(df), None)

        data = df.to_dict(orient='records')

        # Output JSON na raiz do repositório (mesmo local dos .xlsx)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_file = f"{base_name}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Arquivo {output_file} gerado com sucesso!")

    # Record the last modification time of each source xlsx
    update_info = {}
    for file_path in files:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        mtime = os.path.getmtime(file_path)
        update_info[base_name] = {
            "modifiedAt": datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
        }
    with open('update_info.json', 'w', encoding='utf-8') as f:
        json.dump(update_info, f, ensure_ascii=False, indent=2)
    print("update_info.json gerado com sucesso!")

if __name__ == "__main__":
    main()
