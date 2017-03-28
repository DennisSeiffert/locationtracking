open System

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

type TrackingPoint = {
   latitude : double;
   longitude : double;
   timestamputc : DateTime;
   speed : double;
   distanceCovered : double;
   distance : double;
   index : int;
   elevation : double;      
}

let toRad x =
    x * Math.PI / 180.0

let distance lat1 lon1 lat2 lon2 =
    let R = 6371.0 // Radius of the earth in km
    let dLat = toRad(lat2 - lat1)  // Javascript functions in radians
    let dLon = toRad(lon2 - lon1)
    let a = Math.Sin(dLat / 2.0) * Math.Sin(dLat / 2.0) +
            Math.Cos(toRad(lat1)) * Math.Cos(toRad(lat2)) *
            Math.Sin(dLon / 2.0) * Math.Sin(dLon / 2.0)
    let c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a))
    let d = R * c // Distance in km
    d * 1000.0


type TrackVisualization(name : string, points : TrackingPoint List) =         
    member this.Points = points     
    member this.TrackName = name

    member this.totalDistanceInMeters () = 
        this.Points.[this.Points.Length - 1].distanceCovered;

    member this.getIndexOfNearestPoint (distanceInMeters) =   
        this.Points |> List.findIndex (fun (p) -> p.distanceCovered >= distanceInMeters)

    member this.getGeoPointFromElevationDataIndex (index : int) =
        let meters = (double index / double this.Points.Length) * this.totalDistanceInMeters();
        let markerPointIndex = this.getIndexOfNearestPoint(meters);
        let geoPoint = this.getPointAt(markerPointIndex);
        geoPoint;
  

    member this.getPointAt index =
        this.Points.[index]    

    static member  calculate points =
        points
        |> List.mapi (fun i p ->
                        match i with
                        | 0 -> {p with speed = 0.0; distanceCovered = 0.0; index = i }
                        | _ ->  
                            let distanceBetween = distance points.[i - 1].latitude points.[i - 1].longitude p.latitude p.longitude
                            let timespan = p.timestamputc - points.[i - 1].timestamputc
                            let speed = if timespan > TimeSpan.Zero then
                                            distanceBetween / (timespan.TotalMilliseconds / 1000.0)
                                        else 
                                            0.0                                        
                            {p with
                                speed = speed
                                distance = distanceBetween
                                distanceCovered = points.[i - 1].distance + distanceBetween
                                index = i
                            }
                       )                             
     


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



type LocationTracker = {
    TrackingService : TrackingService
    Visualization : TrackVisualization
    Tracks : Track List
    Error : string option
}
    
    
