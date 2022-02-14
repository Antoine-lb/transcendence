# https://github.com/Saluki/nestjs-template/blob/master/Dockerfile

#	NODE BUILDER

FROM	node:16.13.1-alpine as builder

WORKDIR /app
ENV		NODE_ENV build

COPY	package*.json ./
RUN		npm install -g npm@8.3.0 --silent
RUN 	npm install --silent

COPY	. .
RUN		npm run build
RUN		npm prune --production

#	NODE WORKER

FROM	node:16.13.1-alpine as worker

WORKDIR /home/node
ENV		NODE_ENV production

COPY	--from=builder /app/package*.json ./
COPY	--from=builder /app/node_modules/ ./node_modules/
COPY	--from=builder /app/dist/ ./dist/

#COPY	public/ ./public/

#RUN		chown -R node:node ./public/

EXPOSE 3000

USER	node
CMD		["node", "./dist/main"]
