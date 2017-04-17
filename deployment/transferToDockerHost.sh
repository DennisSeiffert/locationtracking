#!/bin/bash

echo "deploy mongo db to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Mongo/* pi@192.168.1.101:/home/pi/deployment    

    ssh pi@192.168.1.101

    # cd deployment
    # docker build -t backend/mongo:v1 .
    # docker run -d -p 3017:3017 --name backend_mongo  -v /var/lib/mongodb:/var/lib/mongodb backend/mongo:v1 
    # rm -r *  
fi

echo "deploy cassandra db to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Cassandra/* pi@192.168.1.101:/home/pi/deployment    

    ssh pi@192.168.1.101
fi

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

echo "deploy web app to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Web/* pi@192.168.1.101:/home/pi/deployment
    scp  ../source/Web/build/* pi@192.168.1.101:/home/pi/deployment/

    ssh pi@192.168.1.101

    # cd deployment
    # docker build -t webserver/gateway:v1 .
    # docker network create -d bridge webserver_gateway_network
    # docker run -d -p 80:80 -p 443:443 --name webserver_gateway --net webserver_gateway_network  webserver/gateway:v1     
    # docker network connect webserver_gateway_network dataapi_locationtracker
    # docker network connect webserver_gateway_network backend_parseserver
    # docker network connect webserver_gateway_network webserver_gateway
    # docker network connect webserver_gateway_network backend_mongo    
    # rm -r *  
fi

echo "deploy akka to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Akka/* pi@192.168.1.101:/home/pi/deployment
    #scp -r ../source/Web pi@192.168.1.101:/home/pi/deployment/
    ssh pi@192.168.1.101
fi

echo "deploy zookeeper to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Zookeeper/* pi@192.168.1.101:/home/pi/deployment    

    ssh pi@192.168.1.101
fi

echo "deploy kafka to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Kafka/* pi@192.168.1.101:/home/pi/deployment    

    ssh pi@192.168.1.101
fi

# sudo docker start $(sudo docker ps -a -q -f "name=backend_mongo")
# sudo docker start $(sudo docker ps -a -q -f "name=dataapi_locationtracker")
# sudo docker start $(sudo docker ps -a -q -f "name=backend_parseserver")
# sudo docker start $(sudo docker ps -a -q -f "name=webserver_gateway")