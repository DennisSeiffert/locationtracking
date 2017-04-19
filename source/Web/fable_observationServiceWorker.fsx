#r "node_modules/fable-core/Fable.Core.dll"
// #r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#load "./fable_backend.fsx"
open Fable.Core
open Fable.Import
// open System
open Fable.Core.JsInterop
open Backend

// type swMessage = {
//     command : string
//     message : string
// }

[<Emit("this.clients")>]
let clients() = jsNative

[<Emit("self")>]
let self() = jsNative

let locationService : Fable_domainModel.ILocationQuery = new Backend.LocationService("fefref") :> Fable_domainModel.ILocationQuery

self()?addEventListener("message", fun event ->    
    let data = box event?data //:?> swMessage
    
    if box (data?command)  = box "broadcast" then
        Browser.console.log("Broadcasting to clients")

        clients()?matchAll()?``then``(fun(clients) ->
            clients?forEach(fun(client) ->
                client?postMessage("{
                                    command : 'broadcastOnRequest'
                                    message : 'This is a broadcast on request from the SW'
                                   }") |> ignore                
            ) |> ignore
        ) |> ignore
    null
)

self()?addEventListener("install", fun event ->
        Browser.console.log("installing....")                        
)