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
}

type TrackVisualization(name : string, points : TrackingPoint List) = 
    member this.TrackName = name
    member this.Points = points       
     


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

    member val Tracks : Track List = List.Empty with get, set
    
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
    
    
