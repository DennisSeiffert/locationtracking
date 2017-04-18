#!/bin/bash

sudo docker rm -f dataapi_locationtracker
sudo docker build -t dataapi/locationtracker:v1 .
sudo docker run -d -p 8080:8080 --name dataapi_locationtracker dataapi/locationtracker:v1
sudo docker network connect webserver_gateway_network dataapi_locationtracker
rm -r * 