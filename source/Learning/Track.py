class Track:


    def __init__(self, name, trackingpoints):
        self.name = name
        self.trackingpoints = trackingpoints
        self.mintimestamputc = 0
        self.maxtimestamputc = 0
        self.calculateDateRange()

    def calculateDateRange(self):
        timestamps = map(lambda t: t.timestamputc, self.trackingpoints)
        self.mintimestamputc = min(timestamps)
        self.maxtimestamputc = max(timestamps)