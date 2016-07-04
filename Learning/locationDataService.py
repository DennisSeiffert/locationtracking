#! /usr/bin/env python
import json

import flask
from bson import json_util
from flask import Flask

import mongoDbImport

app = Flask(__name__)




@app.route("/trackingpoints")
def get_trackingpoints():
     def generate(p):
        yield '['
        index = 0
        for post in p:
            if index > 0:
                yield ","
            yield json.dumps(post, default=json_util.default)
            index += 1
        yield ']'
     posts = mongoDbImport.importDataFromCentralMongoDb()
     return flask.Response(generate(posts), mimetype="application/json")

if __name__ == '__main__':
    app.run(debug=True)