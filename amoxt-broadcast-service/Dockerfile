FROM node:9-slim
RUN mkdir -p /home/amoxt-broadcast-service
WORKDIR /home/amoxt-broadcast-service

COPY amoxt-broadcast-service/package.json package.json
# COPY package.json package.json
RUN npm i

RUN command