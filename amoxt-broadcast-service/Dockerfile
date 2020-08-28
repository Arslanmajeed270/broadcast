FROM node:9-slim
WORKDIR /amoxt-broadcast-service
COPY package.json   /amoxt-broadcast-service
RUN npm install
COPY . /amoxt-broadcast-service
CMD [ "npm", "start" ]