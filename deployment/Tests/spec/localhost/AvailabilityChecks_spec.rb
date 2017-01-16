require 'spec_helper'

describe command('curl -I --retry 1 http://hmmas8wmeibjab4e.myfritz.net/geotracking/') do
  its(:stdout) { should match 'OK' }
end

describe command('curl -X GET -H "X-Parse-Application-Id: myAppId" -I --retry 1 http://hmmas8wmeibjab4e.myfritz.net/parse/classes/Posts') do
  its(:stdout) { should match 'OK' }
end

describe command('curl -X POST -H "Content-Type: application/json" http://hmmas8wmeibjab4e.myfritz.net/api/tracks') do
  its(:stdout) { should match '[]' }
end