#!/bin/bash

sudo docker rm -f dataapi_zookeeper
sudo docker build -t dataapi/zookeeper:v1 .
sudo docker network create -d bridge kafka_network
sudo docker run -d -p 2181:2181 --net=kafka_network --name dataapi_zookeeper dataapi/zookeeper:v1    
sudo docker network connect kafka_network dataapi_zookeeper
     
rm -r *