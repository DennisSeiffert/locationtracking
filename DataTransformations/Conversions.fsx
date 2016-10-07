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
 
      
type Posts = JsonProvider<"""[{"_updated_at": {"$date": 1467828549675}, "name": "dennis", "longitude": 8.4732329, "_created_at": {"$date": 1467828549675}, "timestamputc": {"$date": 1467828547229}, "latitude": 48.9211428, "_id": "SpoEYBRGCy"}]""">  

let geoPoints = Posts.Load("http://127.0.0.1:8080/trackingpoints")                
                |> Seq.map (fun p -> {timestamp =  new DateTime(p.Timestamputc.Date); 
                        latitude = double p.Latitude; 
                        longitude = double p.Longitude; 
                        name = p.Name })
              //  |> Seq.where (fun p -> p.timestamp > DateTime.Now.AddHours(-12.0))
                 


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



