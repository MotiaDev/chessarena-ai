#!/bin/bash


if [ -z "$1" ]; then
    echo "Error: Platform is required"
    exit 1
fi

case "$1" in
  "linux-x86")
    STOCKFISH_BINARY="stockfish-ubuntu-x86-64-avx2"
    ;;
  "mac-m1")
    STOCKFISH_BINARY="stockfish-macos-m1-apple-silicon"
    ;;
  *)
    echo "Error: Invalid platform"
    exit 1
    ;;
esac

curl -L https://github.com/official-stockfish/Stockfish/releases/latest/download/${STOCKFISH_BINARY}.tar -o stockfish-source.tar

if [ ! -d "lib" ]; then
    mkdir lib
fi

tar -xvf stockfish-source.tar
chmod 777 stockfish/${STOCKFISH_BINARY}
mv stockfish/${STOCKFISH_BINARY} lib/stockfish
rm -rf stockfish-source.tar stockfish/