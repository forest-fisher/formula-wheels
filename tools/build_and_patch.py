#!/usr/bin/env python3
"""Build normal PreTeXt output, then install the 22.0 runtime hooks."""
import subprocess
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
commands=[([sys.executable,'-m','pretext','build','web'],'PreTeXt build'),
          ([sys.executable,str(root/'tools/patch_pretext.py')],'22.0 post-build integration')]
for args,label in commands:
    print('\n== '+label+' ==',flush=True)
    result=subprocess.run(args,cwd=root,check=False)
    if result.returncode:sys.exit(result.returncode)
