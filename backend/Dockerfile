FROM node:16.13.1-alpine AS development

WORKDIR /app

RUN npm install glob rimraf

RUN npm install --only=dev

COPY . .

EXPOSE 3000

RUN npm run build