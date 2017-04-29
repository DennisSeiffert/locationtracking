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
import tensorflow.contrib.learn as learn
import tensorflow.contrib.layers as layers
import tensorflow.contrib.rnn as rnn

import movementDataPreparation as move
import ElevationRepository
tf.logging.set_verbosity(tf.logging.ERROR)


class DataPreparation:
    def __init__(self, timesteps, batchsize, val_size=0.1, test_size=0.1):
        self.Features = ['rise']
        self.timesteps = timesteps
        self.batchsize = batchsize
        self.current_step = 0
        self.val_size = val_size
        self.test_size = test_size

    def __expand_rises(self, rises, timesteps):
        new_input = np.array([rises[i:i+timesteps] for i in range(0, rises.shape[0] - timesteps)])
        return pd.DataFrame(new_input)

    def __extract_velocities(self, tracksDataFrame):
        return tracksDataFrame[2]

    def __extract_rises(self, tracksDataFrame):
        return tracksDataFrame[3]

    def __extract_latitude(self, tracksDataFrame):
        return tracksDataFrame[0]

    def __extract_longitude(self, tracksDataFrame):
        return tracksDataFrame[1]

    def __extract_geopoints(self, tracksDataFrame):
        return tracksDataFrame.drop(2, axis=1)

    def __create_data_triple(self, tracksDataFrame):
        rises_features = self.__expand_rises(self.__extract_rises(tracksDataFrame),
                                                     self.timesteps)
        train, val, test = self.__split_data(rises_features)
        velocities = self.__extract_velocities(tracksDataFrame)[self.timesteps:]
        velocities_train, velocities_val, velocities_test = self.__split_data(velocities)

        return train, val, test, velocities_train, velocities_val, velocities_test

    def __split_data(self, data):
        """
        splits data to training, validation and testing parts
        """
        ntest = int(round(len(data) * (1 - self.test_size)))
        nval = int(round(len(data.iloc[:ntest]) * (1 - self.val_size)))
        df_train, df_val, df_test = data.iloc[:nval], data.iloc[nval:ntest], data.iloc[ntest:]
        #assert len(df_train) >= self.timesteps, "training uses {0} of {1} elements to be able to look back in the past.".format(self.timesteps, len(df_train))
        #assert len(df_val) >= self.timesteps, "validation uses {0} of {1} elements to be able to look back in the past.".format(self.timesteps, len(df_val))
        # assert len(df_test) > self.timesteps, "test uses %r elements to be able to look back in the past." % self.timesteps
        return df_train, df_val, df_test

    def assign_data(self, tracks):
        """ assigns new tracks to data preparation (overwrites existing tracks)
        Args:
            tracks: tracks as array containing tuples (latitude, longitude, velocity), 
                     [(latitude, longitude, velocity), (latitude, longitude, velocity), ...]
        """
        tracksDataFrame = pd.DataFrame(tracks, dtype=np.float32)
        train_x, val_x, test_x, train_y, val_y, test_y = self.__create_data_triple(tracksDataFrame)
        self.X, self.y = dict(train=train_x, val=val_x, test=test_x), dict(train=train_y, val=val_y, test=test_y)

    def reset_step(self):
        self.current_step = 0

    def input_fn_train(self, step = None):
        return self.input_fn('train', step)

    def input_fn_val(self, step = None):
        return self.input_fn('val', step)

    def input_fn_test(self, step = None):
        return self.input_fn('test', step)

    def input_fn(self, key, step = None):
        begin = 0
        end = len(self.X[key])
        begin_y = 0
        end_y = len(self.y[key])
        max_elements = end
        canUpdateCurrentStep = key == 'train'
        if self.batchsize > 0 and self.current_step * self.batchsize + self.batchsize <= max_elements:
            begin = self.current_step * self.batchsize
            end = begin + self.batchsize
            begin_y = self.current_step
            end_y = self.current_step + self.batchsize / self.timesteps
            if canUpdateCurrentStep: self.current_step += 1
        elif self.batchsize > 0 and self.current_step * self.batchsize + self.batchsize > max_elements:
            begin = max_elements - self.batchsize
            end = max_elements
            begin_y = end_y - self.batchsize / self.timesteps            
            if canUpdateCurrentStep: self.current_step = -1
        featureData = {'rise' : tf.constant(self.X[key][begin:end].as_matrix(), dtype=tf.float32)}
        labelData = tf.constant(self.y[key][begin:end].as_matrix(), dtype=tf.float32)
        return featureData, labelData

    def get_Features(self):
        return [tf.contrib.layers.real_valued_column(f) for f in self.Features]

class Model:
    def __init__(self, rnn_units, timesteps):
        """initializes rnn model with following regression

        Args:
            rnn_units: is an array containing num_units of LSTMCell, for instance [256, 128]
        """
        self.rnn_units = rnn_units
        self.learning_rate = 0.1
        self.optimizer = tf.train.ProximalAdagradOptimizer(self.learning_rate, l1_regularization_strength=0.001)        
        self.timesteps = timesteps

    def create_regression_network(self, x, y):
        # x_ = layers.stack(x, layers.fully_connected, [128, 64, 32])
        if y is None:
            y = tf.zeros([x.get_shape()[0]])
        prediction, loss = learn.models.linear_regression(x, y)
        train_op = layers.optimize_loss(
            loss,
            tf.contrib.framework.get_global_step(),
            optimizer=self.optimizer,
            learning_rate=self.learning_rate)
        return prediction, loss, train_op

    def create_rnn_network(self, features):
        batch_size = features['rise'].get_shape()[0].value
        rnn_features = tf.reshape(features['rise'], [batch_size, self.timesteps, -1], name="input_rise") #tf.stack([features['rise']], axis=0, name="input_rise")
        tf.summary.histogram('rise distribution', rnn_features)
                
        #rnn_features = tf.reshape(features, [batch_size, self.timesteps, -1])
        rnn_cells = [rnn.LSTMBlockCell(num_units) for num_units in self.rnn_units]
        stacked_lstm = tf.nn.rnn_cell.MultiRNNCell(rnn_cells)
        output, state = tf.nn.dynamic_rnn(stacked_lstm, rnn_features, dtype=tf.float32)
        return output, state

    def model_fn(self, features, targets, mode):
        batch_size = features['rise'].get_shape()[0].value
        rnn_output, rnn_state = self.create_rnn_network(features)
        #rnn_output = tf.gather(tf.reshape(rnn_output, [-1,self.rnn_units[-1]]), [np.max([i-1,0]) for i in range(0, rnn_output.get_shape()[0].value * self.timesteps, self.timesteps)])        
        rnn_output_reshaped = tf.reshape(rnn_output, [batch_size, self.timesteps ,self.rnn_units[-1]])
        rnn_output_reshaped = rnn_output_reshaped[:,-1]
        prediction, loss, train_op = self.create_regression_network(rnn_output_reshaped, targets)
        return prediction, loss, train_op


def main(_):
    ElevationRepository.mongoDbInstance = '192.168.1.101'
    max_count = 200    
    tracks = [tuple([i * 1.0, max_count-i, np.sin(np.deg2rad(i)) * 100.0, np.cos(np.deg2rad(i)) * 100.0]) for i in range(0, max_count)]
    #tracks = move.requestTracks()    
    data_preparation = DataPreparation(10, 15)   
    rnn_with_regression_model = Model(rnn_units=[256 for i in range(0, data_preparation.timesteps)],                                      
                                          timesteps=data_preparation.timesteps)    
    validation_monitor = learn.monitors.ValidationMonitor(input_fn=data_preparation.input_fn_val,
                                                          every_n_steps=1000,
                                                          eval_steps=10,
                                                          early_stopping_rounds=100)
    estimator = learn.Estimator(    
    model_fn=rnn_with_regression_model.model_fn,
            model_dir="/tmp/velocityPredictionRNN",
            config=learn.RunConfig(save_checkpoints_secs=600))
            #                       log_device_placement=True))
    data_preparation.assign_data(tracks)
    for epoch in range(0, 5):
        print 'epoch: %s' % epoch
        data_preparation.reset_step()
        while data_preparation.current_step > -1:
            estimator.fit(input_fn=lambda : data_preparation.input_fn_train(step=data_preparation.current_step),
                          # monitors=[validation_monitor],
                          steps=100)
            estimator.evaluate(input_fn=data_preparation.input_fn_val, steps=100)    
    
    
    data_preparation.reset_step()
    predicted = estimator.predict(input_fn=data_preparation.input_fn_test, as_iterable=False)
    from matplotlib import pyplot as plt
    plot_predicted, = plt.plot(list(predicted), label='predicted')
    plot_test, = plt.plot(list(data_preparation.y['test']), label='test')
    plt.legend(handles=[plot_predicted, plot_test])
    # plt.legend(handles=[plot_predicted])        
    plt.show()

if __name__ == '__main__':
    tf.app.run()
