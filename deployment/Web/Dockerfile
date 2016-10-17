FROM armv7/armhf-ubuntu:14.04
RUN apt-get update
RUN apt-get install -y ca-certificates nginx

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

VOLUME ["/var/cache/nginx"]

COPY nginx_reverseproxy /etc/nginx/sites-enabled/

# cannot have relative dirs here
# so dockerfile and deps must be copied to root folder on the docker host
COPY source/Web/ /Web

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]