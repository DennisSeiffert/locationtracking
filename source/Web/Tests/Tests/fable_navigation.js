var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { createElement, Component } from "react";
import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Any, toString, extendInfo } from "fable-core/Util";
import { now } from "fable-core/Date";
import { find } from "fable-core/Seq";
import { map } from "fable-core/List";
import List from "fable-core/List";
import { asThunk } from "fable-reduxthunk/Fable.Helpers.ReactRedux.ReduxThunk";
import { loadTrackingPoints, getAllTracks } from "./fable_backend";
import { createConnector, withStateMapper, withDispatchMapper, withProps, buildComponent } from "fable-reactredux/Fable.Helpers.ReactRedux";
import { LocationTracker } from "./fable_domainModel";
export var NavigationView = function (_Component) {
    _inherits(NavigationView, _Component);

    _createClass(NavigationView, [{
        key: _Symbol.reflection,
        value: function () {
            return extendInfo(NavigationView, {
                type: "Fable_navigation.NavigationView",
                interfaces: [],
                properties: {}
            });
        }
    }]);

    function NavigationView(props) {
        _classCallCheck(this, NavigationView);

        var _this = _possibleConstructorReturn(this, (NavigationView.__proto__ || Object.getPrototypeOf(NavigationView)).call(this, props));

        this.state = {
            trackingIdentifier: "",
            SelectedTrack: "",
            beginDateTimeLocal: now(),
            endDateTimeLocal: now(),
            VisualizeRecordedTracks: "Visualize Recorded Tracks"
        };
        return _this;
    }

    _createClass(NavigationView, [{
        key: "componentDidMount",
        value: function (_arg1) {
            this.props.onLoadTracks(null);
        }
    }, {
        key: "onBeginTracking",
        value: function (_arg2) {
            this.props.onBeginTracking(this.state.trackingIdentifier);
        }
    }, {
        key: "onStopTracking",
        value: function (_arg3) {
            this.props.onStopTracking(this.state.trackingIdentifier);
        }
    }, {
        key: "onBeginDateTimeLocalChanged",
        value: function (e) {
            this.setState({
                trackingIdentifier: this.state.trackingIdentifier,
                SelectedTrack: this.state.SelectedTrack,
                beginDateTimeLocal: e.target.value,
                endDateTimeLocal: this.state.endDateTimeLocal,
                VisualizeRecordedTracks: this.state.VisualizeRecordedTracks
            });
        }
    }, {
        key: "onEndDateTimeLocalChanged",
        value: function (e) {
            this.setState({
                trackingIdentifier: this.state.trackingIdentifier,
                SelectedTrack: this.state.SelectedTrack,
                beginDateTimeLocal: this.state.beginDateTimeLocal,
                endDateTimeLocal: e.target.value,
                VisualizeRecordedTracks: this.state.VisualizeRecordedTracks
            });
        }
    }, {
        key: "onTrackSelected",
        value: function (e) {
            var selectedTrackName = e.target.value;
            var selectedTrack = find(function (i) {
                return i.name === selectedTrackName;
            }, this.props.Tracks);
            this.setState({
                trackingIdentifier: this.state.trackingIdentifier,
                SelectedTrack: selectedTrack.name,
                beginDateTimeLocal: selectedTrack.mintimestamp,
                endDateTimeLocal: selectedTrack.maxtimestamp,
                VisualizeRecordedTracks: this.state.VisualizeRecordedTracks
            });
            e.preventDefault();
        }
    }, {
        key: "onLoadTrackingPoints",
        value: function (_arg4) {
            this.props.onLoadTrackingPoints([this.state.beginDateTimeLocal, this.state.endDateTimeLocal, this.state.SelectedTrack]);
        }
    }, {
        key: "onClearTrackingPoints",
        value: function (_arg5) {
            this.props.onClearTrackingPoints(null);
        }
    }, {
        key: "getTrackSelection",
        value: function () {
            var _this2 = this;

            return createElement.apply(undefined, ["select", {
                id: "trackSelection",
                value: this.state.SelectedTrack,
                onChange: function onChange(arg00) {
                    _this2.onTrackSelected(arg00);
                }
            }].concat(_toConsumableArray(map(function (t) {
                return createElement("option", {
                    value: t.name
                }, t.name);
            }, this.props.Tracks))));
        }
    }, {
        key: "render",
        value: function () {
            var _createElement,
                _this3 = this,
                _createElement3;

            return createElement("div", {
                className: "masthead clearfix"
            }, createElement("div", {
                className: "inner"
            }, createElement("nav", {
                className: "navbar navbar-default"
            }, createElement("div", {
                className: "container-fluid"
            }, createElement("div", {
                className: "navbar-header"
            }, createElement("button", (_createElement = {
                type: "button",
                className: "navbar-toggle collapsed"
            }, _defineProperty(_createElement, "data-toggle", "collapse"), _defineProperty(_createElement, "data-target", "#bs-example-navbar-collapse-1"), _createElement), createElement("span", {
                className: "sr-only"
            }), createElement("span", {
                className: "icon-bar"
            }), createElement("span", {
                className: "icon-bar"
            }), createElement("span", {
                className: "icon-bar"
            }))), createElement("div", {
                id: "bs-example-navbar-collapse-1",
                className: "collapse navbar-collapse"
            }, createElement("ul", {
                className: "nav navbar-nav"
            }, createElement("li", {}, createElement("form", {
                className: "form-horizontal",
                style: {
                    marginLeft: "15px",
                    marginRight: "15px"
                }
            }, createElement("div", {
                className: "form-group"
            }, createElement("button", {
                onClick: function onClick(arg00) {
                    _this3.onBeginTracking(arg00);
                },
                className: "btn btn-default btn-succes active"
            }, "Track..."), createElement("button", {
                onClick: function onClick(arg00) {
                    _this3.onStopTracking(arg00);
                },
                className: "btn btn-default btn-danger"
            }, "Stop Tracking")), createElement("div", {
                className: "form-group"
            }, createElement("label", {
                className: "col-md-4  col-sm-4 col-xs-4 control-label"
            }, "Tracking Id"), createElement("div", _defineProperty({
                className: "col-md-8  col-sm-8 col-xs-11"
            }, "aria-label", "..."), createElement("input", {
                type: "text",
                id: "trackIdentifier",
                value: this.state.trackingIdentifier
            }))))), createElement("li", {
                role: "presentation",
                className: "dropdown"
            }, createElement("a", (_createElement3 = {
                className: "dropdown-toggle"
            }, _defineProperty(_createElement3, "data-toggle", "dropdown"), _defineProperty(_createElement3, "href", "#"), _defineProperty(_createElement3, "role", "button"), _defineProperty(_createElement3, "aria-haspopup", "true"), _defineProperty(_createElement3, "aria-expanded", "false"), _createElement3), this.state.VisualizeRecordedTracks, createElement("span", {
                className: "caret"
            })), createElement("ul", {
                className: "dropdown-menu"
            }, createElement("li", {}, createElement("div", {
                className: "container-fluid"
            }, createElement("div", {
                className: "row"
            }, createElement("label", {}, "from"), createElement("input", {
                type: "datetime-local",
                value: toString(this.state.beginDateTimeLocal),
                onChange: function onChange(arg00) {
                    _this3.onBeginDateTimeLocalChanged(arg00);
                }
            })), createElement("div", {
                className: "row"
            }, createElement("label", {}, "until"), createElement("input", {
                type: "datetime-local",
                value: toString(this.state.endDateTimeLocal),
                onChange: function onChange(arg00) {
                    _this3.onEndDateTimeLocalChanged(arg00);
                }
            })), createElement("div", {
                className: "row"
            }, this.getTrackSelection()), createElement("div", {
                className: "row"
            }, createElement("button", {
                onClick: function onClick(arg00) {
                    _this3.onLoadTrackingPoints(arg00);
                }
            }, "Load Track Points"), createElement("button", {
                onClick: function onClick(arg00) {
                    _this3.onClearTrackingPoints(arg00);
                }
            }, "Clear"))))))))))));
        }
    }]);

    return NavigationView;
}(Component);
setType("Fable_navigation.NavigationView", NavigationView);

function mapStateToProps(state, ownprops) {
    return {
        onLoadTracks: ownprops.onLoadTracks,
        onBeginTracking: ownprops.onBeginTracking,
        onStopTracking: ownprops.onStopTracking,
        onLoadTrackingPoints: ownprops.onLoadTrackingPoints,
        onClearTrackingPoints: ownprops.onClearTrackingPoints,
        Tracks: state.Tracks
    };
}

function mapDispatchToProps(dispatch, ownprops) {
    var onLoadTracks = function onLoadTracks() {
        dispatch(asThunk(function (dispatch_1) {
            return getAllTracks(dispatch_1);
        }));
    };

    var onLoadTrackingPoints = function onLoadTrackingPoints(tupledArg) {
        dispatch(asThunk(function () {
            var tupledArg_1 = [tupledArg[0], tupledArg[1], tupledArg[2]];
            return function (dispatch_1) {
                return loadTrackingPoints(tupledArg_1[0], tupledArg_1[1], tupledArg_1[2], dispatch_1);
            };
        }()));
    };

    var onClearTrackingPoints = function onClearTrackingPoints() {
        (function (arg00) {
            dispatch(arg00);
        })({
            type: "ClearTrackingPoints"
        });
    };

    return {
        onLoadTracks: onLoadTracks,
        onBeginTracking: ownprops.onBeginTracking,
        onStopTracking: ownprops.onStopTracking,
        onLoadTrackingPoints: onLoadTrackingPoints,
        onClearTrackingPoints: onClearTrackingPoints,
        Tracks: ownprops.Tracks
    };
}

function setDefaultProps(ownprops) {
    var Tracks = new List();
    return {
        onLoadTracks: ownprops.onLoadTracks,
        onBeginTracking: ownprops.onBeginTracking,
        onStopTracking: ownprops.onStopTracking,
        onLoadTrackingPoints: ownprops.onLoadTrackingPoints,
        onClearTrackingPoints: ownprops.onClearTrackingPoints,
        Tracks: Tracks
    };
}

export var createNavigationViewComponent = buildComponent(function (c) {
    return withProps(function (ownprops) {
        return setDefaultProps(ownprops);
    }, c);
}(function (c) {
    return withDispatchMapper(function (dispatch) {
        return function (ownprops) {
            return mapDispatchToProps(dispatch, ownprops);
        };
    }, c);
}(function (c) {
    return withStateMapper(function (state) {
        return function (ownprops) {
            return mapStateToProps(state, ownprops);
        };
    }, c);
}(createConnector()))), {
    TComponent: NavigationView,
    TProps: Any,
    TCtx: Any,
    TState: LocationTracker
});
//# sourceMappingURL=fable_navigation.js.map