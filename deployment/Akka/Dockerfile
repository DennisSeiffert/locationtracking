FROM armv7/armhf-ubuntu:16.04

RUN apt-get update && apt-get -y -q install mono-complete fsharp

COPY nuget.exe /usr/bin/nuget

RUN chmod +x /usr/bin/nuget

RUN mono /usr/bin/nuget install Akka && mono /usr/bin/nuget install Akka.Fsharp