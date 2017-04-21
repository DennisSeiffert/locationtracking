var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Any, toString, equals, Interface, extendInfo, compareRecords, equalsRecords } from "fable-core/Util";
import { createElement, Component } from "react";
import { reverse, map as map_1 } from "fable-core/List";
import List from "fable-core/List";
import { item, tryFind } from "fable-core/Seq";
import { format } from "fable-core/String";
import { LocationTracker, TrackingPoint } from "./fable_domainModel";
import { now } from "fable-core/Date";
import { createConnector, withStateMapper, withProps, buildComponent } from "fable-reactredux/Fable.Helpers.ReactRedux";
export var GeoOptions = function () {
    function GeoOptions(enableHighAccuracy, maximumAge, timeout) {
        _classCallCheck(this, GeoOptions);

        this.enableHighAccuracy = enableHighAccuracy;
        this.maximumAge = maximumAge;
        this.timeout = timeout;
    }

    _createClass(GeoOptions, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_map.GeoOptions",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    enableHighAccuracy: "boolean",
                    maximumAge: "number",
                    timeout: "number"
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

    return GeoOptions;
}();
setType("Fable_map.GeoOptions", GeoOptions);
export var defaultGeoOptions = new GeoOptions(true, 60000, 20000);
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
                type: "Fable_map.GoogleMapPoint",
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
setType("Fable_map.GoogleMapPoint", GoogleMapPoint);
export var MapView = function (_Component) {
    _inherits(MapView, _Component);

    _createClass(MapView, [{
        key: _Symbol.reflection,
        value: function () {
            return extendInfo(MapView, {
                type: "Fable_map.MapView",
                interfaces: [],
                properties: {
                    mapHolder: Interface("Fable.Import.React.ReactElement")
                }
            });
        }
    }]);

    function MapView(props) {
        _classCallCheck(this, MapView);

        var _this = _possibleConstructorReturn(this, (MapView.__proto__ || Object.getPrototypeOf(MapView)).call(this, props));

        this.state = {
            map: null,
            polyLineOfTrack: null,
            needsAnUpdate: true,
            markers: new List(),
            trackMarker: null
        };
        _this["mapHolder@"] = createElement("div", {
            className: "jumbotron",
            style: {
                paddingTop: "0px",
                paddingBottom: "0px",
                height: "400px"
            }
        });
        return _this;
    }

    _createClass(MapView, [{
        key: "componentDidMount",
        value: function (_arg1) {
            this.Initialize();
        }
    }, {
        key: "componentDidUpdate",
        value: function (prevState, actualState) {
            var matchValue = this.state.map;

            if (matchValue != null) {
                this.showTrack();
            } else {}
        }
    }, {
        key: "componentWillReceiveProps",
        value: function (nextProps) {
            var _this2 = this;

            if (!equals(this.state.map, null)) {
                var markers = map_1(function (i) {
                    var matchValue = tryFind(function (e) {
                        return toString(e.title) === i.identifier;
                    }, _this2.state.markers);

                    if (matchValue == null) {
                        return new google.maps.Marker({
                            position: new google.maps.LatLng(i.latitude, i.longitude),
                            map: _this2.state.map,
                            title: i.identifier
                        });
                    } else {
                        matchValue.setPosition(new google.maps.LatLng(i.latitude, i.longitude));
                        return matchValue;
                    }
                }, nextProps.ObservedTrackingJobs);

                if (function () {
                    return nextProps.trackMarkerPosition != null;
                }(null)) {
                    this.state.trackMarker.setPosition(new google.maps.LatLng(nextProps.trackMarkerPosition.latitude, nextProps.trackMarkerPosition.longitude));
                    this.state.trackMarker.title = format("{0} \xFC. N.N   {1} km/h ", nextProps.trackMarkerPosition.elevation, nextProps.trackMarkerPosition.speed * 3.6);
                }

                this.setState(function () {
                    var inputRecord = _this2.state;
                    var needsAnUpdate = true;
                    return {
                        map: inputRecord.map,
                        polyLineOfTrack: inputRecord.polyLineOfTrack,
                        needsAnUpdate: needsAnUpdate,
                        markers: markers,
                        trackMarker: inputRecord.trackMarker
                    };
                }());
            }
        }
    }, {
        key: "showMarkers",
        value: function () {
            if (this.state.needsAnUpdate ? !(this.state.markers.tail == null) : false) {
                var firstmarker = item(0, this.state.markers);
                this.state.map.panTo(firstmarker.position);
            }
        }
    }, {
        key: "showTrack",
        value: function () {
            var _this3 = this;

            if (this.state.needsAnUpdate ? !(this.props.Track.tail == null) : false) {
                (function () {
                    if (!equals(_this3.state.polyLineOfTrack, null)) {
                        _this3.state.polyLineOfTrack.setMap(null);
                    }

                    var bounds = new google.maps.LatLngBounds();
                    var googleMapPoints = map_1(function (p) {
                        var point = new google.maps.LatLng(p.latitude, p.longitude);
                        bounds.extend(point);
                        return point;
                    }, reverse(_this3.props.Track));
                    var polyLine = new google.maps.Polyline({
                        path: Array.from(googleMapPoints),
                        strokeColor: "#FF00AA",
                        strokeOpacity: .7,
                        strokeWeight: 4
                    });
                    polyLine.setMap(_this3.state.map);

                    _this3.state.map.fitBounds(bounds);

                    _this3.setState(function () {
                        var inputRecord = _this3.state;
                        var polyLineOfTrack = polyLine;
                        var needsAnUpdate = false;
                        return {
                            map: inputRecord.map,
                            polyLineOfTrack: polyLineOfTrack,
                            needsAnUpdate: needsAnUpdate,
                            markers: inputRecord.markers,
                            trackMarker: inputRecord.trackMarker
                        };
                    }());
                })();
            }
        }
    }, {
        key: "Initialize",
        value: function () {
            var initialLatLng = new google.maps.LatLng(0, 0);
            var options = {
                center: initialLatLng,
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                mapTypeControl: true,
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.SMALL
                }
            };
            var map = new google.maps.Map(document.getElementsByClassName("jumbotron")[0], options);
            var trackMarker = new google.maps.Marker({
                position: new google.maps.LatLng(0, 0),
                map: map,
                title: "track marker"
            });
            this.setState({
                map: map,
                polyLineOfTrack: null,
                needsAnUpdate: true,
                markers: new List(),
                trackMarker: trackMarker
            });
        }
    }, {
        key: "render",
        value: function () {
            return this.mapHolder;
        }
    }, {
        key: "mapHolder",
        get: function () {
            return this["mapHolder@"];
        }
    }]);

    return MapView;
}(Component);
setType("Fable_map.MapView", MapView);

function mapStateToProps(state, ownprops) {
    return {
        Track: state.Visualization.Points,
        ObservedTrackingJobs: state.TrackingService.observedTrackingJobs,
        trackMarkerPosition: state.Visualization.LastKnownPosition
    };
}

function setDefaultProps(ownprops) {
    return {
        Track: new List(),
        ObservedTrackingJobs: new List(),
        trackMarkerPosition: new TrackingPoint(9.9, 5.9, now(), 34.9, 0, 32300.9, 1, 32.3)
    };
}

export var createMapViewComponent = buildComponent(function (c) {
    return withProps(function (ownprops) {
        return setDefaultProps(ownprops);
    }, c);
}(function (c) {
    return withStateMapper(function (state) {
        return function (ownprops) {
            return mapStateToProps(state, ownprops);
        };
    }, c);
}(createConnector())), {
    TComponent: MapView,
    TProps: Any,
    TCtx: Any,
    TState: LocationTracker
});
//# sourceMappingURL=fable_map.js.map