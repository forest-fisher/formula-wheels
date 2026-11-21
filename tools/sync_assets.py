#!/usr/bin/env python3
"""Refresh PreTeXt external copies of the canonical reusable library."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
for filename,destination in [('formula-wheels.js','code'),('formula-wheels.css','css')]:
    src=root/'src'/filename
    target=root/'assets'/destination/filename
    shutil.copyfile(src,target)
    print('Synced:',src.relative_to(root),'->',target.relative_to(root))
