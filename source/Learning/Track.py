from datetime import datetime

from geopy.distance import vincenty


class Track:


    def __init__(self, name, trackingpoints):
        self.name = name
        self.trackingpoints = trackingpoints
        self.mintimestamputc = datetime.utcnow()
        self.maxtimestamputc = datetime.utcnow()
        self.sort()
        self.calculateDateRange()
        self.calculateDistances()
        self.calculateVelocities()

    def calculateDateRange(self):
        if len(self.trackingpoints) > 0:
            timestamps = map(lambda t: t.timestamputc, self.trackingpoints)
            self.mintimestamputc = min(timestamps)
            self.maxtimestamputc = max(timestamps)

    def calculateDistances(self):
        def calculateDistanceInBetween(t1, t2):
            return vincenty((t1.latitude, t1.longitude), (t2.latitude, t2.longitude)).meters
        for i in range(1, len(self.trackingpoints)):
            self.trackingpoints[i].distanceFromAncestor = calculateDistanceInBetween(self.trackingpoints[i - 1],
                                                                                     self.trackingpoints[i])

    def calculateVelocities(self):
        index = 0
        for i in range(1, len(self.trackingpoints)):
            timespan = (self.trackingpoints[i].timestamputc - self.trackingpoints[i-1].timestamputc).total_seconds()
            if timespan > 0 and timespan < 60 * 60:
                self.trackingpoints[i].velocity = self.trackingpoints[i].distanceFromAncestor / timespan
                self.trackingpoints[i].index = index
                index = index + 1 
            else:
                index = 0               



    def sort(self):
        list.sort(self.trackingpoints, cmp = lambda x,y: int((x.timestamputc - y.timestamputc).total_seconds()))

    def restrict(self, beginDate, endDate):
        self.trackingpoints = filter(lambda item: beginDate <= item.timestamputc <= endDate, self.trackingpoints)