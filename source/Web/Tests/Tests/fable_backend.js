var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { toString, defaultArg, compareRecords, equalsRecords } from "fable-core/Util";
import { map, iterate } from "fable-core/Seq";
import { postRecord, fetch as _fetch } from "fable-powerpack/Fetch";
import { TrackingPoint, Track } from "./fable_domainModel";
import { parse } from "fable-core/Date";
import { PromiseImpl } from "fable-powerpack/Promise";
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
                            Item: Array.from(map(function (i) {
                                return new Track(parse(toString(i.mintimestamputc.date)), parse(toString(i.maxtimestamputc.date)), toString(i.name));
                            }, _arg2))
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
                            Item: trackingPoints
                        });

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
//# sourceMappingURL=fable_backend.js.map