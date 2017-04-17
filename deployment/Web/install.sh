#!/bin/bash

sudo docker rm -f webserver_gateway
sudo docker build -t webserver/gateway:v1 .
sudo docker run -d -p 80:80 -p 443:443 --name webserver_gateway --net webserver_gateway_network  webserver/gateway:v1     
sudo docker network connect webserver_gateway_network webserver_gateway
rm -r * 