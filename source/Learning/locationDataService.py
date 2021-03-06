#! /usr/bin/env python
import json
from datetime import datetime

import flask
from bson import json_util
from flask import Flask
from flask import request

import TrackingPoint
import TrackRepository
import ElevationRepository
import Track

app = Flask(__name__)

# 2016-10-06T22:11:47.160Z
datetimeFormat = "%Y-%m-%dT%H:%M:%S.%fZ"

def jsonSerializing(obj):
    if isinstance(obj, datetime):
        return {"date": obj.isoformat() + 'Z'}
    if isinstance(obj, Track.Track):
        return {"name": obj.name, "trackingpoints" : map(jsonSerializing, obj.trackingpoints)}
    if isinstance(obj, TrackingPoint.TrackingPoint):
        return {"latitude": obj.latitude, "longitude": obj.longitude, "timestamputc" : jsonSerializing(obj.timestamputc)}
    if isinstance(obj, list):
        return map(jsonSerializing, obj)
    return json_util.default(obj)

def update_tracks():
    TrackRepository.updateTracks(datetime.utcnow())
    for track in TrackRepository.getTracks():
        for r in track.ranges:
            tempTrack = Track.Track(track.name, track.filterPoints(r[0], r[1]))
            ElevationRepository.updateElevationPoints(tempTrack)
    return flask.Response(json.dumps([]), mimetype="application/json")

def options_trackIds():
    tracks = TrackRepository.getTracks()
    trackIds = map(lambda t: {"name":t.name,
                              "mintimestamputc" : jsonSerializing(t.mintimestamputc),
                              "maxtimestamputc" : jsonSerializing(t.maxtimestamputc),
                              "ranges" : jsonSerializing(t.ranges)},
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
    tracks = TrackRepository.getTracks()
    elevationPoints = ElevationRepository.getElevationPoints()
    for track in tracks:
        track.assignElevation(elevationPoints)        

    return flask.Response(generate(tracks), mimetype="application/json")


def get_track(trackname, beginDate, endDate):
    track = TrackRepository.getTrack(trackname, beginDate, endDate)
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