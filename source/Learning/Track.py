from datetime import datetime
from bisect import bisect_left

from geopy.distance import vincenty


class Track:


    def __init__(self, name, trackingpoints):
        self.name = name
        self.trackingpoints = trackingpoints
        self.mintimestamputc = datetime.utcnow()
        self.maxtimestamputc = datetime.utcnow()
        self.ranges = []
        self.sort()
        self.calculateDateRange()
        self.calculateDistances()
        self.calculateVelocities()
        self.calculateRise()

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

    def calculateRise(self):
        for i in range(1, len(self.trackingpoints)):
            riseDifference = self.trackingpoints[i].elevationInMeters - self.trackingpoints[i -1].elevationInMeters
            if self.trackingpoints[i].distanceFromAncestor > 0.0:
                self.trackingpoints[i].rise = riseDifference / self.trackingpoints[i].distanceFromAncestor
                                                                                     

    def getNearestPointIndex(self, latitude, longitude):       
        for i in range(0, len(self.trackingpoints)):
            distanceInMeters = vincenty((latitude, longitude), (self.trackingpoints[i].latitude, self.trackingpoints[i].longitude)).meters
            if distanceInMeters < 100.0:
                return i

        return -1

    def assignElevationAt(self, index, elevation):
        self.trackingpoints[index].elevationInMeters = elevation

    def assignElevation(self, elevationPoints):
        def compareGeoPoints(f, s):
            def compareLongitude(f1, s1):
                if f1.longitude > s1.longitude:
                    return 1
                elif f1.longitude < s1.longitude:
                    return -1
                return 0
            if f.latitude > s.latitude:
                return 1
            elif f.latitude < s.latitude:
                return -1
            
            return compareLongitude(f,s)

        def bisect(a, x, lo=0, hi=None, cmp=None):                
            def simpleCmp(x,y): 
                if x < y: 
                    -1 
                elif x > y:
                     1 
                else: 0
            if lo < 0:
                raise ValueError('lo must be non-negative')
            if hi is None:
                hi = len(a)
            if cmp is None:
                cmp = simpleCmp

            while lo < hi:
                mid = (lo+hi)//2
                comparedValue = cmp(a[mid], x)
                if comparedValue < 0: 
                    lo = mid+1
                elif comparedValue > 0:
                    hi = mid
                else: 
                    return mid                
            return lo

        sortedElevationPoints = list(elevationPoints)
        sortedElevationPoints.sort(compareGeoPoints)

        # sortedTrackingPoints = list(self.trackingpoints)
        # sortedTrackingPoints.sort(compareGeoPoints)

        for trackingPoint in self.trackingpoints:
            i = bisect(sortedElevationPoints, trackingPoint, cmp=compareGeoPoints)
            if i != len(sortedElevationPoints):
                trackingPoint.elevationInMeters = sortedElevationPoints[i].elevation        

    def calculateVelocities(self):        
        minRangeTimestamp = datetime.utcnow()
        for i in range(1, len(self.trackingpoints)):
            timespan = (self.trackingpoints[i].timestamputc - self.trackingpoints[i-1].timestamputc).total_seconds()
            minRangeTimestamp = min([minRangeTimestamp, self.trackingpoints[i-1].timestamputc])
            if timespan > 0.0 and timespan < 3600.0:
                self.trackingpoints[i].velocity = self.trackingpoints[i].distanceFromAncestor / timespan                                
            elif timespan > 3600.0:
                self.ranges.append([minRangeTimestamp, self.trackingpoints[i-1].timestamputc])
                minRangeTimestamp = self.trackingpoints[i].timestamputc
        if len(self.trackingpoints) > 0:
            self.ranges.append([minRangeTimestamp, self.trackingpoints[len(self.trackingpoints) - 1].timestamputc])


    def sort(self):
        list.sort(self.trackingpoints, cmp = lambda x,y: int((x.timestamputc - y.timestamputc).total_seconds()))

    def restrict(self, beginDate, endDate):
        self.trackingpoints = self.filterPoints(beginDate, endDate)

    def filterPoints(self, beginDate, endDate):
        return filter(lambda item: beginDate <= item.timestamputc <= endDate, self.trackingpoints)