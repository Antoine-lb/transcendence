FROM node:16.13.1-alpine AS development

WORKDIR /app

RUN npm install glob rimraf

RUN npm install --only=dev

COPY . .

EXPOSE 3000

RUN npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin
RUN npm i --save @nestjs/websockets @nestjs/platform-socket.io
RUN npm i nestjs-typeorm-paginate

RUN npm i cookie-parser
RUN npm i -D @types/cookie-parser

RUN npm run build