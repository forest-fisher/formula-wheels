#!/usr/bin/env python3
"""Verify the exact approved historical ZIP and the public 1.0.0 mapping.

Fails closed on corrupt/modified ZIP, license drift, or runtime changes.
Does not claim screen-reader or full-browser validation.
"""
from __future__ import annotations
import hashlib, json, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def require(condition: bool, message: str = 'Integrity verification failed') -> None:
    if not condition:
        raise ValueError(message)

def check() -> None:
    meta = json.loads((ROOT / 'PUBLIC_VERSION.json').read_text(encoding='utf-8'))
    require(meta['publicVersion'] == '1.0.0' and meta['tag'] == 'v1.0.0', 'Unexpected public release mapping')
    require(meta['approvedInternalVersion'] == '22.0', 'Unexpected internal baseline')
    asset = ROOT / 'release-assets' / meta['releaseAsset']
    require(asset.is_file(), f'Missing approved ZIP: {asset}')
    require(digest(asset.read_bytes()) == meta['releaseAssetSHA256'] == meta['originalArchiveSHA256'], 'Historical ZIP changed')
    with zipfile.ZipFile(asset, 'r') as z:
        filenames = z.namelist()
        require(len(filenames) == len(set(filenames)), 'Duplicate ZIP paths')
        require(len(filenames) == 55, 'Unexpected original archive inventory')
        require(all(not Path(name).is_absolute() and '..' not in Path(name).parts for name in filenames), 'Unsafe path')
        archive_manifest = json.loads(z.read('RELEASE_MANIFEST_SHA256.json'))['files']
        require(set(filenames) == set(archive_manifest) | {'RELEASE_MANIFEST_SHA256.json'}, 'Original archive inventory changed')
        for name, expected in archive_manifest.items():
            require(digest(z.read(name)) == expected, f'Original archive digest changed: {name}')
        # Accepted runtime, mirrored assets, exercises, gallery and integration must remain untouched.
        protected_roots = ('src/', 'assets/', 'source/', 'publication/', 'standalone-example/')
        protected_specific = ('project.ptx', 'requirements.txt', 'tools/build_and_patch.py',
                              'tools/patch_pretext.py', 'tools/sync_assets.py',
                              'LICENSE', 'NOTICE.md', 'SOURCE_PROVENANCE.json', 'RELEASE_ACCEPTANCE.md')
        for name in filenames:
            if name.startswith(protected_roots) or name in protected_specific:
                require((ROOT / name).is_file(), f'Missing accepted source: {name}')
                require((ROOT / name).read_bytes() == z.read(name), f'Approved source changed: {name}')
    for path in ('README.md', 'NOTICE.md', 'docs/API.md', 'docs/PUBLIC_RELEASE_NOTES_v1_0_0.md'):
        txt = (ROOT / path).read_text(encoding='utf-8').lower()
        for needle in ('forest fisher', '2026', 'mpl', 'chatgpt', 'vibe coded'):
            require(needle in txt, f'Missing disclosure in {path}: {needle}')
    for name, expected in meta['canonicalRuntimeSHA256'].items():
        require(digest((ROOT / name).read_bytes()) == expected, f'Runtime mismatch: {name}')
    require(digest((ROOT/'src/formula-wheels.js').read_bytes()) == digest((ROOT/'assets/code/formula-wheels.js').read_bytes()), 'JS asset mirror differs')
    require(digest((ROOT/'src/formula-wheels.css').read_bytes()) == digest((ROOT/'assets/css/formula-wheels.css').read_bytes()), 'CSS asset mirror differs')
    print('PASS: v1.0.0 maps to unmodified approved 22.0 ZIP; 54 archive file hashes, accepted runtime, attribution verified')

if __name__ == '__main__':
    try:
        check()
    except (OSError, ValueError, KeyError, AssertionError, zipfile.BadZipFile) as exc:
        print('PUBLIC RELEASE VERIFICATION FAILED:', exc, file=sys.stderr)
        sys.exit(1)
