# Copyright Google Inc. 2010 All Rights Reserved
import simplejson
import urllib
from pymongo import MongoClient
from bson.code import Code

import TrackingPoint
import ElevationPoint
import TrackRepository
import Track

from geopy.distance import vincenty

ELEVATION_BASE_URL = 'https://maps.google.com/maps/api/elevation/json'


mongoDbInstance = 'backend_mongo'
mongoDbPort = 3017


def getElevationPoints():
    def mapElevationPoint(x):
        return ElevationPoint.ElevationPoint(x['latitude'], x['longitude'], x['elevation'])

    def mapElevationPoints(x):
        return map(mapElevationPoint, x)

    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    elevationPoints = db.ElevationPoints.find()
    return mapElevationPoints(elevationPoints)


def updateElevationPoints(track):
    def offset(lat1, lng1, lat2, lng2):
        return vincenty((lat1, lng1), (lat2, lng2)).meters
    storedElevationPoints = getElevationPoints()
    elevationPoints = getElevation(track.trackingpoints)
    elevationPointsToBeStored = []
    for newElevationPoint in elevationPoints:
        filter = [
            e for e in storedElevationPoints if 0.0 <= offset(e.latitude, e.longitude, newElevationPoint.latitude, newElevationPoint.longitude) <= 25.0 ]
        if len(filter) == 0:
            elevationPointsToBeStored.append(newElevationPoint)

    insertElevationPoints(elevationPointsToBeStored)


def insertElevationPoints(elevationPoints):
    if len(elevationPoints) == 0:
        return
    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    db.ElevationPoints.insert_many(
        ([{'latitude': i.latitude, 'longitude': i.longitude, 'elevation': i.elevation} for i in elevationPoints]))


def getElevation(path=[], samples="256", sensor="false", **elvtn_args):
    def mapTrackingPoint(p):
        return str(p.latitude) + ',' + str(p.longitude)

    def mapTrackingPoints(points):
        convertedPoints = map(mapTrackingPoint, points)
        return "|".join(convertedPoints)

    elvtn_args.update({
        'path': mapTrackingPoints(path),
        'samples': samples,
        'key': 'AIzaSyAlXJZ5kPhjzvpYaq8tu9sg_uhxULSihmk'
    })

    url = ELEVATION_BASE_URL + '?' + urllib.urlencode(elvtn_args)
    response = simplejson.load(urllib.urlopen(url))

    return [ElevationPoint.ElevationPoint(resultset['location']['lat'], resultset['location']['lng'], resultset['elevation']) for resultset in response['results']]        

if __name__ == '__main__':
    TrackRepository.mongoDbInstance = '192.168.1.101'
    mongoDbInstance = '192.168.1.101'
    for track in TrackRepository.getTracks():
        for r in track.ranges:
            tempTrack = Track.Track(track.name, track.filterPoints(r[0], r[1]))
            try:
                now = time.time()
                updateElevationPoints(tempTrack)
                print 'updated elevation points for ' + track.name + ' in ' + (time.time() - now) + 's'
            except Exception:
                print 'cannot update elevation points for ' + track.name
                pass
