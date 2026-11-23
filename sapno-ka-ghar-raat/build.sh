#!/bin/sh
# One command: picture → master with the song → film. Needs the Lemo-Opuscar library (LIB) and ffmpeg 7+ on PATH.
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
ffmpeg -v error -y -i "$HERE/song.mp3" -ar 48000 -ac 2 "$HERE/out/mix.wav"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/sapno-ka-ghar-raat.mp4" 24 1
node core/render/still.mjs "$HERE" 61 --size 1080x1920 --out "$HERE/out"
cp "$HERE/out/t_61.jpg" "$HERE/poster.jpg"
