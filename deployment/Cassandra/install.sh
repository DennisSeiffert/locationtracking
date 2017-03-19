#!/bin/bash

sudo docker rm -f backend_cassandra
sudo docker build -t backend/cassandra:v1 .
sudo docker run -d -p 7000:7000 -p 7001:7001 -p 7199:7199 -p 9042:9042 -p 9160:9160 --name backend_cassandra backend/cassandra:v1
rm -r * 