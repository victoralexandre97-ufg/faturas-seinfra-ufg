# -*- coding: utf-8 -*-
"""
sync_dados_faturas.py
======================
Sincroniza dados_faturas.json do servidor com repo local.
- usa pasta atual como repo
- compara conteúdo normalizado
- se diferente, copia, atualiza update_info.json e faz commit/push
"""

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

SERVIDOR_JSON = r"\\SERVIDOR\Dir. Manutenção\Estagiários\Victor Lemes\FATURAS UFG\DADOS JSON\dados_faturas.json"
REPO_JSON = "dados_faturas.json"
UPDATE_INFO = "update_info.json"


def normalizar_json_texto(caminho):
    with open(caminho, 'r', encoding='utf-8') as f:
        obj = json.load(f)
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def hash_normalizado(caminho):
    texto = normalizar_json_texto(caminho)
    return hashlib.sha256(texto.encode('utf-8')).hexdigest()


def copiar_arquivo(src, dst):
    shutil.copy2(src, dst)


def atualizar_update_info(repo_dir):
    caminho = repo_dir / UPDATE_INFO
    dados = {}
    if caminho.exists():
        try:
            with open(caminho, 'r', encoding='utf-8') as f:
                dados = json.load(f)
        except Exception:
            dados = {}
    dados['dados_faturas'] = {
        'modifiedAt': datetime.now(timezone.utc).isoformat()
    }
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)


def git(*args, cwd, check=True):
    return subprocess.run(['git', *args], cwd=cwd, check=check, capture_output=True, text=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--repo', default=os.getcwd(), help='Pasta do clone local do repo')
    parser.add_argument('--push', action='store_true', default=True, help='Faz commit/push automático')
    args = parser.parse_args()

    repo_dir = Path(args.repo).resolve()
    src = Path(SERVIDOR_JSON)
    dst = repo_dir / REPO_JSON

    if not src.exists():
        print(f'ERRO: JSON servidor nao encontrado: {src}')
        sys.exit(1)
    if not repo_dir.exists():
        print(f'ERRO: repo nao encontrado: {repo_dir}')
        sys.exit(1)

    src_hash = hash_normalizado(src)
    dst_hash = hash_normalizado(dst) if dst.exists() else None

    if src_hash == dst_hash:
        print('Sem alteracao. Nada a copiar.')
        return

    copiar_arquivo(src, dst)
    atualizar_update_info(repo_dir)

    git('add', REPO_JSON, UPDATE_INFO, cwd=repo_dir)
    status = git('diff', '--cached', '--quiet', cwd=repo_dir, check=False)
    if status.returncode == 0:
        print('Sem diff apos copia.')
        return

    git('commit', '-m', 'Update dados_faturas.json', cwd=repo_dir)
    if args.push:
        git('push', cwd=repo_dir)

    print('Sync concluido.')


if __name__ == '__main__':
    main()
