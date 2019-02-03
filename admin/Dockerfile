FROM node:alpine as builder
COPY . /app
WORKDIR /app
RUN npm i
RUN npm run build
CMD ["node", "server.js"]