#!/bin/bash

echo "deploy learning api to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Learning/* pi@192.168.1.101:/home/pi/deployment
    scp -r ../source/Learning pi@192.168.1.101:/home/pi/deployment/

    ssh pi@192.168.1.101

    # cd deployment
    # docker build -t dataapi/locationtracker:v1 .
    # docker run -d -p 8080:8080 --name dataapi_locationtracker dataapi/locationtracker:v1    
    # rm -r *
fi

echo "deploy parse server to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp ParseServer/* pi@192.168.1.101:/home/pi/deployment
    scp -r ../source/ParseServer pi@192.168.1.101:/home/pi/deployment/

    ssh pi@192.168.1.101

    # cd deployment
    # docker build -t backend/parseserver:v1 .
    # docker run -d -p 1337:1337 --name backend_parseserver backend/parseserver:v1
    # rm -r *  
fi

echo "deploy mongo db to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    #scp ParseServer/* pi@192.168.1.101:/home/pi/deployment
    #scp -r ../source/ParseServer pi@192.168.1.101:/home/pi/deployment/

    ssh pi@192.168.1.101

    # cd deployment
    # docker build -t backend/parseserver:v1 .
    # docker run -d -p 1337:1337 -p 3017:3017 --name backend_parseserver backend/parseserver:v1
    # rm -r *  
fi

echo "deploy web app to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Web/* pi@192.168.1.101:/home/pi/deployment
    scp -r ../source/Web pi@192.168.1.101:/home/pi/deployment/

    ssh pi@192.168.1.101

    # cd deployment
    # docker build -t webserver/gateway:v1 .
    # docker run -d -p 80:80 -p 443:443 --name webwerver_gateway --net webserver_gateway_network  webserver/gateway:v1 
    # docker network create -d bridge webserver_gateway_network
    # docker network connect webserver_gateway_network dataapi_locationtracker
    # docker network connect webserver_gateway_network backend_parseserver
    # docker network connect webserver_gateway_network webserver_gateway
    # rm -r *  
fi