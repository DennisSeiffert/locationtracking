FROM armv7/armhf-ubuntu:14.04

# install required packages
RUN apt-get update && apt-get -y dist-upgrade
RUN apt-get install -y --no-install-suggests mongodb
RUN rm -rf /var/lib/apt/lists/*

VOLUME ["/docker-shares"]
VOLUME ["/var/lib/mongodb"]

# Define working directory.
#WORKDIR /data
COPY mongodb.conf /etc/

# Expose ports.
#   - 27017: process
#   - 28017: http
EXPOSE 28017
EXPOSE 3017

# Define default command.
CMD ["mongod", "--config", "/etc/mongodb.conf"]