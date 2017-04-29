import unittest2
import datetime

import sys
import os
sys.path.append(os.path.abspath(".."))
from Track import Track
from TrackingPoint import TrackingPoint
from ElevationPoint import ElevationPoint

# 2016-10-06T22:11:47.160Z
datetimeFormat = "%Y-%m-%dT%H:%M:%S.%fZ"

class TrackTest(unittest2.TestCase):

    def test_calculates_distances_in_between(self):
        track = Track("TestTrack", [TrackingPoint(3.5, 8.8, datetime.datetime.strptime('2016-11-11T12:00:00.000Z', datetimeFormat)),
                                    TrackingPoint(3.4, 8.8, datetime.datetime.strptime('2016-11-11T12:00:10.000Z', datetimeFormat))])
        self.assertEqual(track.trackingpoints[0].distanceFromAncestor, 0.0)
        self.assertEqual(track.trackingpoints[1].distanceFromAncestor, 11057.829712673123)


    def test_calculates_velocities_in_between(self):
        track = Track("TestTrack",
                  [TrackingPoint(3.5, 8.8, datetime.datetime.strptime('2016-11-11T12:00:00.000Z', datetimeFormat)),
                   TrackingPoint(3.4, 8.8, datetime.datetime.strptime('2016-11-11T12:00:10.000Z', datetimeFormat))])
        self.assertEqual(track.trackingpoints[0].velocity, 0.0)
        self.assertEqual(track.trackingpoints[1].velocity, 1105.7829712673124)

    def test_get_nearest_point(self):
        track = Track("TestTrack",
                  [TrackingPoint(3.5, 8.8, datetime.datetime.strptime('2016-11-11T12:00:00.000Z', datetimeFormat)),
                   TrackingPoint(3.4, 8.8, datetime.datetime.strptime('2016-11-11T12:00:10.000Z', datetimeFormat))])
        indexOfNearestPoint = track.getNearestPointIndex(3.4001, 8.8)
        self.assertEqual(indexOfNearestPoint, 1)   

    def test_calculate_rise(self):
        track = Track("TestTrack",
                  [TrackingPoint(3.5, 8.8, datetime.datetime.strptime('2016-11-11T12:00:00.000Z', datetimeFormat)),
                   TrackingPoint(3.4, 8.8, datetime.datetime.strptime('2016-11-11T12:00:10.000Z', datetimeFormat))])
        track.assignElevationAt(1, 100.0)
        track.calculateRise()
        self.assertEqual(track.trackingpoints[0].rise, 0.0)
        self.assertGreater(track.trackingpoints[1].rise, 0.0)

    def test_assign_elevation_from_points(self):
        track = Track("TestTrack",
                  [TrackingPoint(3.5, 8.8, datetime.datetime.strptime('2016-11-11T12:00:00.000Z', datetimeFormat)),
                   TrackingPoint(3.4, 8.8, datetime.datetime.strptime('2016-11-11T12:00:10.000Z', datetimeFormat)),
                   TrackingPoint(3.3, 8.8, datetime.datetime.strptime('2016-11-11T12:00:10.000Z', datetimeFormat))])
        elevationPoints = [ElevationPoint(3.3, 8.8, 30.0),
                           ElevationPoint(3.4, 8.8, 20.0),
                           ElevationPoint(3.5, 8.8, 10.0)]
        track.assignElevation(elevationPoints)
        track.calculateRise()
        
        self.assertEqual(track.trackingpoints[0].elevationInMeters, 10.0)
        self.assertEqual(track.trackingpoints[1].elevationInMeters, 20.0)
        self.assertEqual(track.trackingpoints[2].elevationInMeters, 30.0)
        self.assertGreater(track.trackingpoints[1].rise, 0.0)

if __name__ == '__main__':
    unittest2.main()