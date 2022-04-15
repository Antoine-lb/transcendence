FROM node:16.13.1-alpine AS development

WORKDIR /app

RUN npm install glob rimraf

RUN npm install --only=dev

COPY . .

EXPOSE 3000

RUN npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin

RUN npm run build