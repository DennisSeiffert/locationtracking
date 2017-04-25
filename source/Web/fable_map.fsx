#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"
#r "node_modules/fable-redux/Fable.Redux.dll"
#r "node_modules/fable-reactredux/Fable.ReactRedux.dll"
#r "node_modules/fable-reduxthunk/Fable.ReduxThunk.dll"
#load "fable_domainModel.fsx"
open Fable.Core
open Fable.Import
open System
open Fable.Core.JsInterop
module R = Fable.Helpers.React
open R.Props
open Fable_domainModel
open Fable.Helpers.ReactRedux

type GeoOptions = {
  enableHighAccuracy: bool; 
  maximumAge        : int; 
  timeout           : int;
}

let defaultGeoOptions = {enableHighAccuracy = true; maximumAge = 60000; timeout = 20000 }

[<Emit("google.maps.MapTypeId.TERRAIN")>]
let terrain() : obj = 
    failwith "JS only"

[<Emit("google.maps.NavigationControlStyle.SMALL")>]
let small() : obj = 
    failwith "JS only"

type GoogleMapPoint = { Latitude : double; Longitude : double }

[<Emit("new google.maps.LatLng($0, $1)")>]
let LatLng(lat: double) (lng:double): GoogleMapPoint =
    { Latitude = lat; Longitude = lng }

[<Emit("new google.maps.LatLngBounds ()")>]
let GooglePointBounds() : obj = 
    failwith "JS only"

[<Emit("new google.maps.Polyline ({path: $0, strokeColor: \"#FF00AA\", strokeOpacity: .7, strokeWeight: 4})")>]
let GooglePolyline (points : GoogleMapPoint[]) : obj = 
    failwith "JS only"

type googleMapMarkerIcon = {
          path: string
          fillColor: string
          fillOpacity: float
          scale: int
          strokeColor: string
          strokeWeight: int
        };

let markerIcon = {
          path = "M-18 -30.08C-18 -43.85 16.45 -55 58.95 -55C101.45 -55 135.9 -43.85 135.9 -30.08C135.9 -16.32 101.45 -5.16 58.96 -5.16C48.63 -5.16 38.78 -5.82 29.79 -7.01C27.89 -6.57 18.4 -4.37 1.31 -0.39L5.74 -12.09C-10.09 -19.37 -18 -25.37 -18 -30.08Z"
          fillColor = "yellow"
          fillOpacity = 0.0
          scale = 1
          strokeColor = "black"
          strokeWeight = 2
        }

[<Emit("new google.maps.Marker({position: new google.maps.LatLng($0, $1),map:$2,title:$3, icon:$4})")>]
let GoogleMarker (latitude, longitude, map, identifier, markerIcon : googleMapMarkerIcon) : obj = jsNative

[<Emit("new google.maps.Map($0, $1)")>]
let GoogleMap(mapHolder:obj) (options:obj) : obj = 
    failwith "JS only"


type [<Pojo>] MapViewModel  =
    { Track : List<TrackingPoint>
      ObservedTrackingJobs : List<TrackingJob>
      trackMarkerPosition : TrackingPoint option
    }

type [<Pojo>] MapState = { map : obj option; polyLineOfTrack : obj option; needsAnUpdate : bool; markers : List<obj>; trackMarker : obj}

type MapView(props) =
    inherit React.Component<MapViewModel, MapState>(props)
    do base.setInitState({ 
                            map = None  
                            polyLineOfTrack = None
                            needsAnUpdate = true
                            markers = List.Empty
                            trackMarker = None
                        })    
    member val mapHolder = R.div [ ClassName "jumbotron" 
                                   Style [
                                       PaddingTop "0px"
                                       PaddingBottom "0px"
                                       Height "400px"
                                   ]
                                    ] [ ]    

    member this.componentDidMount (_) =
        this.Initialize()

    member this.componentDidUpdate(prevState, actualState) =
        match this.state.map with    
            | Some map -> 
                    this.showTrack()
                    //this.showMarkers()
            | _ -> ignore() 

    member this.componentWillReceiveProps(nextProps : MapViewModel) = 
        if this.state.map <> None then 
            let markers = nextProps.ObservedTrackingJobs |> List.map (fun i ->                                                                
                                                                match List.tryFind (fun e -> string e?title = i.identifier) this.state.markers with
                                                                            | Some marker ->                                                                                
                                                                                marker?setPosition(LatLng i.latitude i.longitude) |> ignore                                                                        
                                                                                marker                                                                                
                                                                            | None -> GoogleMarker(i.latitude, i.longitude, this.state.map, i.identifier, markerIcon)                                                                
                                                                )
            if nextProps.trackMarkerPosition.IsSome then
                this.state.trackMarker?setPosition(LatLng nextProps.trackMarkerPosition.Value.latitude nextProps.trackMarkerPosition.Value.longitude) |> ignore
                this.state.trackMarker?title <- String.Format("{0} ü. N.N\n{1} km/h\n{2} km", 
                                                    nextProps.trackMarkerPosition.Value.elevation, 
                                                    nextProps.trackMarkerPosition.Value.speed *3.6,
                                                    nextProps.trackMarkerPosition.Value.distanceCovered / 1000.0) 
            this.setState({ this.state with needsAnUpdate = true; markers = markers })

    member this.showMarkers() = 
        if this.state.needsAnUpdate && not(List.isEmpty this.state.markers) then
            let firstmarker = this.state.markers.[0]
            this.state.map?panTo(firstmarker?position) |> ignore
    member this.showTrack() =     
        if this.state.needsAnUpdate && not(List.isEmpty this.props.Track) then
            if this.state.polyLineOfTrack <> None then
                this.state.polyLineOfTrack?setMap(null) |> ignore

            let bounds = GooglePointBounds()
            let googleMapPoints = List.map (fun p -> 
                                                    let point = LatLng p.latitude p.longitude
                                                    bounds?extend(point) |> ignore                                                
                                                    point
                                                ) (this.props.Track |> List.rev)
            
            let polyLine = GooglePolyline(Array.ofList googleMapPoints)            
            polyLine?setMap(this.state.map) |> ignore
            this.state.map?fitBounds(bounds) |> ignore            

            this.setState({ this.state with polyLineOfTrack = Some polyLine
                                            needsAnUpdate = false })        
        ()
        
        

//     function showTrack(track){
//     if (map === undefined) return;

//     var points = [];
// 	var bounds = new google.maps.LatLngBounds ();
// 	$(track.trackingpoints).each(function() {
// 	  var lat = this.latitude;
// 	  var lon = this.longitude;      
// 	  var p = new google.maps.LatLng(lat, lon);
// 	  points.push(p);
// 	  bounds.extend(p);
// 	});
//     // reverse order to begin with first tracking point at index 0
//     points = points.reverse();
//     //geoPoints = geoPoints.reverse();

//     currentTrack = new TrackViewModel(track.trackingpoints);
//     currentTrack.assignElevationMarker(new google.maps.Marker({position: new google.maps.LatLng(0, 0),map:map,title:"Elevation Marker"}));    
//     currentTrack.calculate();

// 	var poly = new google.maps.Polyline({
// 	  // use your own style here
// 	  path: points,
// 	  strokeColor: "#FF00AA",
// 	  strokeOpacity: .7,
// 	  strokeWeight: 4
// 	});	
// 	poly.setMap(map);		
// 	map.fitBounds(bounds);

//     displayPathElevation(points, map, currentTrack)
// }    

    member this.Initialize() =
        let initialLatLng = LatLng (0.0) (0.0)
        let options = createObj [
                            "center" ==> initialLatLng
                            "zoom" ==> 14
                            "mapTypeId" ==>  terrain() //google.maps.MapTypeId.TERRAIN
                            "mapTypeControl" ==> true
                            "navigationControlOptions" ==> createObj 
                                                ["style" ==>  small()] //google.maps.NavigationControlStyle.SMALL
                            ]

        let map = GoogleMap (Browser.document.getElementsByClassName("jumbotron").[0]) (options)
        let trackMarker = GoogleMarker(0.0, 0.0, map, "track marker", markerIcon)
        this.setState({map = Some map; polyLineOfTrack = None; needsAnUpdate = true; markers = List.Empty; trackMarker = trackMarker })
    
    member this.render () =                 
        this.mapHolder

let private mapStateToProps (state : LocationTracker) (ownprops : MapViewModel) =
    { ownprops with
        Track = state.Visualization.Points
        ObservedTrackingJobs = state.TrackingService.observedTrackingJobs   
        trackMarkerPosition = state.Visualization.LastKnownPosition     
    }
// let private mapDispatchToProps (dispatch : ReactRedux.Dispatcher) ownprops =
//     { ownprops with
//         onLoadTracks = fun () -> dispatch <| asThunk (Backend.getAllTracks)   
//         onLoadTrackingPoints = fun(start, ``end``, trackName) -> asThunk (Backend.loadTrackingPoints(start, ``end``, trackName)) |> dispatch
//     }

let private setDefaultProps (ownprops : MapViewModel) =
    { ownprops with
         Track = List.Empty
         ObservedTrackingJobs = List.Empty  
         trackMarkerPosition = Some {
                                    latitude = 9.9
                                    longitude = 5.9
                                    timestamputc = DateTime.Now
                                    speed = 34.9
                                    distanceCovered = 0.0
                                    distance = 32300.9
                                    index = 1
                                    elevation = 32.3
                               }       
    }         

let createMapViewComponent =
    createConnector ()
    |> withStateMapper mapStateToProps    
    |> withProps setDefaultProps
    |> buildComponent<MapView, _, _, _>