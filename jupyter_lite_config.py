"""JupyterLite build configuration.

Automatically discovers the labextensions path from the pip-installed
jupyterlite-pyodide-kernel package, which may not be under sys.prefix
(e.g., when using conda + pip --user installs).
"""
import subprocess, json

# Find where pip installed packages (and their labextensions)
result = subprocess.run(
    ["pip", "show", "jupyterlite-pyodide-kernel"],
    capture_output=True, text=True,
)
for line in result.stdout.splitlines():
    if line.startswith("Location:"):
        # e.g. /home/user/.local/lib/python3.10/site-packages
        # labextensions are at /home/user/.local/share/jupyter/labextensions
        import re
        base = re.sub(r"/lib/.*", "", line.split(": ", 1)[1])
        labext_path = f"{base}/share/jupyter/labextensions"
        c.FederatedExtensionAddon.extra_labextensions_path = [labext_path]
        break
