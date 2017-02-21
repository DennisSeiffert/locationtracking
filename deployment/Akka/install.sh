#!/bin/bash

sudo docker rmi dataapi_akka
sudo docker build -t dataapi/akka:v1 .
sudo docker run -d -p 2017:2017 --name dataapi_akka dataapi/akka:v1
rm -r * 
