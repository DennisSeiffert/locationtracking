var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Option, makeGeneric, compareRecords, equalsRecords } from "fable-core/Util";
import { where, ofArray, append } from "fable-core/List";
import List from "fable-core/List";
import { utcNow } from "fable-core/Date";
import { exists } from "fable-core/Seq";
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
    function TrackingPoint(latitude, longitude, timestamputc) {
        _classCallCheck(this, TrackingPoint);

        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamputc = timestamputc;
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
                    timestamputc: Date
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
        key: "TrackName",
        get: function () {
            return this.name;
        }
    }, {
        key: "Points",
        get: function () {
            return this.points;
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
                    Tracks: makeGeneric(List, {
                        T: Track
                    }),
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
        this["Tracks@"] = new List();
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
    }, {
        key: "Tracks",
        get: function () {
            return this["Tracks@"];
        },
        set: function (v) {
            this["Tracks@"] = v;
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