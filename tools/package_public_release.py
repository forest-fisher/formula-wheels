#!/usr/bin/env python3
"""Stage the exact verified, committed Formula Wheels public release archive.

The accepted v1.0.0 archive is preserved unchanged. Later archives are built
as separate content-addressed release candidates, then committed and verified.
"""
from pathlib import Path
import argparse
import json
import shutil
import hashlib
from verify_public_release import check, ROOT

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output-dir', default='dist')
    args=parser.parse_args()
    check()
    meta=json.loads((ROOT/'PUBLIC_VERSION.json').read_text(encoding='utf-8'))
    out=Path(args.output_dir).resolve()
    out.mkdir(parents=True, exist_ok=True)
    name=meta['releaseAsset']
    src=ROOT/'release-assets'/name
    dest=out/name
    if src.resolve()!=dest.resolve():
        shutil.copyfile(src,dest)
    sha=hashlib.sha256(dest.read_bytes()).hexdigest()
    if sha!=meta['releaseAssetSHA256']:
        raise ValueError('Staged release ZIP checksum mismatch')
    (out/'SHA256SUMS.txt').write_text(f'{sha}  {name}\n',encoding='utf-8')
    shutil.copyfile(ROOT/'PUBLIC_VERSION.json',out/'PUBLIC_VERSION.json')
    print(f'PASS: staged {dest} (SHA-256 {sha})')

if __name__=='__main__':main()
