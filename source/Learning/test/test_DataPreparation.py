import os
import sys

import unittest2
#import tensorflow as tf

sys.path.append(os.path.abspath(".."))
#import velocityPrediction

import movementDataPreparation
import datetime
from  TrackingPoint import TrackingPoint
from  Track import Track
from  ElevationPoint import ElevationPoint

datetimeFormat = "%Y-%m-%dT%H:%M:%S.%fZ"

class test_DataPreparation(unittest2.TestCase):

    # def test_should_get_correct_y_values(self):
    #     datapreparation = velocityPrediction.DataPreparation(1, 3, 0, 0)
    #     datapreparation.assign_data([(i, i, i) for i in range(0, 10)])
    #     datapreparation.current_step = 2

    #     data, labels = datapreparation.input_fn_train()

    #     session = tf.Session()
    #     self.assertSequenceEqual(list(session.run(labels)), list([3.0, 4.0, 5.0]))
    #     self.assertSequenceEqual(list(session.run(data['latitude'])), list([3.0, 4.0, 5.0]))

    def test_should_prepare_training_data(self):
        track = Track("TestTrack",
                  [TrackingPoint(3.5, 8.8, datetime.datetime.strptime('2016-11-11T12:00:00.000Z', datetimeFormat)),
                   TrackingPoint(3.4, 8.8, datetime.datetime.strptime('2016-11-11T12:00:10.000Z', datetimeFormat)),
                   TrackingPoint(3.3, 8.8, datetime.datetime.strptime('2016-11-11T14:00:10.000Z', datetimeFormat))])
        elevationPoints = [ElevationPoint(3.3, 8.8, 30.0),
                           ElevationPoint(3.4, 8.8, 20.0),
                           ElevationPoint(3.5, 8.8, 10.0)]
        result = list(movementDataPreparation.generateFeatures([track], elevationPoints))
        self.assertEqual(result[0][2], 0.0, result)
        self.assertEqual(result[0][3], 0.0, result)
        self.assertGreater(result[1][2], 0.0, result)
        self.assertGreater(result[1][3], 0.0, result)
        self.assertEqual(result[2][2], 0.0, result)
        self.assertEqual(result[2][3], 0.0, result)
