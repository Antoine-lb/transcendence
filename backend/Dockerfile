FROM node:16.13.1-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install --only=dev

RUN npm install npm-watch

COPY . .

EXPOSE 3000
RUN npm run build