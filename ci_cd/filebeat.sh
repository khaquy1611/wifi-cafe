#!/bin/bash

LOGGING_CONFIG=(
    "ELK_INDEX"
    "ELK_REDIS_PASS"
    )

for LOGGING_CONFIG in ${LOGGING_CONFIG[@]}; do
    TMP=$LOGGING_CONFIG
    sed -i "s/$LOGGING_CONFIG/${!TMP}/g" server_config/filebeat.yml
done
