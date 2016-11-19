from pymongo import MongoClient
from bson.code import Code
from itertools import chain
from Track import Track
from TrackingPoint import TrackingPoint

mongoDbInstance =  'backend_mongo'
mongoDbPort = 3017

def importDataFromCentralMongoDb(fromBegin, tillEnd, trackingId) :
    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    posts = db.Posts
    filterCriteria = [{ "timestamputc" : { "$gt" : fromBegin }},
                                      { "timestamputc" : { "$lt" : tillEnd }},
                                      { "origin" : "gps" }]
    if trackingId != '':
        filterCriteria.append({ "name" : trackingId })
    for post in posts.find({"$and" : filterCriteria }).sort("timestamputc", -1):
        yield post

def getTracks():
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
        return  Track(t['_id']['name'], trackingpoints)

    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    tracks = db.Tracks.find()
    domainModelTracks = map(mapToDomainModel, tracks)

    for track in domainModelTracks:
        yield track

def updateTracks(updateDatetime):
    mapFunction = Code("function()"
    "{"
        "var key = { name: this.name };"
        "var  value = {"
            "latitude: this.latitude,"
            "longitude: this.longitude,"
            "timestamp: this.timestamputc"
        "};"
        "emit(key, value);"
    "};")
    reduceFunction = Code("function(key, values) {"
                        "var result = [];"
                        "values.forEach( function(value) {"
                        "                      result.push(value);"
                        "                }"
                        "              );"
                        "return { trackingpoints: result };"
                        "};")
    client = MongoClient(mongoDbInstance, mongoDbPort)
    db = client.parse
    db.Tracks.remove()
    db.Posts.map_reduce(mapFunction, reduceFunction, "Tracks")