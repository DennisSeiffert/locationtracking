from pymongo import MongoClient
from bson.code import Code
from itertools import chain
from Track import Track
from TrackingPoint import TrackingPoint

mongoDbInstance = 'backend_mongo'
mongoDbPort = 3017


def mapToDomainModel(t):
    trackingpointsRef = t['value']['trackingpoints']
    trackingpoints = []

    if len(trackingpointsRef) > 0:
        def mapTrackingPoint(x):
            return TrackingPoint(x['latitude'], x['longitude'], x['timestamp'])

        def mapTrackingPoints(x):
            if 'trackingpoints' in x:
                return map(mapTrackingPoint, x['trackingpoints'])
            return [mapTrackingPoint(x)]

        trackingpoints = list(chain.from_iterable(map(mapTrackingPoints, trackingpointsRef)))
    return Track(t['_id']['name'], trackingpoints)

def getTracks():
    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    tracks = db.Tracks.find()
    domainModelTracks = map(mapToDomainModel, tracks)

    for track in domainModelTracks:
        yield track

def getTrack(trackname, beginDate, endDate):
    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    track = db.Tracks.find({"_id" :{ "name" : trackname}})
    domainModelTrack = mapToDomainModel(track[0])
    domainModelTrack.sort()
    domainModelTrack.restrict(beginDate, endDate)
    return domainModelTrack

def updateTracks(updateDatetime):
    mapFunction = Code("function()"
    "{"
        "var key = { name: this.name };"
        "var  value = {"
            "latitude: this.latitude,"
            "longitude: this.longitude,"
            "timestamp: this.timestamputc"
        "};"
        "if(this.origin == 'gps'){"
        "   emit(key, value);"
        "}"
    "};")
    reduceFunction = Code("function(key, values) {"
                        "var result = [];"
                        "values.forEach( function(value) {"
                        "                            result.push(value);"
                        "                }"
                        "              );"
                        "return { trackingpoints: result };"
                        "};")
    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    db.Tracks.remove()
    db.Posts.map_reduce(mapFunction, reduceFunction, "Tracks")