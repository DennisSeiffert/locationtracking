var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Option, compare, makeGeneric, compareRecords, equalsRecords } from "fable-core/Util";
import { where, ofArray, append, mapIndexed } from "fable-core/List";
import List from "fable-core/List";
import { exists, findIndex, item } from "fable-core/Seq";
import { utcNow, op_Subtraction } from "fable-core/Date";
export var TrackingJob = function () {
    function TrackingJob(identifier, marker, subscription, latitude, longitude, utcTimestamp, updatePositionOnMap, observe) {
        _classCallCheck(this, TrackingJob);

        this.identifier = identifier;
        this.marker = marker;
        this.subscription = subscription;
        this.latitude = latitude;
        this.longitude = longitude;
        this.utcTimestamp = utcTimestamp;
        this.updatePositionOnMap = updatePositionOnMap;
        this.observe = observe;
    }

    _createClass(TrackingJob, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_domainModel.TrackingJob",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    identifier: "string",
                    marker: "string",
                    subscription: "string",
                    latitude: "number",
                    longitude: "number",
                    utcTimestamp: Date,
                    updatePositionOnMap: "boolean",
                    observe: "boolean"
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsRecords(this, other);
        }
    }, {
        key: "CompareTo",
        value: function (other) {
            return compareRecords(this, other);
        }
    }]);

    return TrackingJob;
}();
setType("Fable_domainModel.TrackingJob", TrackingJob);
export var Track = function () {
    function Track(mintimestamp, maxtimestamp, name) {
        _classCallCheck(this, Track);

        this.mintimestamp = mintimestamp;
        this.maxtimestamp = maxtimestamp;
        this.name = name;
    }

    _createClass(Track, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_domainModel.Track",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    mintimestamp: Date,
                    maxtimestamp: Date,
                    name: "string"
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsRecords(this, other);
        }
    }, {
        key: "CompareTo",
        value: function (other) {
            return compareRecords(this, other);
        }
    }]);

    return Track;
}();
setType("Fable_domainModel.Track", Track);
export var TrackingPoint = function () {
    function TrackingPoint(latitude, longitude, timestamputc, speed, distanceCovered, distance, index, elevation) {
        _classCallCheck(this, TrackingPoint);

        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamputc = timestamputc;
        this.speed = speed;
        this.distanceCovered = distanceCovered;
        this.distance = distance;
        this.index = index;
        this.elevation = elevation;
    }

    _createClass(TrackingPoint, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_domainModel.TrackingPoint",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    latitude: "number",
                    longitude: "number",
                    timestamputc: Date,
                    speed: "number",
                    distanceCovered: "number",
                    distance: "number",
                    index: "number",
                    elevation: "number"
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsRecords(this, other);
        }
    }, {
        key: "CompareTo",
        value: function (other) {
            return compareRecords(this, other);
        }
    }]);

    return TrackingPoint;
}();
setType("Fable_domainModel.TrackingPoint", TrackingPoint);
export function toRad(x) {
    return x * 3.141592653589793 / 180;
}
export function distance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000;
}
export var TrackVisualization = function () {
    _createClass(TrackVisualization, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_domainModel.TrackVisualization",
                properties: {
                    Points: makeGeneric(List, {
                        T: TrackingPoint
                    }),
                    TrackName: "string"
                }
            };
        }
    }]);

    function TrackVisualization(name, points) {
        _classCallCheck(this, TrackVisualization);

        this.name = name;
        this.points = points;
    }

    _createClass(TrackVisualization, [{
        key: "totalDistanceInMeters",
        value: function () {
            return item(this.Points.length - 1, this.Points).distanceCovered;
        }
    }, {
        key: "getIndexOfNearestPoint",
        value: function (distanceInMeters) {
            return findIndex(function (p) {
                return p.distanceCovered >= distanceInMeters;
            }, this.Points);
        }
    }, {
        key: "getGeoPointFromElevationDataIndex",
        value: function (index) {
            var meters = index / this.Points.length * this.totalDistanceInMeters();
            var markerPointIndex = this.getIndexOfNearestPoint(meters);
            var geoPoint = this.getPointAt(markerPointIndex);
            return geoPoint;
        }
    }, {
        key: "getPointAt",
        value: function (index) {
            return item(index, this.Points);
        }
    }, {
        key: "Points",
        get: function () {
            return this.points;
        }
    }, {
        key: "TrackName",
        get: function () {
            return this.name;
        }
    }], [{
        key: "calculate",
        value: function (points) {
            return mapIndexed(function (i, p) {
                if (i === 0) {
                    var speed = 0;
                    var distanceCovered = 0;
                    return new TrackingPoint(p.latitude, p.longitude, p.timestamputc, speed, distanceCovered, p.distance, i, p.elevation);
                } else {
                    var distanceBetween = distance(item(i - 1, points).latitude, item(i - 1, points).longitude, p.latitude, p.longitude);
                    var timespan = op_Subtraction(p.timestamputc, item(i - 1, points).timestamputc);

                    var _speed = compare(timespan, 0) > 0 ? distanceBetween / (timespan / 1000) : 0;

                    var _distanceCovered = item(i - 1, points).distance + distanceBetween;

                    return new TrackingPoint(p.latitude, p.longitude, p.timestamputc, _speed, _distanceCovered, distanceBetween, i, p.elevation);
                }
            }, points);
        }
    }]);

    return TrackVisualization;
}();
setType("Fable_domainModel.TrackVisualization", TrackVisualization);
export var TrackingService = function () {
    _createClass(TrackingService, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_domainModel.TrackingService",
                properties: {
                    observedTrackingJobs: makeGeneric(List, {
                        T: TrackingJob
                    }),
                    ownTrackingJob: TrackingJob
                }
            };
        }
    }]);

    function TrackingService() {
        _classCallCheck(this, TrackingService);

        this["ownTrackingJob@"] = new TrackingJob("", "", "", 0, 0, utcNow(), true, true);
        this["observedTrackingJobs@"] = new List();
    }

    _createClass(TrackingService, [{
        key: "CreateTrackingJob",
        value: function (name, latitude, longitude) {
            return new TrackingJob(name, "", "", latitude, longitude, utcNow(), true, true);
        }
    }, {
        key: "AddTrackingJob",
        value: function (job, onObserveChanged) {
            if (!this.ContainsTrackingJob(job.identifier)) {
                this.observedTrackingJobs = append(this.observedTrackingJobs, ofArray([job]));
            }
        }
    }, {
        key: "DeleteTrackingJob",
        value: function (job) {
            this.observedTrackingJobs = where(function (j) {
                return !j.Equals(job);
            }, this.observedTrackingJobs);
        }
    }, {
        key: "ContainsTrackingJob",
        value: function (name) {
            return exists(function (j) {
                return j.identifier === name;
            }, this.observedTrackingJobs);
        }
    }, {
        key: "ownTrackingJob",
        get: function () {
            return this["ownTrackingJob@"];
        }
    }, {
        key: "observedTrackingJobs",
        get: function () {
            return this["observedTrackingJobs@"];
        },
        set: function (v) {
            this["observedTrackingJobs@"] = v;
        }
    }]);

    return TrackingService;
}();
setType("Fable_domainModel.TrackingService", TrackingService);
export var LocationTracker = function () {
    function LocationTracker(trackingService, visualization, tracks, error) {
        _classCallCheck(this, LocationTracker);

        this.TrackingService = trackingService;
        this.Visualization = visualization;
        this.Tracks = tracks;
        this.Error = error;
    }

    _createClass(LocationTracker, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_domainModel.LocationTracker",
                interfaces: ["FSharpRecord", "System.IEquatable"],
                properties: {
                    TrackingService: TrackingService,
                    Visualization: TrackVisualization,
                    Tracks: makeGeneric(List, {
                        T: Track
                    }),
                    Error: Option("string")
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsRecords(this, other);
        }
    }]);

    return LocationTracker;
}();
setType("Fable_domainModel.LocationTracker", LocationTracker);
//# sourceMappingURL=fable_domainModel.js.map