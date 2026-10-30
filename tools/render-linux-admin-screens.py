"""Compatibility entry point for the prompt-aware, code-native SVG renderer."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parents[1]
subprocess.run(['node', '--experimental-strip-types', str(root / 'tools/render-linux-admin-screens.mjs')], cwd=root, check=True)
