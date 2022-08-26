#!/bin/bash

RUN_TIME=`date +"%b%j%H%M%S"`

HELM_VALUE=(
    "SERVICE_NAME"
    "CI_ENVIRONMENT_NAME"
    "CI_REGISTRY_IMAGE"
    "CI_COMMIT_REF_NAME"
    "RUN_TIME"
    )

for HELM_VALUE in ${HELM_VALUE[@]}; do
    TMP=$HELM_VALUE
    sed -i "s|$HELM_VALUE|${!TMP}|g" server_config/${CI_ENVIRONMENT_NAME}.values.yaml
done


# Check if release exist in helm
helm status $HELM_RELEASE > /dev/null 2>&1

if [ $? != 0 ]; then
   # Install if release not exists
   echo -e "Create release $HELM_RELEASE in namespace $1 with values from ${CI_ENVIRONMENT_NAME}.values.yaml \n"
   helm install --namespace=$1 -n $HELM_RELEASE $URL_HELM_CHART -f server_config/${CI_ENVIRONMENT_NAME}.values.yaml --wait
else
   # Upgrade Release if exists
   echo -e "Upgrade release $HELM_RELEASE in namespace $1 with values from ${CI_ENVIRONMENT_NAME}.values.yaml \n"
   helm upgrade --namespace=$1 $HELM_RELEASE $URL_HELM_CHART -f server_config/${CI_ENVIRONMENT_NAME}.values.yaml --wait
fi
