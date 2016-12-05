from geopy.distance import vincenty
import requests

from Track import Track
from TrackingPoint import TrackingPoint


def mapToDomainModel(t):
    trackingpointsRef = t['trackingpoints']
    trackingpoints = []

    if len(trackingpointsRef) > 0:
        def mapTrackingPoint(x):
            return TrackingPoint(x['latitude'], x['longitude'], x['timestamputc']['$date'])

        trackingpoints = list(map(mapTrackingPoint, trackingpointsRef))
    return Track(t['name'], trackingpoints)

def requestTracks():
    url = 'http://hmmas8wmeibjab4e.myfritz.net/api/tracks'
    result = requests.get(url)
    if  result.status_code == 200:
        return list(map(mapToDomainModel, result.json()))
    return []