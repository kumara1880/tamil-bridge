#!/bin/sh
# Tamil Bridge — start a local server and open the app.
cd "$(dirname "$0")" || exit 1
PORT=5177
if command -v python3 >/dev/null 2>&1;  then SRV="python3 -m http.server $PORT"
elif command -v python >/dev/null 2>&1; then SRV="python -m http.server $PORT"
elif command -v node >/dev/null 2>&1;   then SRV="npx --yes serve -l $PORT ."
else
  echo "No Python or Node found — open index.html in your browser instead."
  exit 1
fi
echo "Tamil Bridge running at http://localhost:$PORT  (Ctrl+C to stop)"
( sleep 1; (xdg-open "http://localhost:$PORT" || open "http://localhost:$PORT") >/dev/null 2>&1 ) &
exec $SRV
