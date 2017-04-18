var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { toString, defaultArg, compareRecords, equalsRecords } from "fable-core/Util";
import { item, map, iterate, mapIndexed } from "fable-core/Seq";
import { TrackingPoint, Track, ElevationPoint } from "./fable_domainModel";
import { postRecord, fetch as _fetch } from "fable-powerpack/Fetch";
import { map as map_1, concat } from "fable-core/List";
import { parse } from "fable-core/Date";
import { PromiseImpl } from "fable-powerpack/Promise";
import * as gpx_parse_browser_js from "../node_modules/gpx-parse/dist/gpx-parse-browser.js";
import * as parse_latest_js from "../parse-latest.js";
export var GoogleMapPoint = function () {
    function GoogleMapPoint(latitude, longitude) {
        _classCallCheck(this, GoogleMapPoint);

        this.Latitude = latitude;
        this.Longitude = longitude;
    }

    _createClass(GoogleMapPoint, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Backend.GoogleMapPoint",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    Latitude: "number",
                    Longitude: "number"
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

    return GoogleMapPoint;
}();
setType("Backend.GoogleMapPoint", GoogleMapPoint);
export function loadElevationData(points, dispatch) {
    var googleMapPoints = points.map(function (p) {
        var point = new google.maps.LatLng(p.latitude, p.longitude);
        return point;
    });
    new google.maps.ElevationService().getElevationAlongPath({
        path: googleMapPoints,
        samples: 256
    }, function (elevations, message) {
        if (message === "OK") {
            var elevationPoints = Array.from(mapIndexed(function (index, ep) {
                return new ElevationPoint(index, ep.elevation);
            }, elevations));

            (function (arg00) {
                dispatch(arg00);
            })({
                type: "ReceivedElevationPoints",
                Item: elevationPoints
            });
        } else {
            (function (arg00) {
                dispatch(arg00);
            })({
                type: "ReceivedElevationPoints",
                Item: []
            });

            (function (arg00) {
                dispatch(arg00);
            })({
                type: "ShowError",
                Item: "Cannot load elevation points."
            });
        }
    });
}
export var ms = function () {
    function ms() {
        _classCallCheck(this, ms);
    }

    _createClass(ms, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Backend.ms",
                properties: {}
            };
        }
    }]);

    return ms;
}();
setType("Backend.ms", ms);
export var LoadTrackingPointsDto = function () {
    function LoadTrackingPointsDto(beginDate, endDate) {
        _classCallCheck(this, LoadTrackingPointsDto);

        this.beginDate = beginDate;
        this.endDate = endDate;
    }

    _createClass(LoadTrackingPointsDto, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Backend.LoadTrackingPointsDto",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    beginDate: Date,
                    endDate: Date
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

    return LoadTrackingPointsDto;
}();
setType("Backend.LoadTrackingPointsDto", LoadTrackingPointsDto);

var jsonHeaders = _defineProperty({
    accept: "application/json"
}, "Content-Type", "application/json");

function dispatchShowError(dispatch, time, error) {
    (function (arg00) {
        dispatch(arg00);
    })({
        type: "ShowError",
        Item: error
    });

    iterate(function (t) {
        window.setTimeout(function () {
            (function (arg00) {
                dispatch(arg00);
            })({
                type: "HideError"
            });
        }, t);
    }, defaultArg(time, [], function (x) {
        return [x];
    }));
}

export function getAllTracks(dispatch) {
    return function (builder_) {
        return builder_.Delay(function () {
            (function (arg00) {
                dispatch(arg00);
            })({
                type: "LoadingTracks"
            });

            return _fetch("/api/tracks", {
                headers: jsonHeaders,
                method: "OPTIONS"
            }).then(function (_arg1) {
                if (_arg1.ok) {
                    return _arg1.json().then(function (_arg2) {
                        (function (arg00) {
                            dispatch(arg00);
                        })({
                            type: "ReceivedTracks",
                            Item: Array.from(concat(Array.from(map(function (i) {
                                var ranges = i.ranges;
                                return map_1(function (r) {
                                    return new Track(parse(toString(item(0, r).date)), parse(toString(item(1, r).date)), toString(i.name));
                                }, ranges);
                            }, _arg2))))
                        });

                        return Promise.resolve();
                    });
                } else {
                    dispatchShowError(dispatch, null, "Could not fetch tracks from server!");
                    return Promise.resolve();
                }
            });
        });
    }(PromiseImpl.promise).then(function () {});
}
export function loadTrackingPoints(start, end, trackName, dispatch) {
    return function (builder_) {
        return builder_.Delay(function () {
            return postRecord("/api/tracks/" + trackName, new LoadTrackingPointsDto(start, end), {
                headers: jsonHeaders
            }).then(function (_arg1) {
                if (_arg1.ok) {
                    return _arg1.json().then(function (_arg2) {
                        var trackingPoints = Array.from(map(function (t) {
                            var latitude = t.latitude;
                            var longitude = t.longitude;
                            var timestamputc = parse(toString(t.timestamputc.date));
                            var speed = 0;
                            var elevation = 0;
                            var distance = 0;
                            return new TrackingPoint(latitude, longitude, timestamputc, speed, 0, distance, 0, elevation);
                        }, _arg2.trackingpoints));

                        (function (arg00) {
                            dispatch(arg00);
                        })({
                            type: "ReceivedTrack",
                            Item1: trackName,
                            Item2: trackingPoints
                        });

                        loadElevationData(trackingPoints, dispatch);
                        return Promise.resolve();
                    });
                } else {
                    dispatchShowError(dispatch, null, "Could not fetch track from server!");
                    return Promise.resolve();
                }
            });
        });
    }(PromiseImpl.promise).then(function () {});
}
export var GpxWayPoint = function () {
    function GpxWayPoint(lat, lon, time) {
        _classCallCheck(this, GpxWayPoint);

        this.lat = lat;
        this.lon = lon;
        this.time = time;
    }

    _createClass(GpxWayPoint, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Backend.GpxWayPoint",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    lat: "number",
                    lon: "number",
                    time: Date
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

    return GpxWayPoint;
}();
setType("Backend.GpxWayPoint", GpxWayPoint);
export var GpxParse = gpx_parse_browser_js;
export function parseTrackingPointsFromGpx(filenames, dispatch) {
    return function (builder_) {
        return builder_.Delay(function () {
            var file = filenames[0];
            var fileReader = new FileReader();

            fileReader.onload = function (e) {
                GpxParse.parseGpx(toString(e.target.result), function (error, data) {
                    var tracks = data.tracks;
                    var segments = tracks[0].segments;
                    var trackingPoints = segments[0];

                    (function (arg00) {
                        dispatch(arg00);
                    })({
                        type: "ReceivedTrack",
                        Item1: "imported track",
                        Item2: Array.from(mapIndexed(function (i, e_1) {
                            return new TrackingPoint(e_1.lat, e_1.lon, e_1.time, 0, 0, 0, i, 0);
                        }, trackingPoints))
                    });
                });
                return 0;
            };

            fileReader.readAsText(file);
            return Promise.resolve();
        });
    }(PromiseImpl.promise).then(function () {});
}
export function loadLocalStorage(key) {
    return defaultArg(localStorage.getItem(key), null, function ($var19) {
        return function (value) {
            return value;
        }(function (arg00) {
            return JSON.parse(arg00);
        }($var19));
    });
}
export function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
export function loadLocationTracker(key) {
    return loadLocalStorage(key);
}
export function saveLocationTracker(locationTracker) {
    saveToLocalStorage(locationTracker.Visualization.TrackName, locationTracker);
}
export var Parse = parse_latest_js;
export var LocationService = function () {
    _createClass(LocationService, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Backend.LocationService",
                interfaces: ["Fable_domainModel.ILocationQuery"],
                properties: {}
            };
        }
    }]);

    function LocationService(host) {
        _classCallCheck(this, LocationService);

        Parse.initialize("myAppId", "unused");
        Parse.serverURL = host + "/parse";
    }

    _createClass(LocationService, [{
        key: "Subscribe",
        value: function (job, onShowPosition) {
            var parseQuery = new Parse.Query('Posts');
            parseQuery.equalTo("name", job.identifier);
            job.subscription = parseQuery.subscribe();
            job.subscription.on("create", function (position) {
                var name = toString(position.get("name"));
                var latitude = position.get("latitude");
                var longitude = position.get("longitude");
                var timestamp = parse(toString(position.get("timestamputc")));
                onShowPosition(name)(latitude)(longitude)(timestamp);
            });
        }
    }, {
        key: "UnSubscribe",
        value: function (job) {
            if (!(job.subscription == null)) {
                job.subscription.unsubscribe();
            }
        }
    }]);

    return LocationService;
}();
setType("Backend.LocationService", LocationService);
//# sourceMappingURL=fable_backend.js.map