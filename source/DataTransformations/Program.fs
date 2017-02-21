//-----------------------------------------------------------------------
// <copyright file="Program.fs" company="Akka.NET Project">
//     Copyright (C) 2009-2016 Lightbend Inc. <http://www.lightbend.com>
//     Copyright (C) 2013-2016 Akka.NET project <https://github.com/akkadotnet/akka.net>
// </copyright>
//-----------------------------------------------------------------------

open System
open MappingService

open Akka.FSharp

let config =  
    Configuration.parse
        @"akka {
            actor {
                provider = ""Akka.Remote.RemoteActorRefProvider, Akka.Remote""
                serializers {
                        wire = ""Akka.Serialization.HyperionSerializer, Akka.Serialization.Hyperion""
                }
                serialization-bindings {
                    ""System.Object"" = wire
                }
            }               
            remote.helios.tcp {
                hostname = localhost
                port = 9001
            }
        }"

[<EntryPoint>]
let main _ =
    use system = System.create "remote-system" config
    MappingService.main() |> ignore
    Console.ReadLine() |> ignore
    0
