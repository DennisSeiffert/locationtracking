FROM waver/rpi-java8

USER root

ENV KAFKA_HEAP_OPTS -Xmx256M -Xms256M
ENV DEBIAN_FRONTEND noninteractive
ENV SCALA_VERSION 2.11
ENV KAFKA_VERSION 0.10.1.0
ENV KAFKA_HOME /opt/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION"

# Install Kafka and other needed things
RUN apt-get update && \
    apt-get install -y wget supervisor dnsutils && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    wget -q http://apache.mirrors.spacedump.net/kafka/"$KAFKA_VERSION"/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz -O /tmp/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz && \
    tar xfz /tmp/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz -C /opt && \
    rm /tmp/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz && \
    ln -s /opt/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION" /opt/kafka

COPY start-kafka.sh /usr/bin/start-kafka.sh
COPY server.properties /opt/kafka/config/server.properties
# Supervisor config
ADD kafka.conf /etc/supervisor/conf.d/

# copy kafka connect config files
COPY start-connect.sh /usr/bin/start-connect.sh
COPY connect-distributed.properties /opt/kafka/config/connect-distributed.properties
# Supervisor config
ADD kafka-connect.conf /etc/supervisor/conf.d/

# copy kafka connect config files
COPY connect-mongodb-1.0.jar /opt/kafka/libs/connect-mongodb-1.0.jar
COPY mongodb-sink-connector.properties /opt/kafka/config/mongodb-sink-connector.properties



# 9092 is kafka
EXPOSE 9092

# expose REST Connect API
EXPOSE 8083

CMD ["supervisord", "-n"]