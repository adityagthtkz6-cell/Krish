import os
import sys

# Robust multi-path resolution for Vercel serverless functions
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, '..'))
backend_dir = os.path.join(root_dir, 'backend')
cwd_backend = os.path.join(os.getcwd(), 'backend')

for p in [backend_dir, cwd_backend, root_dir, os.getcwd()]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

try:
    from main import app
except ImportError:
    from backend.main import app

# Expose ASGI application instance for Vercel
app = app

