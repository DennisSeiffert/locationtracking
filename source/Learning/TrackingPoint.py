

class TrackingPoint:
    def __init__(self, latitude, longitude, timestamputc):
        self.latitude = latitude
        self.longitude = longitude
        self.timestamputc = timestamputc
        self.distanceFromAncestor = 0
        self.velocity = 0.0
        self.elevationInMeters = 0.0
        self.rise = 0.0
