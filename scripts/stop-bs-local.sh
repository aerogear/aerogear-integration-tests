#!/usr/bin/env bash


if [ -e "./bs-local-pid.txt" ]; then
  kill $(cat bs-local-pid.txt) || true
fi
