#!/usr/bin/env python3
"""Verify preserved v1.0.0 and current public archive without changing the runtime.

This is content/integrity validation, not an accessibility usability audit.
"""
from __future__ import annotations
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ORIGINAL_SHA='c0c48f8b29836d636629635b9ebec22fe516857d49fda5ca896d12fc05b93e93'
ORIGINAL_ARCHIVE='formula-wheels-v1.0.0.zip'
RUNTIME=('src/formula-wheels.js', 'src/formula-wheels.css',
         'src/iframe-scheduler.js', 'src/child-mathjax-config.js')

def digest(data:bytes)->str:
    return hashlib.sha256(data).hexdigest()

def require(ok:bool, reason:str):
    if not ok:
        raise ValueError(reason)

def validate_zip(path:Path, expected:str):
    require(path.is_file(),f'Missing archive: {path}')
    require(digest(path.read_bytes())==expected, f'Archive hash mismatch: {path}')
    with zipfile.ZipFile(path) as archive:
        names=archive.namelist()
        require(len(names)==len(set(names)), f'Duplicate archive paths: {path}')
        require(all(name and not Path(name).is_absolute() and '..' not in Path(name).parts
                    and '\\' not in name for name in names),f'Unsafe ZIP path: {path}')
        manifest=json.loads(archive.read('RELEASE_MANIFEST_SHA256.json'))['files']
        require(set(names)==set(manifest)|{'RELEASE_MANIFEST_SHA256.json'},'ZIP inventory differs from manifest')
        for name,sha in manifest.items():
            require(re.fullmatch('[0-9a-f]{64}',sha) is not None and digest(archive.read(name))==sha,
                    f'Archive file mismatch: {name}')
        return {name:archive.read(name) for name in manifest}

def check():
    meta=json.loads((ROOT/'PUBLIC_VERSION.json').read_text(encoding='utf-8'))
    require(meta['approvedInternalVersion']=='22.0','Approved internal runtime baseline changed')
    require(meta['originalArchiveSHA256']==ORIGINAL_SHA,'Historical SHA changed')
    original=validate_zip(ROOT/'release-assets'/ORIGINAL_ARCHIVE,ORIGINAL_SHA)
    require(len(original)==54,'Original archive inventory changed')
    require(meta['originalArchiveFileName']=='formula_wheels_v22_0_release.zip', 'Historical source label changed')
    protected_prefixes=('src/','assets/','source/','publication/','standalone-example/')
    protected_specific=('project.ptx','requirements.txt','tools/build_and_patch.py',
                        'tools/patch_pretext.py','tools/sync_assets.py','LICENSE','NOTICE.md',
                        'SOURCE_PROVENANCE.json','RELEASE_ACCEPTANCE.md')
    for name,content in original.items():
        if name.startswith(protected_prefixes) or name in protected_specific:
            require((ROOT/name).is_file() and (ROOT/name).read_bytes()==content,
                    f'Approved original code changed: {name}')
    for name,expected in meta['canonicalRuntimeSHA256'].items():
        require(name in RUNTIME and digest((ROOT/name).read_bytes())==expected,
                f'Canonical runtime mismatch: {name}')
        require(digest(original[name])==expected,f'Approved v1.0.0 runtime changed: {name}')
    require(set(meta['canonicalRuntimeSHA256'])==set(RUNTIME),'Runtime inventory changed')
    require((ROOT/'src/formula-wheels.js').read_bytes()==(ROOT/'assets/code/formula-wheels.js').read_bytes(),
            'JavaScript mirror mismatch')
    require((ROOT/'src/formula-wheels.css').read_bytes()==(ROOT/'assets/css/formula-wheels.css').read_bytes(),
            'CSS mirror mismatch')
    name=meta['releaseAsset']
    require(meta['tag']=='v'+meta['publicVersion'] and name==f'formula-wheels-v{meta["publicVersion"]}.zip',
            'Public version/tag/asset names disagree')
    current=validate_zip(ROOT/'release-assets'/name, meta['releaseAssetSHA256'])
    for name in RUNTIME:
        require(digest(current[name])==meta['canonicalRuntimeSHA256'][name],
                f'Current release runtime changed: {name}')
    if meta['publicVersion']!='1.0.0':
        additions=('tools/authoring/generate-values.cjs','tools/authoring/add-speech.cjs',
                   'tools/authoring/add-output-speech.cjs','tools/authoring/output-speech-core.cjs',
                   'tools/authoring/speech-engine.cjs','tools/authoring/package.json',
                   'docs/formula_wheels_authoring_tools.md')
        for name in additions:
            require(name in current, f'Missing authoring release file: {name}')
        for name,content in current.items():
            if name in original and (name.startswith(protected_prefixes) or name in protected_specific):
                require(content==original[name],f'Approved release content changed: {name}')
            require((ROOT/name).is_file() and (ROOT/name).read_bytes()==content,
                    f'Current release differs from repository source: {name}')
    for file in ('README.md','NOTICE.md','docs/API.md',f'docs/PUBLIC_RELEASE_NOTES_v{meta["publicVersion"].replace(".","_")}.md'):
        contents=(ROOT/file).read_text(encoding='utf-8').lower()
        for marker in ('forest fisher','2026','mpl','chatgpt','vibe coded'):
            require(marker in contents,f'Missing disclosure: {file}: {marker}')
    print(f'PASS: historical v1.0.0 archive retained, public v{meta["publicVersion"]} archive and approved runtime verified')

if __name__=='__main__':
    try: check()
    except (OSError,ValueError,KeyError,AssertionError,zipfile.BadZipFile) as e:
        print('PUBLIC RELEASE VERIFICATION FAILED:',e,file=sys.stderr)
        sys.exit(1)
