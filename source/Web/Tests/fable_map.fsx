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

[<Emit("new google.maps.Map($0, $1)")>]
let GoogleMap(mapHolder:obj) (options:obj) : obj = 
    failwith "JS only"


type [<Pojo>] MapViewModel  =
    { Track : List<TrackingPoint> }

type [<Pojo>] MapState = { map : obj option; polyLineOfTrack : obj option; needsAnUpdate : bool}

type MapView(props) =
    inherit React.Component<MapViewModel, MapState>(props)
    do base.setInitState({ 
                            map = None  
                            polyLineOfTrack = None
                            needsAnUpdate = true
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
            | Some map -> this.showTrack()
            | _ -> ignore() 

    member this.componentWillReceiveProps(nextProps) = 
        if this.state.map <> None then 
            this.setState({ this.state with needsAnUpdate = true })

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
        this.setState({map = Some map; polyLineOfTrack = None; needsAnUpdate = true })
    
    member this.render () =                 
        this.mapHolder

let private mapStateToProps (state : LocationTracker) (ownprops : MapViewModel) =
    { ownprops with
        Track = state.Visualization.Points        
    }
// let private mapDispatchToProps (dispatch : ReactRedux.Dispatcher) ownprops =
//     { ownprops with
//         onLoadTracks = fun () -> dispatch <| asThunk (Backend.getAllTracks)   
//         onLoadTrackingPoints = fun(start, ``end``, trackName) -> asThunk (Backend.loadTrackingPoints(start, ``end``, trackName)) |> dispatch
//     }

let private setDefaultProps (ownprops : MapViewModel) =
    { ownprops with
         Track = List.Empty }         

let createMapViewComponent =
    createConnector ()
    |> withStateMapper mapStateToProps    
    |> withProps setDefaultProps
    |> buildComponent<MapView, _, _, _>