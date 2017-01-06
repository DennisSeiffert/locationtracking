#  Copyright 2016 The TensorFlow Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

import numpy as np
import pandas as pd
import tensorflow as tf
tf.logging.set_verbosity(tf.logging.INFO)


class DataPreparation:
    def __init__(self, tracks):
        tracksDataFrame = pd.DataFrame(tracks, dtype=np.float32)
        #prepare geopoints as list of 2-tuple
        geoPoints = tracksDataFrame.drop(2, axis=1)
        velocities = tracksDataFrame[2]
        train_x, val_x, test_x = self.split_data(geoPoints)
        train_y, val_y, test_y = self.split_data(velocities)
        self.X, self.y = dict(train=train_x, val=val_x, test=test_x), dict(train=train_y, val=val_y, test=test_y)
        self.Features = ['latitude', 'longitude']

    def split_data(self, data, val_size=0.1, test_size=0.1):
        """
        splits data to training, validation and testing parts
        """
        ntest = int(round(len(data) * (1 - test_size)))
        nval = int(round(len(data.iloc[:ntest]) * (1 - val_size)))

        df_train, df_val, df_test = data.iloc[
            :nval], data.iloc[nval:ntest], data.iloc[ntest:]

        return df_train, df_val, df_test

    def input_fn_train(self):
        return self.input_fn('train')

    def input_fn_val(self):
        return self.input_fn('val')

    def input_fn_test(self):
        return self.input_fn('test')

    def input_fn(self, key):
        featureData = {'latitude' : tf.constant(self.X[key][0].as_matrix(), dtype=tf.float32),
                       'longitude' : tf.constant(self.X[key][1].as_matrix(), dtype=tf.float32)}
        labelData = tf.constant(self.y[key].as_matrix(), dtype=tf.float32)
        return featureData, labelData

    def get_Features(self):
        return [tf.contrib.layers.real_valued_column(f) for f in self.Features]



def main(_):
    tracks = np.array([(7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.4,
    23.0), (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0)], dtype=np.float32)
    dataPreparation = DataPreparation(tracks)
    # Or estimator using the ProximalAdagradOptimizer optimizer with
    # regularization.
    estimator = tf.contrib.learn.DNNRegressor(
        feature_columns=dataPreparation.get_Features(),
        hidden_units=[1024, 512, 256],
        model_dir="/tmp/velocityPrediction",
        config=tf.contrib.learn.RunConfig(save_checkpoints_secs=1),
        optimizer=tf.train.ProximalAdagradOptimizer(
        learning_rate=0.2,
        l1_regularization_strength=0.001
        ))

    validation_monitor = tf.contrib.learn.monitors.ValidationMonitor(input_fn=dataPreparation.input_fn_val,
                                                            every_n_steps=50,                                                            
                                                            early_stopping_rounds=100)

    estimator.fit(input_fn=dataPreparation.input_fn_train,
    #              monitors=[validation_monitor],
                  steps=10000)
    estimator.evaluate(input_fn=dataPreparation.input_fn_val, steps=100)
    estimator.predict(input_fn=dataPreparation.input_fn_test)



if __name__ == '__main__':
    tf.app.run()
