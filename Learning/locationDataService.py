#! /usr/bin/env python
import json
from datetime import datetime

import flask
from bson import json_util
from flask import Flask
from flask import request

import mongoDbImport

app = Flask(__name__)

# 2016-10-06T22:11:47.160Z
datetimeFormat = "%Y-%m-%dT%H:%M:%S.%fZ"

def jsonSerializing(obj):
    if isinstance(obj, datetime):
        return {"$date": obj.isoformat() + 'Z'}
    return json_util.default(obj)


@app.route("/trackingpoints", methods=['POST'])
def get_trackingpoints():
     def generate(p):
        yield '['
        index = 0
        for post in p:
            if index > 0:
                yield ","
            yield json.dumps(post, default=jsonSerializing)
            index += 1
        yield ']'

     requestData = request.json
     beginDate = datetime.utcnow() - datetime(1,1,1)
     trackingId = ''
     if 'beginDate' in requestData:
        beginDate = datetime.strptime(requestData['beginDate'], datetimeFormat)
     endDate = datetime.utcnow()
     if 'endDate' in requestData:
        endDate = datetime.strptime(requestData['endDate'], datetimeFormat)
     if 'trackingId' in requestData:
         trackingId = requestData['trackingId']
     posts = mongoDbImport.importDataFromCentralMongoDb(beginDate, endDate, trackingId)
     return flask.Response(generate(posts), mimetype="application/json")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)