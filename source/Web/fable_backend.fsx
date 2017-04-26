module Backend

#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"
#r "node_modules/fable-redux/Fable.Redux.dll"
#r "node_modules/fable-reactredux/Fable.ReactRedux.dll"
#r "node_modules/fable-reduxthunk/Fable.ReduxThunk.dll"
#load "fable_domainModel.fsx"
open Fable_domainModel
#load "fable_Commands.fsx"
open Commands

open Fable.Core
open Fable.Import
open Fable.PowerPack
open Fable.PowerPack.Fetch
open Fable.PowerPack.Fetch.Fetch_types
open Fable.Core.JsInterop
open System
open Fable.PowerPack.Fetch.Fetch_types


type GoogleMapPoint = { Latitude : double; Longitude : double }
[<Emit("new google.maps.LatLng($0, $1)")>]
let LatLng(lat: double) (lng:double): GoogleMapPoint =
    { Latitude = lat; Longitude = lng }

[<KeyValueList>]
type GoogleElevationQueryDto =    
    | Path of GoogleMapPoint[]
    | Samples of int

type  GoogleElevationService = 
    abstract getElevationAlongPath : GoogleElevationQueryDto list * Func<obj[],string,unit> -> unit

[<Emit("new google.maps.ElevationService()")>]
let ConcreteGoogleElevationService : GoogleElevationService = failwith "JS only"

let loadElevationData (points : TrackingPoint[]) (dispatch : ReactRedux.Dispatcher) = 
                // Create an ElevationService.
    //let elevator = ConcreteGoogleElevationService()
         
             // Create a PathElevationRequest object using this array.
             // Ask for 256 samples along that path.
             // Initiate the path request. 
    
    let googleMapPoints = Array.map (fun p -> 
                                            let point = LatLng p.latitude p.longitude                                            
                                            point
                                        ) points 
    ConcreteGoogleElevationService.getElevationAlongPath ([
                                                              Path googleMapPoints
                                                              Samples 256
                                                          ], 
                                        Func<_,_, _>(fun elevations message -> 
                                                match message with 
                                                    | "OK" -> 
                                                        let elevationPoints = elevations |> Array.mapi (fun index ep -> {index = index; elevation = box ep?elevation :?> double}) 
                                                        dispatch (Commands.ReceivedElevationPoints elevationPoints)
                                                    | _ -> 
                                                        dispatch (Commands.ReceivedElevationPoints [||])
                                                        dispatch (Commands.ShowError "Cannot load elevation points."))
        )    




[<Measure>]
type ms

type LoadTrackingPointsDto = {
    beginDate : DateTime
    endDate : DateTime
}


let private jsonHeaders = 
    [ HttpRequestHeaders.Accept "application/json"
      HttpRequestHeaders.ContentType "application/json"           
    ]

let private dispatchShowError (dispatch : ReactRedux.Dispatcher) (time : int<ms> option) error =
    Commands.ShowError error |> dispatch
    time |> Option.iter (fun t -> 
        Browser.window.setTimeout(box (fun () -> Commands.HideError |> dispatch), t) 
        |> ignore
)

let getAllTracks (dispatch : ReactRedux.Dispatcher) =
    promise {
        Commands.LoadingTracks |> dispatch
        let! response =
            fetch
                ("/api/tracks")
                [ 
                    RequestProperties.Headers jsonHeaders 
                    Method HttpMethod.OPTIONS
                ]                
        if response.Ok then
            let! tracks = response.json<obj array> ()
            tracks 
            |> Array.map (fun i -> 
                                    let ranges = box i?ranges :?> list<list<obj>>
                                    ranges |> List.map (fun r -> 
                                            { 
                                            mintimestamp= DateTime.Parse(string r.[0]?date);
                                            maxtimestamp = DateTime.Parse(string r.[1]?date); 
                                            name = string i?name }))                                             
            |> List.concat
            |> Array.ofList
            |> Commands.ReceivedTracks |> dispatch
        else
            dispatchShowError dispatch None "Could not fetch tracks from server!"
    }
    |> Promise.map ignore

let refresh (dispatch : ReactRedux.Dispatcher) = 
    promise {
      let! response = 
            postRecord ("/api/tracks") "" [ 
                    RequestProperties.Headers jsonHeaders                                          
                ]
      if response.Ok then
        getAllTracks dispatch |> ignore   
      else
        dispatchShowError dispatch None "Could not refresh tracks!"
    }
    |> Promise.map ignore

let loadTrackingPoints (start, ``end``,  trackName) (dispatch : ReactRedux.Dispatcher) =
    promise {
        let! response = 
            postRecord ("/api/tracks/" + trackName) {beginDate=start;endDate=``end``} [ 
                    RequestProperties.Headers jsonHeaders                                          
                ]
        if response.Ok then
            let! track = response.json<obj> ()                
            let trackingPoints = (downcast (box track?trackingpoints)) |> Array.map (fun t -> { 
                                                                                                latitude = (box t?latitude) :?> double
                                                                                                longitude = (box t?longitude) :?> double
                                                                                                timestamputc = DateTime.Parse(string t?timestamputc?date)
                                                                                                speed = 0.0
                                                                                                elevation = 0.0
                                                                                                distance = 0.0
                                                                                                distanceCovered = 0.0
                                                                                                index = 0
                                                                                            })        
            dispatch (Commands.ReceivedTrack(trackName, trackingPoints))

            loadElevationData trackingPoints dispatch
        else
            dispatchShowError dispatch None "Could not fetch track from server!"  
    } 
    |> Promise.map ignore


type GpxWayPoint = {
    lat : double
    lon : double
    time : DateTime
}

type [<Import("*","./node_modules/gpx-parse/dist/gpx-parse-browser.js")>] GpxParse = 
            static member parseGpx(content : string, handler : Func<obj,obj, unit>): unit = jsNative

let parseTrackingPointsFromGpx (filenames: Browser.File[]) (dispatch : ReactRedux.Dispatcher) = 
    promise {
        let file = filenames.[0]
        let fileReader = Browser.FileReader.Create()
        fileReader.onload <- fun e -> 
                                 GpxParse.parseGpx(string e.target?result, Func<obj,obj,_>(fun error data ->
                                                let tracks = box data?tracks :?> obj[]
                                                let segments = box tracks.[0]?segments :?> obj[]
                                                let trackingPoints = segments.[0] :?> GpxWayPoint[]
                                                dispatch (Commands.ReceivedTrack ("imported track", (Array.mapi (fun i e -> 
                                                                                                                    { latitude = e.lat
                                                                                                                      longitude = e.lon
                                                                                                                      timestamputc = e.time
                                                                                                                      speed = 0.0
                                                                                                                      distanceCovered = 0.0
                                                                                                                      distance = 0.0
                                                                                                                      index = i
                                                                                                                      elevation = 0.0}) trackingPoints)))))
                                 box 0                                
        fileReader.readAsText(file)               
    }|> Promise.map ignore
        

let loadLocalStorage<'T> key =
        Browser.localStorage.getItem(key) |> unbox
        |> Option.map (JS.JSON.parse >> unbox<'T>)
let saveToLocalStorage key (data: 'T) =
        Browser.localStorage.setItem(key, JS.JSON.stringify data)
let loadLocationTracker = 
    loadLocalStorage<LocationTracker> "DomainModel"

let saveLocationTracker locationTracker =     
       saveToLocalStorage "DomainModel" locationTracker


[<Emit("new Parse.Query('Posts')")>]
let createParseQuery() = jsNative

type [<Import("*","./parse-latest.js")>] Parse =
             static member initialize(appId : string, value : string): unit = jsNative
             static member serverURL with get(): string = jsNative and set(v: string): unit = jsNative

type LocationService (host) =    
    do Parse.initialize("myAppId", "unused")
    do Parse.serverURL <- host+"/parse"    
    
    interface ILocationQuery with 
        member this.Subscribe job onShowPosition = 
            let parseQuery = createParseQuery()
            parseQuery?equalTo("name", job.identifier) |> ignore
            let subscription = parseQuery?subscribe()
            subscription?on("create", fun position ->
                let name = string (position?get("name"))
                let latitude = (position?get("latitude")) :?> double
                let longitude = (position?get("longitude")) :?> double
                let timestamp = DateTime.Parse (string (position?get("timestamputc")))
                onShowPosition name latitude longitude timestamp) |> ignore                
            job.subscription <- Some subscription
            ignore()
            // if (observedTrackingJob.updatePositionOnMap()) then                
                //showPosition(position.get("latitude"), position.get("longitude"), observedTrackingJob.marker)            

        member this.UnSubscribe job =             
            if job.subscription.IsSome then
                job.subscription.Value?unsubscribe() |> ignore
            ignore()  