#	NODE BUILDER

FROM	node:16-alpine

WORKDIR /app
# ENV		NODE_ENV build
# ENV		PATH /app/nodes_modules/.bin:$PATH

# RUN		npm install -g npm@8.3.0 --silent

COPY	. .
RUN		npm install --silent

EXPOSE 8080

