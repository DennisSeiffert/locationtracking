#! /usr/bin/env python
import json
from datetime import datetime

import flask
from bson import json_util
from flask import Flask
from flask import request

import TrackingPoint
import mongoDbImport
import Track

app = Flask(__name__)

# 2016-10-06T22:11:47.160Z
datetimeFormat = "%Y-%m-%dT%H:%M:%S.%fZ"

def jsonSerializing(obj):
    if isinstance(obj, datetime):
        return {"$date": obj.isoformat() + 'Z'}
    if isinstance(obj, Track.Track):
        return {"name": obj.name, "trackingpoints" : map(jsonSerializing, obj.trackingpoints)}
    if isinstance(obj, TrackingPoint.TrackingPoint):
        return {"latitude": obj.latitude, "longitude": obj.longitude, "timestamputc" : jsonSerializing(obj.timestamputc)}
    return json_util.default(obj)

@app.route("/trackingpoints", methods=['POST'])
def post_rawData():
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

def update_tracks():
    mongoDbImport.updateTracks(datetime.utcnow())
    return flask.Response(json.dumps([]), mimetype="application/json")

def options_trackIds():
    tracks = mongoDbImport.getTracks()
    trackIds = map(lambda t: {"name":t.name,
                              "mintimestamputc" : jsonSerializing(t.mintimestamputc),
                              "maxtimestamputc" : jsonSerializing(t.maxtimestamputc) },
                   tracks)
    return flask.Response(json.dumps(trackIds, indent=None), mimetype="application/json")

def get_tracks():
    def generate(ts):
        yield '['
        index = 0
        for track in ts:
            if index > 0:
                yield ","
            yield json.dumps(track, default=jsonSerializing)
            index += 1
        yield ']'
    tracks = mongoDbImport.getTracks()
    return flask.Response(generate(tracks), mimetype="application/json")


def get_track(trackname, beginDate, endDate):
    track = mongoDbImport.getTrack(trackname, beginDate, endDate)
    return flask.Response(json.dumps(track, default=jsonSerializing), mimetype="application/json")


@app.route("/tracks/<trackname>", methods=['POST'])
def gettrackbyname(trackname):
    requestData = request.json
    beginDate = datetime.utcnow() - datetime(1, 1, 1)
    if 'beginDate' in requestData:
        beginDate = datetime.strptime(requestData['beginDate'], datetimeFormat)
    endDate = datetime.utcnow()
    if 'endDate' in requestData:
        endDate = datetime.strptime(requestData['endDate'], datetimeFormat)
    return get_track(trackname, beginDate, endDate)

@app.route("/tracks", methods=['GET', 'POST', 'OPTIONS'])
def resolvetracks():
    if request.method == 'POST':
        return update_tracks()

    if request.method == 'OPTIONS':
        return options_trackIds()

    return get_tracks()

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)