import { createElement } from "react";
import { createNavigationViewComponent } from "./fable_navigation";
import { createElevationViewComponent } from "./fable_elevation";
import { Track, TrackingPoint, TrackingService, LocationTracker, TrackVisualization } from "./fable_domainModel";
import { ofArray } from "fable-core/List";
import List from "fable-core/List";
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
    }, createNavigationViewComponent(null), createElevationViewComponent(null))));
}
export function reducer(state, _arg1) {
    if (_arg1.type === "StopTracking") {
        return state;
    } else if (_arg1.type === "LoadTrackingPoints") {
        return state;
    } else if (_arg1.type === "ClearTrackingPoints") {
        var Visualization = new TrackVisualization("", new List());
        return new LocationTracker(state.TrackingService, Visualization, state.Tracks, state.Error);
    } else if (_arg1.type === "ReceivedTrack") {
        var _Visualization = new TrackVisualization("", ofArray(_arg1.Item));

        return new LocationTracker(state.TrackingService, _Visualization, state.Tracks, state.Error);
    } else if (_arg1.type === "LoadingTracks") {
        return state;
    } else if (_arg1.type === "ReceivedTracks") {
        var Tracks = ofArray(_arg1.Item);
        return new LocationTracker(state.TrackingService, state.Visualization, Tracks, state.Error);
    } else if (_arg1.type === "ShowError") {
        var _Error = _arg1.Item;
        return new LocationTracker(state.TrackingService, state.Visualization, state.Tracks, _Error);
    } else if (_arg1.type === "HideError") {
        var _Error2 = null;
        return new LocationTracker(state.TrackingService, state.Visualization, state.Tracks, _Error2);
    } else {
        return state;
    }
}
export function start() {
    var initialStoreState = new LocationTracker(new TrackingService(), new TrackVisualization("", TrackVisualization.calculate(ofArray([new TrackingPoint(8.9, 5.9, now(), 34.9, 0, 32300.9, 0, 320.3), new TrackingPoint(9.9, 5.9, now(), 34.9, 0, 32300.9, 1, 32.3)]))), ofArray([new Track(now(), function () {
        var copyOfStruct = now();
        return addDays(copyOfStruct, 1);
    }(), "first Track"), new Track(now(), function () {
        var copyOfStruct = now();
        return addDays(copyOfStruct, 2);
    }(), "second Track")]), null);
    var middleware = redux.applyMiddleware(redux_thunk.default);
    var store = createStore(function (state) {
        return function (_arg1) {
            return reducer(state, _arg1);
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