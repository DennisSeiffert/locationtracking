from datetime import datetime
import requests

from Track import Track
from TrackingPoint import TrackingPoint
import ElevationRepository

# 2016-10-06T22:11:47.160Z
datetimeFormatWithMs = "%Y-%m-%dT%H:%M:%S.%fZ"
datetimeFormatWithoutMs = "%Y-%m-%dT%H:%M:%SZ"


def mapToDomainModel(t):
    trackingpointsRef = t['trackingpoints']
    trackingpoints = []

    if len(trackingpointsRef) > 0:
        def mapTrackingPoint(x):
            try:
                timestamp = datetime.strptime(
                    x['timestamputc']['date'], datetimeFormatWithMs)
            except ValueError:
                timestamp = datetime.strptime(
                    x['timestamputc']['date'], datetimeFormatWithoutMs)
            return TrackingPoint(x['latitude'], x['longitude'], timestamp)
        trackingpoints = [mapTrackingPoint(tp) for tp in trackingpointsRef]
    return Track(t['name'], trackingpoints)


def generateFeatures(tracks, elevationPoints):    
    for track in tracks:
        track.assignElevation(elevationPoints)
        for range in track.ranges:
            tempTrack = Track(track.name, track.filterPoints(range[0], range[1]))
            tempTrack.calculateRise()
            for point in tempTrack.trackingpoints:
                yield (point.latitude, point.longitude, round(point.velocity, 1), int(point.rise * 100.0))


def requestTracks():
    url = 'http://hmmas8wmeibjab4e.myfritz.net/api/tracks'
    result = requests.get(url)
    if result.status_code == 200:
        tracks = [mapToDomainModel(t) for i, t in enumerate(result.json()) if i < 100]        
        elevationPoints = ElevationRepository.getElevationPoints()

        return generateFeatures(tracks, elevationPoints)
    return []
