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
            tracks |> Array.map (fun i -> { 
                                            mintimestamp=DateTime.Parse(string i?mintimestamputc?date);
                                            maxtimestamp = DateTime.Parse(string i?maxtimestamputc?date); 
                                            name = string i?name }) |> Commands.ReceivedTracks |> dispatch
        else
            dispatchShowError dispatch None "Could not fetch tracks from server!"
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
            dispatch (Commands.ReceivedTrack trackingPoints)
        else
            dispatchShowError dispatch None "Could not fetch track from server!"  
    } 
    |> Promise.map ignore
