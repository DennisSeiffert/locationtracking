module Commands
#r "node_modules/fable-reactredux/Fable.ReactRedux.dll"
#r "node_modules/fable-core/Fable.Core.dll"
#load "fable_domainModel.fsx"
open Fable_domainModel
open System
open Fable.Core



type [<Pojo>] Commands = 
    | BeginTracking of string
    | StopTracking of string
    | Observe of string
    | Unobserve of string    
    | ObservationPositionUpdated of string * double * double * DateTime   
    | LoadTrackingPoints of DateTime * DateTime * string
    | ClearTrackingPoints 
    | ReceivedTrack of string * TrackingPoint[]
    | ReceivedTracks of Track[]
    | LoadingTracks
    | ShowElevationMarker of TrackingPoint
    | ShowError of string
    | ShowInfo of string
    | HideError     
    | ReceivedElevationPoints of ElevationPoint[]
    interface Fable.Import.ReactRedux.IDispatchable        