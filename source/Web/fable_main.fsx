#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"
#r "node_modules/fable-redux/Fable.Redux.dll"
#r "node_modules/fable-reactredux/Fable.ReactRedux.dll"
#r "node_modules/fable-reduxthunk/Fable.ReduxThunk.dll"
#load "node_modules/fable-import-fetch/Fable.Import.Fetch.fs"
#load "node_modules/fable-import-fetch/Fable.Helpers.Fetch.fs"
#load "fable_domainModel.fsx"
open Fable_domainModel
#load "fable_Commands.fsx"
open Commands
#load "fable_navigation.fsx"
open Fable_navigation
#load "fable_map.fsx"
open Fable_map
#load "fable_elevation.fsx"
open Fable_elevation
#load "fable_toastNotifications.fsx"
open Fable_toastNotifications
#load "fable_observationServiceWorker.fsx"
open Fable_observationServiceWorker
// #load "fable_domainModelTests.fsx"
// open Fable_domainModelTests


open Fable.Core
open Fable.Import
open System
open Fable.Core.JsInterop
open Fable.Import.Fetch
open Fable.Helpers.Fetch
open Fable.Helpers.Redux
open Fable.Helpers.ReactRedux

module R = Fable.Helpers.React
open R.Props
// domain models


let createApp initialState =         
        R.div [ ClassName "site-wrapper"] [ 
            createToastNotifications()
            R.div [ ClassName "site-wrapper-inner"] [ 
                R.div [ ClassName "cover-container"] [                     
                    createNavigationViewComponent()
                    createMapViewComponent()
                    createElevationViewComponent()
                ]
            ]            
        ]


type swOptions = {
    scope : string
}

type swMessage = {
    command : string
    message : string
}
let subscribe(identifier) =
    Browser.console.log("Requesting broadcast")    
    if not(isNull(box Browser.navigator?serviceWorker?controller)) then
        Browser.console.log("Sending message to service worker");
        Browser.navigator?serviceWorker?controller?postMessage({
                                                                command = "subscribe"
                                                                message = identifier
                                                            }) |> ignore        
    else
        Browser.console.log("Nove ServiceWorker")
    
    ignore()

let reducer (domainModel: LocationTracker) = function
    | BeginTracking identifer ->
        domainModel
    | StopTracking identifier -> 
        domainModel        
    | Unobserve identifier -> 
        domainModel.TrackingService.ReleaseTrack identifier
        //subscribe(identifier)
        { domainModel with Info = Some "unsubscribed from position updates" }
    | Observe identifier -> 
        domainModel.TrackingService.Track identifier |> ignore        
        { domainModel with Info = Some "subscribed to position updates" }
    | ObservationPositionUpdated(identifier, latitude, longitude, timestamputc) ->
        domainModel.TrackingService.UpdateCoordinates identifier latitude longitude timestamputc
        domainModel       
    | LoadTrackingPoints (beginDate, endDate, selectedTrack) -> 
        { domainModel with Visualization = new TrackVisualization(selectedTrack, List.Empty)}
    | ClearTrackingPoints ->
        { domainModel with Visualization = new TrackVisualization(String.Empty, List.Empty)}
    | ReceivedTrack (trackName, trackingPoints) ->
        let aggregatedPoints = TrackVisualization.calculate (List.ofArray trackingPoints)
        { domainModel with Visualization = new TrackVisualization(trackName, aggregatedPoints)}
    | LoadingTracks ->
        domainModel        
    | ReceivedTracks tracks ->
        { domainModel with Tracks = List.ofArray tracks }
    | ShowElevationMarker point ->        
        domainModel.Visualization.updateTrackMarker point |> ignore
        domainModel
    | ReceivedElevationPoints points ->
        domainModel.Visualization.AssignElevationPoints points
        domainModel
    | ShowError error ->
        { domainModel with Error = Some error }
    | ShowInfo info ->
        { domainModel with Info = Some info }
    | HideError ->
        { domainModel with Error = None } 

let reducerWithLocalStorage (domainModel: LocationTracker) command =
    let dm = reducer domainModel command
    try
        Backend.saveLocationTracker dm
        dm 
    with
    | _ -> {dm with Error = Some "error saving location data"}      

let registerObervationProviderServiceWorker () = 
    if not(isNull(box Browser.navigator?serviceWorker)) then
        Browser.console.log("ServiceWorkers supported")

        Browser.navigator?serviceWorker?register("observationServiceWorkerPlain.js", {
                scope = "./"
            })
            ?``then``(fun reg ->
                Browser.console.log("ServiceWorker started", reg)
            )
            ?catch(fun error ->
                Browser.console.log("Failed to register ServiceWorker", error);
            ) |> ignore

let registerBroadcastReceiver(dispatch) =
    Browser.navigator?serviceWorker?onmessage <- fun(event) ->
        Browser.console.log("Broadcasted SW : ", event?data) |> ignore

        let data = event?data

        if string data?command = "broadcastOnRequest" then
            dispatch(Commands.ObservationPositionUpdated("subscribed to position updates", 0.0, 0.0, DateTime.UtcNow))
            Browser.console.log("Broadcasted message from the ServiceWorker : ", data?message) |> ignore
        ignore() |> ignore

let mutable store : Redux.IStore<LocationTracker, Commands> option = None

let onPositionChanged identifier latitude longitude timestamputc = 
    store.Value.dispatch(Commands.ObservationPositionUpdated(identifier, latitude, longitude, timestamputc))    

let start() = 
    let initialStoreState = None // Backend.loadLocationTracker

    let storeState = match initialStoreState with
                        | Some x -> { x with 
                                        TrackingService= new TrackingService(new Backend.LocationService(Browser.window.location.origin), onPositionChanged); 
                                        Visualization=new TrackVisualization(name=x.Visualization.TrackName, points = x.Visualization.Points); 
                                    }
                        | None -> {
                                    TrackingService= new TrackingService(new Backend.LocationService(Browser.window.location.origin), onPositionChanged); 
                                    Visualization=new TrackVisualization(name=String.Empty, points = TrackVisualization.calculate [{
                                                                                                        latitude = 8.9
                                                                                                        longitude = 5.9
                                                                                                        timestamputc = DateTime.Now
                                                                                                        speed = 34.9
                                                                                                        distanceCovered = 0.0
                                                                                                        distance = 32300.9
                                                                                                        index = 0
                                                                                                        elevation = 320.3
                                                                                                    };
                                                                                                    {
                                                                                                        latitude = 9.9
                                                                                                        longitude = 5.9
                                                                                                        timestamputc = DateTime.Now
                                                                                                        speed = 34.9
                                                                                                        distanceCovered = 0.0
                                                                                                        distance = 32300.9
                                                                                                        index = 1
                                                                                                        elevation = 32.3
                                                                                                    }]);
                                    Tracks=[
                                            {                        
                                                mintimestamp=DateTime.Now;
                                                maxtimestamp=DateTime.Now.AddDays(1.0);
                                                name="first Track"
                                            };
                                            {
                                                mintimestamp=DateTime.Now;
                                                maxtimestamp=DateTime.Now.AddDays(2.0);
                                                name="second Track"
                                            }
                                           ];
                                    Error = None
                                    Info = None
                                }                   
    storeState.Visualization.AssignElevationPoints [| {index = 0; elevation = 0.0;};|]        
    let middleware = Redux.applyMiddleware ReduxThunk.middleware
    store <- Some (createStore reducerWithLocalStorage storeState (Some middleware))
    let provider = createProvider store.Value (R.fn createApp (obj()) [])
    ReactDom.render(provider, Browser.document.getElementsByClassName("main").[0]) |> ignore        
    //registerBroadcastReceiver(store.dispatch)

//registerObervationProviderServiceWorker()
start()