FROM alpine:3.13

RUN apk update

RUN apk add --no-cache --quiet nginx
RUN apk add --no-cache --quiet openssl

RUN		mkdir -p /var/run/nginx

COPY	nginx.conf /etc/nginx/conf.d/default.conf

RUN		ln -sf /dev/stdout /var/log/nginx/access.log && \
		ln -sf /dev/stderr /var/log/nginx/error.log

STOPSIGNAL SIGTERM

CMD [ "nginx", "-g", "daemon off;" ]