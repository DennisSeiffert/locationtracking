import os
import sys

import unittest2
import tensorflow as tf

sys.path.append(os.path.abspath(".."))
import velocityPrediction


class test_DataPreparation(unittest2.TestCase):

    def test_should_get_correct_y_values(self):
        datapreparation = velocityPrediction.DataPreparation(1, 3, 0, 0)
        datapreparation.assign_data([(i, i, i) for i in range(0, 10)])
        datapreparation.current_step = 2

        data, labels = datapreparation.input_fn_train()

        session = tf.Session()
        self.assertSequenceEqual(list(session.run(labels)), list([3.0, 4.0, 5.0]))
        self.assertSequenceEqual(list(session.run(data['latitude'])), list([3.0, 4.0, 5.0]))
