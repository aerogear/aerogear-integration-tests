#!/bin/bash

set -e

if [[ -z "${GOPATH}" ]]; then
  echo "GOPATH is not set"
  exit 1
fi

METRICS_DIR="$GOPATH/src/github.com/aerogear/aerogear-app-metrics"

if [ ! -d "$METRICS_DIR" ]; then
  git clone git@github.com:aerogear/aerogear-app-metrics.git "$METRICS_DIR"
fi

cd "$METRICS_DIR"
git log
