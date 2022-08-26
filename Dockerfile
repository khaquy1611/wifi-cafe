FROM node:14.15.1-alpine3.11 AS base
WORKDIR /app
RUN apk update && apk add --virtual build-dependencies build-base gcc wget bash python

FROM base AS build-code
ADD src/package.json /app/
ADD src/yarn.lock /app/
RUN yarn install 
ADD src/ /app
RUN yarn build

FROM base AS build-node-modules
ADD src/package.json /app/
ADD src/yarn.lock /app/
RUN yarn install 


FROM docker.appota.com/kdata-research/alpine-node:14-alpine-minimal
ADD conf/supervisord.conf /etc/supervisord.conf
COPY server_config/ /server
RUN chmod 600 /server/filebeat.yml
COPY --from=build-node-modules /app .
COPY --from=build-code /app /app
COPY src/server/nfo.txt /app/src/server/nfo.txt

COPY ci_cd/start.sh /app/
CMD ["sh","/app/start.sh"]
