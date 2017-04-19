var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { createElement } from "react";
import { createToastNotifications } from "./fable_toastNotifications";
import { createNavigationViewComponent } from "./fable_navigation";
import { createMapViewComponent } from "./fable_map";
import { createElevationViewComponent } from "./fable_elevation";
import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Interface, toString, compareRecords, equalsRecords } from "fable-core/Util";
import { ElevationPoint, Track, TrackingPoint, TrackingService, TrackVisualization, LocationTracker } from "./fable_domainModel";
import { ofArray } from "fable-core/List";
import List from "fable-core/List";
import { LocationService, saveLocationTracker } from "./fable_backend";
import { addDays, now, utcNow } from "fable-core/Date";
import * as redux from "redux";
import * as redux_thunk from "redux-thunk";
import { createStore } from "fable-redux/Fable.Helpers.Redux";
import { createProvider } from "fable-reactredux/Fable.Helpers.ReactRedux";
import { render } from "react-dom";
export function createApp(initialState) {
    return createElement("div", {
        className: "site-wrapper"
    }, createToastNotifications(null), createElement("div", {
        className: "site-wrapper-inner"
    }, createElement("div", {
        className: "cover-container"
    }, createNavigationViewComponent(null), createMapViewComponent(null), createElevationViewComponent(null))));
}
export var swOptions = function () {
    function swOptions(scope) {
        _classCallCheck(this, swOptions);

        this.scope = scope;
    }

    _createClass(swOptions, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_main.swOptions",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    scope: "string"
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

    return swOptions;
}();
setType("Fable_main.swOptions", swOptions);
export var swMessage = function () {
    function swMessage(command, message) {
        _classCallCheck(this, swMessage);

        this.command = command;
        this.message = message;
    }

    _createClass(swMessage, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_main.swMessage",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    command: "string",
                    message: "string"
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

    return swMessage;
}();
setType("Fable_main.swMessage", swMessage);
export function subscribe(identifier) {
    console.log("Requesting broadcast");

    if (!(navigator.serviceWorker.controller == null)) {
        console.log("Sending message to service worker");
        navigator.serviceWorker.controller.postMessage(new swMessage("subscribe", identifier));
    } else {
        console.log("Nove ServiceWorker");
    }
}
export function reducer(domainModel, _arg1) {
    if (_arg1.type === "StopTracking") {
        return domainModel;
    } else if (_arg1.type === "Unobserve") {
        domainModel.TrackingService.ReleaseTrack(_arg1.Item);
        var Info = "unsubscribed from position updates";
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, domainModel.Tracks, domainModel.Error, Info);
    } else if (_arg1.type === "Observe") {
        domainModel.TrackingService.Track(_arg1.Item);
        var _Info = "subscribed to position updates";
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, domainModel.Tracks, domainModel.Error, _Info);
    } else if (_arg1.type === "ObservationPositionUpdated") {
        (function (arg00) {
            return function (arg10) {
                return function (arg20) {
                    return function (arg30) {
                        domainModel.TrackingService.UpdateCoordinates(arg00, arg10, arg20, arg30);
                    };
                };
            };
        })(_arg1.Item1)(_arg1.Item2)(_arg1.Item3)(_arg1.Item4);
        return domainModel;
    } else if (_arg1.type === "LoadTrackingPoints") {
        var Visualization = new TrackVisualization(_arg1.Item3, new List());
        return new LocationTracker(domainModel.TrackingService, Visualization, domainModel.Tracks, domainModel.Error, domainModel.Info);
    } else if (_arg1.type === "ClearTrackingPoints") {
        var _Visualization = new TrackVisualization("", new List());

        return new LocationTracker(domainModel.TrackingService, _Visualization, domainModel.Tracks, domainModel.Error, domainModel.Info);
    } else if (_arg1.type === "ReceivedTrack") {
        var aggregatedPoints = TrackVisualization.calculate(ofArray(_arg1.Item2));

        var _Visualization2 = new TrackVisualization(_arg1.Item1, aggregatedPoints);

        return new LocationTracker(domainModel.TrackingService, _Visualization2, domainModel.Tracks, domainModel.Error, domainModel.Info);
    } else if (_arg1.type === "LoadingTracks") {
        return domainModel;
    } else if (_arg1.type === "ReceivedTracks") {
        var Tracks = ofArray(_arg1.Item);
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, Tracks, domainModel.Error, domainModel.Info);
    } else if (_arg1.type === "ShowElevationMarker") {
        return domainModel;
    } else if (_arg1.type === "ReceivedElevationPoints") {
        domainModel.Visualization.AssignElevationPoints(_arg1.Item);
        return domainModel;
    } else if (_arg1.type === "ShowError") {
        var _Error = _arg1.Item;
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, domainModel.Tracks, _Error, domainModel.Info);
    } else if (_arg1.type === "ShowInfo") {
        var _Info2 = _arg1.Item;
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, domainModel.Tracks, domainModel.Error, _Info2);
    } else if (_arg1.type === "HideError") {
        var _Error2 = null;
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, domainModel.Tracks, _Error2, domainModel.Info);
    } else {
        return domainModel;
    }
}
export function reducerWithLocalStorage(domainModel, command) {
    var dm = reducer(domainModel, command);

    try {
        saveLocationTracker(dm);
        return dm;
    } catch (matchValue) {
        var _Error = "error saving location data";
        return new LocationTracker(dm.TrackingService, dm.Visualization, dm.Tracks, _Error, dm.Info);
    }
}
export function registerObervationProviderServiceWorker() {
    if (!(navigator.serviceWorker == null)) {
        console.log("ServiceWorkers supported");
        navigator.serviceWorker.register("observationServiceWorkerPlain.js", new swOptions("./")).then(function (reg) {
            var _console;

            (_console = console).log.apply(_console, ["ServiceWorker started"].concat(_toConsumableArray(reg)));
        }).catch(function (error) {
            var _console2;

            (_console2 = console).log.apply(_console2, ["Failed to register ServiceWorker"].concat(_toConsumableArray(error)));
        });
    }
}
export function registerBroadcastReceiver(dispatch) {
    navigator.serviceWorker.onmessage = function (event) {
        console.log("Broadcasted SW : ", event.data);
        var data = event.data;

        if (toString(data.command) === "broadcastOnRequest") {
            dispatch({
                type: "ObservationPositionUpdated",
                Item1: "subscribed to position updates",
                Item2: 0,
                Item3: 0,
                Item4: utcNow()
            });
            console.log("Broadcasted message from the ServiceWorker : ", data.message);
        }
    };
}
export var store = null;
export function onPositionChanged(identifier, latitude, longitude, timestamputc) {
    store.dispatch({
        type: "ObservationPositionUpdated",
        Item1: identifier,
        Item2: latitude,
        Item3: longitude,
        Item4: timestamputc
    });
}
export function start() {
    var initialStoreState = null;

    var storeState = function () {
        var matchValue = initialStoreState;

        if (matchValue == null) {
            return new LocationTracker(new TrackingService(new LocationService(window.location.origin), function (identifier) {
                return function (latitude) {
                    return function (longitude) {
                        return function (timestamputc) {
                            onPositionChanged(identifier, latitude, longitude, timestamputc);
                        };
                    };
                };
            }), new TrackVisualization("", TrackVisualization.calculate(ofArray([new TrackingPoint(8.9, 5.9, now(), 34.9, 0, 32300.9, 0, 320.3), new TrackingPoint(9.9, 5.9, now(), 34.9, 0, 32300.9, 1, 32.3)]))), ofArray([new Track(now(), function () {
                var copyOfStruct = now();
                return addDays(copyOfStruct, 1);
            }(), "first Track"), new Track(now(), function () {
                var copyOfStruct = now();
                return addDays(copyOfStruct, 2);
            }(), "second Track")]), null, null);
        } else {
            return new LocationTracker(new TrackingService(new LocationService(window.location.origin), function (identifier) {
                return function (latitude) {
                    return function (longitude) {
                        return function (timestamputc) {
                            onPositionChanged(identifier, latitude, longitude, timestamputc);
                        };
                    };
                };
            }), new TrackVisualization(matchValue.Visualization.TrackName, matchValue.Visualization.Points), matchValue.Tracks, matchValue.Error, matchValue.Info);
        }
    }();

    storeState.Visualization.AssignElevationPoints([new ElevationPoint(0, 0)]);
    var middleware = redux.applyMiddleware(redux_thunk.default);
    store = createStore(function (domainModel) {
        return function (command) {
            return reducerWithLocalStorage(domainModel, command);
        };
    }, storeState, middleware);
    var provider = createProvider(store, createElement(function (initialState) {
        return createApp(initialState);
    }, {}), {
        TStore: Interface("Fable.Import.Redux.IStore")
    });
    render(provider, document.getElementsByClassName("main")[0]);
}
start();
//# sourceMappingURL=fable_main.js.map