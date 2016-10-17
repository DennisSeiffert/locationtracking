#!/bin/bash

echo "deploy learning api to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Learning/* pi@192.168.1.101:/home/pi/deployment
    scp -r ../source/Learning pi@192.168.1.101:/home/pi/deployment/

    ssh pi@192.168.1.101

    # cd deployment
    # docker build -t dataapi/locationtracker:v1 .
    # docker run -d -p 8080:8080 dataapi/locationtracker:v1
fi

echo "deploy web app to docker host [Y|n]:"
read answer
if [ $answer != "n" ]; then
    scp Web/* pi@192.168.1.101:/home/pi/deployment
    scp -r ../source/Web pi@192.168.1.101:/home/pi/deployment/

    ssh pi@192.168.1.101  
fi