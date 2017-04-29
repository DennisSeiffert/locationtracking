#!/bin/bash

sudo docker rm -f dataapi_kafka
sudo docker build -t dataapi/kafka:v1 .
sudo docker run -d -p 9092:9092 --env ADVERTISED_HOST=192.168.1.101 --env ADVERTISED_PORT=9092 --env AUTO_CREATE_TOPICS=true --net=kafka_network --name dataapi_kafka dataapi/kafka:v1
sudo docker network connect kafka_network dataapi_kafka
sudo docker network connect kafka_network backend_mongo
rm -r * 