module gpxconversion

type GeoPoint = {timestamp : System.DateTime; latitude : double; longitude : double; name : string }

// let sampleGeopoints = [{timestamp = System.DateTime.Now; 
//                         latitude = 51.05; 
//                         longitude = 7.566; 
//                         name = "Dennis" };
//                        {timestamp = System.DateTime.Now; 
//                         latitude = 51.05; 
//                         longitude = 7.666; 
//                         name = "Dennis" };
//                         {timestamp = System.DateTime.Now; 
//                         latitude = 51.05; 
//                         longitude = 12.566; 
//                         name = "Dennis" };
//                         {timestamp = System.DateTime.Now; 
//                         latitude = 51.45; 
//                         longitude = 7.566; 
//                         name = "Dennis" }]
                        
(*
<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx version="1.1" creator="Ersteller der Datei">
  <metadata> <!-- Metadaten --> </metadata>
  <wpt lat="xx.xxx" lon="yy.yyy"> <!-- Attribute des Wegpunkts --> </wpt>
  <!-- weitere Wegpunkte -->
  <rte>
    <!-- Attribute der Route -->
    <rtept lat="xx.xxx" lon="yy.yyy"> <!-- Attribute des Routenpunkts --> </rtept>
    <!-- weitere Routenpunkte -->
  </rte>
  <!-- weitere Routen -->
  <trk>
    <!-- Attribute des Tracks -->
    <trkseg>
      <trkpt lat="xx.xxx" lon="yy.yyy"> <!-- Attribute des Trackpunkts --> </trkpt>
      <!-- weitere Trackpunkte -->
    </trkseg>
    <!-- weitere Track-Segmente -->
  </trk>
  <!-- weitere Tracks -->
</gpx>
*)    

type geoPoint = { latitude : double; longitude : double }         

type segment = 
    | TrackPoints of List<geoPoint>
    | RoutePoints of List<geoPoint>
    
type track = { segments : List<segment>; name : string }

type route = { segment : segment; name : string }
    
type gpx = 
    {
        wayPoints : List<geoPoint>;
        routes : List<route>;
        tracks : List<track> 
    }  
                          
let convertToTrackSegment (trackPoints : list<GeoPoint>) =     
    TrackPoints(
        trackPoints |>
        List.map (fun point -> { latitude = point.latitude; longitude = point.longitude })
    )
    
let toXmlSegment startTag segment endTag =     
    let xmlSegment = match segment with 
                        | TrackPoints(trackingPoints) -> 
                            List.map (fun trackPoint -> 
                                System.String.Format("<trkpt lat='{0}' lon='{1}'> <!-- Attribute des Trackpunkts --> </trkpt>",
                                    trackPoint.latitude, trackPoint.longitude)) trackingPoints
                        | RoutePoints(routePoints) -> 
                            List.map (fun routePoint -> 
                                System.String.Format("<rtept lat='{0}' lon='{1}'> <!-- Attribute des Trackpunkts --> </rtept>",
                                    routePoint.latitude, routePoint.longitude)) routePoints
    startTag :: xmlSegment @ [endTag]
    
let toXmlTrackSegment segment = 
    toXmlSegment "<trkseg>" segment "</trkseg>"
    
let toXmlRoute route = 
    toXmlSegment "<rte>" route.segment "</rte>"                                                              
    
let toXmlTrack track = 
    let segments = track.segments |> List.map toXmlTrackSegment |> List.collect (fun segment -> segment)
    "<trk>" :: segments @ ["</trk>"]
    
            
    
let ToXml model =
    let xmlWayPoints = 
        model.wayPoints |> 
        List.map (fun wayPoint -> System.String.Format("<wpt lat='{0}' lon='{1}'> <!-- Attribute des Wegpunkts --> </wpt>", wayPoint.latitude, wayPoint.longitude))
    let xmlTracks = model.tracks |> List.map toXmlTrack |> List.collect (fun track -> track)
    let xmlRoutes = model.routes |> List.map toXmlRoute |> List.collect (fun route -> route)
    let gpxStartTag = ["<?xml version='1.0' encoding='UTF-8' standalone='no' ?>";
                       "<gpx version='1.1' creator='Ersteller der Datei'>";
                       "<metadata> <!-- Metadaten --> </metadata>"]                       
    let allAttributes = gpxStartTag @ xmlWayPoints @ xmlRoutes @ xmlTracks @ ["</gpx>"]                                       
    System.String.Join("\n", allAttributes)                                                                                         