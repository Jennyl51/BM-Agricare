"""
Compatibility shim.

`main.py` now imports the router from `api.routes.rewards`.
This module remains so older imports (`from rewards import router`) don't break.
"""

from api.routes.rewards import router  # re-export
