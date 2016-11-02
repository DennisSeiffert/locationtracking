FROM armv7/armhf-ubuntu:14.04

#RUN apt-get install -y nodejs
RUN apt-get update && apt-get install -y wget dialog
#RUN apt-get install -y gcc-4.8 g++-4.8
#RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.6 20
#RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 50
#RUN update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.6 20
#RUN update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 50

# install nodejs
#RUN wget http://node-arm.herokuapp.com/node_latest_armhf.deb
#RUN dpkg -i node_latest_armhf.deb
RUN apt-get update && wget https://nodejs.org/dist/v4.5.0/node-v4.5.0-linux-armv7l.tar.gz && tar -xvf node-v4.5.0-linux-armv7l.tar.gz && cd node-v4.5.0-linux-armv7l && sudo cp -R * /usr/local/

#COPY . /src

COPY ParseServer /ParseServer

ENV MONGODB_URI=mongodb://backend_mongo:3017/parse

WORKDIR /ParseServer

RUN npm install

CMD ["npm", "start"]