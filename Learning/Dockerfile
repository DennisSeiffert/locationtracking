FROM armv7/armhf-ubuntu:14.04
RUN apt-get update
RUN apt-get install -y python-pip python-dev uwsgi-plugin-python
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /code
WORKDIR /code 
ENTRYPOINT ["python", "locationDataService.py"]