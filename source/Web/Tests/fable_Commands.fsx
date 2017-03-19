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
    | LoadTrackingPoints of DateTime * DateTime * string
    | ClearTrackingPoints 
    | ReceivedTrack of TrackingPoint[]
    | ReceivedTracks of Track[]
    | LoadingTracks
    | ShowError of string
    | HideError 
    interface Fable.Import.ReactRedux.IDispatchable        