#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"
#load "fable_navigation.fsx"
open Fable_navigation
#load "fable_redux.fsx"
open Fable_redux
#load "fable_map.fsx"
open Fable_map



open Fable.Core
open Fable.Import
open System
open Fable.Core.JsInterop
module R = Fable.Helpers.React
open R.Props
open Fable.PowerPack.Fetch
module F = Fable.PowerPack.Fetch.Fetch_types

// domain models
type Commands = 
    | BeginTracking of string
    | StopTracking of string
    | LoadTrackingPoints of string * string * string
    | LoadTracks



type GeoOptions = {
  enableHighAccuracy: bool; 
  maximumAge        : int; 
  timeout           : int;
}

let defaultGeoOptions = {enableHighAccuracy = true; maximumAge = 60000; timeout = 20000 }

type TrackingJob = {
    identifier : string;
    marker : string;
    subscription : string;
    latitude : double;
    longitude : double;
    utcTimestamp : DateTime;
    updatePositionOnMap : bool;
    observe : bool; 
}

type Track = {
    mintimestamp : DateTime;
    maxtimestamp : DateTime;
    name : string;
}

type TrackingService() = 
    member val ownTrackingJob = {            
            identifier = String.Empty;
            marker = String.Empty;
            subscription = String.Empty;
            latitude = 0.0;
            longitude = 0.0;
            utcTimestamp = DateTime.UtcNow;
            updatePositionOnMap = true;
            observe = true;}
    member val observedTrackingJobs : TrackingJob List = List.Empty with get, set
    
    member this.CreateTrackingJob(name, latitude, longitude) =
        {            
            identifier = name;
            marker = String.Empty;
            subscription = String.Empty;
            latitude = latitude;
            longitude = longitude;
            utcTimestamp = DateTime.UtcNow;
            updatePositionOnMap = true;
            observe = true;        
        }
    
    member this.AddTrackingJob(job, onObserveChanged) =
        if not(this.ContainsTrackingJob(job.identifier)) then
            this.observedTrackingJobs <- this.observedTrackingJobs @ [job]
    
    member this.DeleteTrackingJob(job) =
        this.observedTrackingJobs <- List.where (fun j -> j <> job) this.observedTrackingJobs    
    
    member this.ContainsTrackingJob(name) =
        List.exists (fun j -> j.identifier = name) this.observedTrackingJobs



               

type [<Pojo>] AppState = { 
    TrackingService : TrackingService     
}

type [<Pojo>] AppViewModel = { 
    Store: Redux.IStore<TrackingService, Commands>        
}

type AppView(props, ctx) as this =
    inherit React.Component<AppViewModel, AppState>(props)
    let dispatch = Redux.dispatch props.Store
    let getState() = {TrackingService=Redux.getState props.Store; }
    //do this.state <- getState()
    do Redux.subscribe props.Store (getState >> this.setState)

    member this.render() =        
        R.div [ ClassName "site-wrapper"] [ 
            R.div [ ClassName "site-wrapper-inner"] [ 
                R.div [ ClassName "cover-container"] [                     
                    R.com<NavigationView, _, _> { new NavigationViewModel with 
                        member __.onBeginTracking(trackingIdentifier) = dispatch(BeginTracking(trackingIdentifier))
                        member __.onStopTracking(trackingIdentifier) = dispatch(StopTracking(trackingIdentifier))                                                         
                        member __.onLoadTrackingPoints beginDate endDate selectedTrack = dispatch(LoadTrackingPoints (beginDate, endDate, selectedTrack))
                        member __.onLoadTracks() = dispatch(LoadTracks)
                    } [ ]
                    R.com<MapView, _, _> { map = "" } [ ]
                ]
            ]            
        ]

let reducer (state: TrackingService) = function
    | BeginTracking identifer ->
        state
    | StopTracking identifier -> 
        state
    | LoadTrackingPoints (beginDate, endDate, selectedTrack) -> 
        state
    | LoadTracks ->
        async { 
            let tracks = 
                fetch "/api/tracks" [ 
                        F.Method F.HttpMethod.GET 
                        F.Headers [ 
                            F.ContentType "application/json"                 
                        ]                        
                ]                           
        }
        
        state

let render() = 
    let initState = new TrackingService() 
    let store =  Redux.createStore reducer initState

    ReactDom.render(
        R.com<AppView, _, _> { Store = store } [],        
        Browser.document.getElementsByClassName("main").[0]
    )

render()