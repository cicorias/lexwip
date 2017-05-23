#!/usr/bin/env bash

DIR=$(pwd)

./geth  attach ipc:$DIR/data/geth.ipc
