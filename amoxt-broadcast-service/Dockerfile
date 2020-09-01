FROM node:9-slim
RUN mkdir -p /home/amoxt-broadcast-service
WORKDIR /home/amoxt-broadcast-service

COPY package.json package.json
# COPY package-lock.json package-lock.json
RUN npm i

RUN command