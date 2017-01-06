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
from tensorflow.contrib import layers as tflayers
from tensorflow.contrib import learn as tflearn
from tensorflow.python.framework import dtypes

from movementDataPreparation import requestTracks


def x_sin(x):
    return x * np.sin(x)


def sin_cos(x):
    return pd.DataFrame(dict(a=np.sin(x), b=np.cos(x)), index=x)


def rnn_data(data, time_steps, labels=False):
    """
    creates new data frame based on previous observation
      * example:
        l = [1, 2, 3, 4, 5]
        time_steps = 2
        -> labels == False [[1, 2], [2, 3], [3, 4]]
        -> labels == True [2, 3, 4, 5]
    """
    rnn_df = []
    for i in range(len(data) - time_steps):
        if labels:
            try:
                rnn_df.append(data.iloc[i:i + time_steps].as_matrix())
            except AttributeError:
                rnn_df.append(data.iloc[i + time_steps])
        else:
            data_ = data.iloc[i: i + time_steps].as_matrix()
            rnn_df.append(
                data_ if len(data_.shape) > 1 else [[i] for i in data_])

    return np.array(rnn_df, dtype=np.float32)


def split_data(data, val_size=0.1, test_size=0.1):
    """
    splits data to training, validation and testing parts
    """
    ntest = int(round(len(data) * (1 - test_size)))
    nval = int(round(len(data.iloc[:ntest]) * (1 - val_size)))

    df_train, df_val, df_test = data.iloc[
        :nval], data.iloc[nval:ntest], data.iloc[ntest:]

    return df_train, df_val, df_test


def prepare_data(data, time_steps, labels=False, val_size=0.2, test_size=0.2):
    """
    Given the number of `time_steps` and some data,
    prepares training, validation and test data for an lstm cell.
    """
    df_train, df_val, df_test = split_data(data, val_size, test_size)
    return (rnn_data(df_train, time_steps, labels=labels),
            rnn_data(df_val, time_steps, labels=labels),
            rnn_data(df_test, time_steps, labels=labels))


def load_csvdata(rawdata, time_steps, seperate=False):
    data = rawdata
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)

    train_x, val_x, test_x = prepare_data(
        data['a'] if seperate else data, time_steps)
    train_y, val_y, test_y = prepare_data(
        data['b'] if seperate else data, time_steps, labels=True)
    return dict(train=train_x, val=val_x, test=test_x), dict(train=train_y, val=val_y, test=test_y)


def generate_data(fct, x, time_steps, seperate=False):
    """generates data with based on a function fct"""
    data = fct(x)
    if not isinstance(data, pd.DataFrame):
        data = pd.DataFrame(data)
    train_x, val_x, test_x = prepare_data(
        data['a'] if seperate else data, time_steps)
    train_y, val_y, test_y = prepare_data(
        data['b'] if seperate else data, time_steps, labels=True)
    return dict(train=train_x, val=val_x, test=test_x), dict(train=train_y, val=val_y, test=test_y)


def lstm_model(num_units, rnn_layers, dense_layers=None, learning_rate=0.1, optimizer='Adagrad'):
    """
    Creates a deep model based on:
        * stacked lstm cells
        * an optional dense layers
    :param num_units: the size of the cells.
    :param rnn_layers: list of int or dict
                         * list of int: the steps used to instantiate the `BasicLSTMCell` cell
                         * list of dict: [{steps: int, keep_prob: int}, ...]
    :param dense_layers: list of nodes for each layer
    :return: the model definition
    """

    def lstm_cells(layers):
        if isinstance(layers[0], dict):
            return [tf.contrib.rnn.DropoutWrapper(
                tf.contrib.rnn.BasicLSTMCell(layer['num_units'],
                                             state_is_tuple=True), layer['keep_prob'])
                    if layer.get('keep_prob') 
                    else 
                        tf.contrib.rnn.BasicLSTMCell(layer['num_units'],
                                                                       state_is_tuple=True)
                    for layer in layers]
        return [tf.contrib.rnn.BasicLSTMCell(steps, state_is_tuple=True) for steps in layers]

    def dnn_layers(input_layers, layers):
        if layers and isinstance(layers, dict):
            return tflayers.stack(input_layers, tflayers.fully_connected,
                                  layers['layers'],
                                  activation=layers.get('activation'),
                                  dropout=layers.get('dropout'))
        elif layers:
            return tflayers.stack(input_layers, tflayers.fully_connected, layers)
        else:
            return input_layers

    def _lstm_model(X, y):
        stacked_lstm = tf.contrib.rnn.MultiRNNCell(
            lstm_cells(rnn_layers), state_is_tuple=True)
        x_ = tf.reshape(X, [-1, 8, 2])
        output, _ = tf.nn.dynamic_rnn(
            stacked_lstm, x_, dtype=dtypes.float32)
        output_ = output[-1]
        output_ = dnn_layers(output_, dense_layers)
        prediction, loss = tflearn.models.linear_regression(output_, y)
        train_op = tf.contrib.layers.optimize_loss(
            loss, tf.contrib.framework.get_global_step(), optimizer=optimizer,
            learning_rate=learning_rate)
        return prediction, loss, train_op

    return _lstm_model


def main(unused_argv):
    tracks = np.array([(7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.4,
    23.0), (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0),
    (7.0, 8.4, 23.0), (7.0, 8.4, 23.0), (7.0, 8.0, 23.0)], dtype=np.float32)
    #tracks = np.array(list(requestTracks()), dtype=np.float32)    
    LOG_DIR = './ops_logs/sin'
    TIMESTEPS = 8
    RNN_LAYERS = [{'num_units': 128}, {'num_units': 128}]
    DENSE_LAYERS = None #[2]
    TRAINING_STEPS = 1300
    PRINT_STEPS = TRAINING_STEPS / 100
    BATCH_SIZE = 5

    tracksDataFrame = pd.DataFrame(tracks, dtype=np.float32)
    #prepare geopoints as list of 2-tuple
    geoPoints = tracksDataFrame.drop(2, axis=1)
    velocities = tracksDataFrame[2]
    train_x, val_x, test_x = split_data(geoPoints)
    train_y, val_y, test_y = split_data(velocities)
    X, y = dict(train=train_x, val=val_x, test=test_x), dict(train=train_y, val=val_y, test=test_y)

    regressor = tflearn.Estimator(
        model_fn=lstm_model(TIMESTEPS, RNN_LAYERS, DENSE_LAYERS),
                                model_dir=LOG_DIR)
    # X, y = generate_data(
    #     np.sin, np.linspace(0, 100, 10000, dtype=np.float32), TIMESTEPS, seperate=False)
    # create a lstm instance and validation monitor    
    validation_monitor = tflearn.monitors.ValidationMonitor(X['val'], y['val'],
                                                            every_n_steps=PRINT_STEPS,
                                                            early_stopping_rounds=1000)

    regressor.fit(X['train'], y['train'],
                  monitors=[validation_monitor],
                  batch_size=BATCH_SIZE,
                  steps=TRAINING_STEPS)

    predicted = regressor.predict(X['test'])
    # rmse = np.sqrt(((predicted - y['test']) ** 2).mean(axis=0))
    # from sklearn.metrics import mean_squared_error
    # predictedList = list(predicted)
    # testList = list(y['test'])

    # score = mean_squared_error(predictedList, testList)
    # print ("MSE: %f" % score)
    from matplotlib import pyplot as plt
    plot_predicted, = plt.plot(list(predicted), label='predicted')
    plot_test, = plt.plot(list(y['test']), label='test')
    plt.legend(handles=[plot_predicted, plot_test])
    plt.show()


if __name__ == '__main__':
    tf.app.run()
