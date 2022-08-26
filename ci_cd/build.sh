#!/bin/bash

DOCKER_VARIABLES=`vault kv get -format=json $VAULT_PATH_SECRET`

if [[ "$?" -ne "0" ]]
then
  echo "Can't get secret";
  exit 1;
fi

cd src
vault kv get -format=json $VAULT_PATH_SECRET | jq .data.data | jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]" > .env
cd ..
