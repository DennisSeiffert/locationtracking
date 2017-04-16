import { createElement } from "react";
import { createNavigationViewComponent } from "./fable_navigation";
import { createMapViewComponent } from "./fable_map";
import { createElevationViewComponent } from "./fable_elevation";
import { ElevationPoint, Track, TrackingPoint, TrackingService, LocationTracker, TrackVisualization } from "./fable_domainModel";
import { ofArray } from "fable-core/List";
import List from "fable-core/List";
import { LocationService, saveLocationTracker } from "./fable_backend";
import { addDays, now } from "fable-core/Date";
import * as redux from "redux";
import * as redux_thunk from "redux-thunk";
import { createStore } from "fable-redux/Fable.Helpers.Redux";
import { createProvider } from "fable-reactredux/Fable.Helpers.ReactRedux";
import { Interface } from "fable-core/Util";
import { render } from "react-dom";
export function createApp(initialState) {
    return createElement("div", {
        className: "site-wrapper"
    }, createElement("div", {
        className: "site-wrapper-inner"
    }, createElement("div", {
        className: "cover-container"
    }, createNavigationViewComponent(null), createMapViewComponent(null), createElevationViewComponent(null))));
}
export function reducer(domainModel, _arg1) {
    if (_arg1.type === "StopTracking") {
        return domainModel;
    } else if (_arg1.type === "Observe") {
        domainModel.TrackingService.AddTrackingJob(function (arg00) {
            return function (arg10) {
                return function (arg20) {
                    return domainModel.TrackingService.CreateTrackingJob(arg00, arg10, arg20);
                };
            };
        }(_arg1.Item)(0)(0));
        return domainModel;
    } else if (_arg1.type === "LoadTrackingPoints") {
        var Visualization = new TrackVisualization(_arg1.Item3, new List());
        return new LocationTracker(domainModel.TrackingService, Visualization, domainModel.Tracks, domainModel.Error);
    } else if (_arg1.type === "ClearTrackingPoints") {
        var _Visualization = new TrackVisualization("", new List());

        return new LocationTracker(domainModel.TrackingService, _Visualization, domainModel.Tracks, domainModel.Error);
    } else if (_arg1.type === "ReceivedTrack") {
        var aggregatedPoints = TrackVisualization.calculate(ofArray(_arg1.Item2));

        var _Visualization2 = new TrackVisualization(_arg1.Item1, aggregatedPoints);

        return new LocationTracker(domainModel.TrackingService, _Visualization2, domainModel.Tracks, domainModel.Error);
    } else if (_arg1.type === "LoadingTracks") {
        return domainModel;
    } else if (_arg1.type === "ReceivedTracks") {
        var Tracks = ofArray(_arg1.Item);
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, Tracks, domainModel.Error);
    } else if (_arg1.type === "ShowElevationMarker") {
        return domainModel;
    } else if (_arg1.type === "ReceivedElevationPoints") {
        domainModel.Visualization.AssignElevationPoints(_arg1.Item);
        return domainModel;
    } else if (_arg1.type === "ShowError") {
        var _Error = _arg1.Item;
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, domainModel.Tracks, _Error);
    } else if (_arg1.type === "HideError") {
        var _Error2 = null;
        return new LocationTracker(domainModel.TrackingService, domainModel.Visualization, domainModel.Tracks, _Error2);
    } else {
        return domainModel;
    }
}
export function reducerWithLocalStorage(domainModel, command) {
    var dm = reducer(domainModel, command);
    saveLocationTracker(dm);
    return dm;
}
export function start() {
    var initialStoreState = new LocationTracker(new TrackingService(new LocationService()), new TrackVisualization("", TrackVisualization.calculate(ofArray([new TrackingPoint(8.9, 5.9, now(), 34.9, 0, 32300.9, 0, 320.3), new TrackingPoint(9.9, 5.9, now(), 34.9, 0, 32300.9, 1, 32.3)]))), ofArray([new Track(now(), function () {
        var copyOfStruct = now();
        return addDays(copyOfStruct, 1);
    }(), "first Track"), new Track(now(), function () {
        var copyOfStruct = now();
        return addDays(copyOfStruct, 2);
    }(), "second Track")]), null);
    initialStoreState.Visualization.AssignElevationPoints([new ElevationPoint(0, 0)]);
    var middleware = redux.applyMiddleware(redux_thunk.default);
    var store = createStore(function (domainModel) {
        return function (command) {
            return reducerWithLocalStorage(domainModel, command);
        };
    }, initialStoreState, middleware);
    var provider = createProvider(store, createElement(function (initialState) {
        return createApp(initialState);
    }, {}), {
        TStore: Interface("Fable.Import.Redux.IStore")
    });
    render(provider, document.getElementsByClassName("main")[0]);
}
start();
//# sourceMappingURL=fable_main.js.map