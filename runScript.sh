#!/usr/bin/env bash
IPCPATH="/Users/cicoriasmbp13/tmp/ethereum/ex/geth/data/geth.ipc"
RESULT=$(./geth --exec 'loadScript("ethStats.js")' attach ipc:$IPCPATH)
JSON=$(echo $RESULT | cut -d ' ' -f 1)
RV=$(echo $RESULT | cut -d ' ' -f 2)
echo $JSON
echo $RV