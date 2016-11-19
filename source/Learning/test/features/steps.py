from flask import json
from lettuce import step, world, before
from nose.tools import assert_equals

from locationDataService import app
import mongoDbImport


@before.all
def before_all():
    app.testing = True
    world.app = app.test_client()

@step(u'Given some tracking points in database')
def given_some_tracking_points_in_database(step):
    mongoDbImport.mongoDbInstance = '192.168.1.101'
    mongoDbImport.mongoDbPort = 3017
    print 'working in real data'

@step(u'When I want to get all tracking points')
def when_I_want_to_get_all_tracking_points(step):
    world.response = world.app.get('http://localhost:8080/trackingpoints/')

@step(u'Then I should get a \'(.*)\' response')
def Then_I_should_get_a_response(step, responseCode):
    assert 200 == int(responseCode)

@step(u'And the following trackingpoints are returned')
def And_the_following_trackingpoints_are_returned(step):
    print world.response.data
    assert_equals(step.hashes, [json.loads(world.response.data)])

