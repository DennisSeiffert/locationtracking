import datetime

from geopy.distance import vincenty


class Track:


    def __init__(self, name, trackingpoints):
        self.name = name
        self.trackingpoints = trackingpoints
        self.mintimestamputc = datetime.datetime.utcnow()
        self.maxtimestamputc = datetime.datetime.utcnow()
        self.calculateDateRange()

    def calculateDateRange(self):
        if len(self.trackingpoints) > 0:
            timestamps = map(lambda t: t.timestamputc, self.trackingpoints)
            self.mintimestamputc = min(timestamps)
            self.maxtimestamputc = max(timestamps)

    @staticmethod
    def calculateDistance(lat1, lon1, lat2, lon2):
        return vincenty((lat1, lon1), (lat2, lon2)).meters

    def sort(self):
        list.sort(self.trackingpoints, cmp = lambda x,y: int((x.timestamputc - y.timestamputc).total_seconds()))

    def restrict(self, beginDate, endDate):
        self.trackingpoints = filter(lambda item: beginDate <= item.timestamputc <= endDate, self.trackingpoints)