#if INTERACTIVE
#I "../lib"
#I "../lib/FSharp.Data"
#else
#I "../lib"
#I "../lib/FSharp.Data"
#endif

#r "FSharp.Data.dll"
#load "GpxConverter.fs"

open System
open FSharp.Data
open gpxconversion
 
      
type Posts = JsonProvider<"""[{"_updated_at": {"$date": 1467180928182}, "name": "dennis", "longitude": 8.4948289, "_created_at": {"$date": 1467180928182}, "timestamputc": {"$date": 1467180925281}, "latitude": 48.9459225, "_id": "EEWWDoLkLv"}, {"_updated_at": {"$date": 1467180883280}, "name": "dennis", "longitude": 8.4948289, "_created_at": {"$date": 1467180883280}, "timestamputc": {"$date": 1467180880253}, "latitude": 48.9459225, "_id": "ZALR33Tqwg"}, {"_updated_at": {"$date": 1467180838030}, "name": "dennis", "longitude": 8.4948289, "_created_at": {"$date": 1467180838030}, "timestamputc": {"$date": 1467180835236}, "latitude": 48.9459225, "_id": "3HyHDa5F2B"}]""">  

let geoPoints = Posts.Load("http://127.0.0.1:5000/trackingpoints")                
                |> Seq.map (fun p -> {timestamp = new DateTime(p.Timestamputc.Date); 
                        latitude = double p.Latitude; 
                        longitude = double p.Longitude; 
                        name = p.Name })
                 


let gpxModel = 
    {
        wayPoints = []; 
        routes = []; 
        tracks = 
        [{
            segments = [convertToTrackSegment(List.ofSeq geoPoints)]; 
            name = "Dennis"
        }] 
    }
    
let xml = ToXml gpxModel

System.IO.File.WriteAllText("/home/dennis/Desktop/routes.gpx", xml)