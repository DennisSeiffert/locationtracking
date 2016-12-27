from datetime import datetime
import requests

from Track import Track
from TrackingPoint import TrackingPoint

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
                    x['timestamputc']['$date'], datetimeFormatWithMs)
            except ValueError:
                timestamp = datetime.strptime(
                    x['timestamputc']['$date'], datetimeFormatWithoutMs)
            return TrackingPoint(x['latitude'], x['longitude'], timestamp)
        trackingpoints = [mapTrackingPoint(tp) for tp in trackingpointsRef]
    return Track(t['name'], trackingpoints)


def generateFeatures(tracks):
    for track in tracks:
        for point in track.trackingpoints:
            yield (point.latitude, point.longitude, point.velocity)


def requestTracks():
    url = 'http://hmmas8wmeibjab4e.myfritz.net/api/tracks'
    result = requests.get(url)
    if result.status_code == 200:
        tracks = [mapToDomainModel(t) for t in result.json()]
        return generateFeatures(tracks)
    return []
