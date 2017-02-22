#I __SOURCE_DIRECTORY__
#r "../../packages/FSharp.Data/lib/net40/FSharp.Data.dll"
#r "../../packages/Akka/lib/net45/Akka.dll"
#r "../../packages/Akka.FSharp/lib/net45/Akka.FSharp.dll"
#r "../../packages/FsPickler/lib/net45/FsPickler.dll"
#r "../../packages/Newtonsoft.Json/lib/net45/Newtonsoft.Json.dll"
#r "../../packages/Akka.Persistence/lib/net45/Akka.Persistence.dll"
#r "../../packages/Akka.Persistence.FSharp/lib/net45/Akka.Persistence.FSharp.dll"
#r "../../packages/Google.ProtocolBuffers/lib/net40/Google.ProtocolBuffers.dll"
#r "../../packages/Google.ProtocolBuffers/lib/net40/Google.ProtocolBuffers.Serialization.dll"

#load "DataTransformations.fs"
open DataTransformations.DataTransformations
open FSharp.Data


#load "MappingService.fs"
open MappingService


let r = mapKeys([|("key1", JsonValue.String "ValueOfKey1"); ("key2", JsonValue.String "ValueOfKey2")|], [|("key3", JsonValue.String "Value"); ("key4", JsonValue.String "Value")|]) 


let result = extractKeysFrom [|("key1", JsonValue.String "Value"); ("key2", JsonValue.String "Value")|] 

let sampleRules = 
    mappings {        
        apichange """{ "page": 1, "pages": 1, "total": 53 }""" 
            ToSource """{ "newPropertyName": 1, "NewMappedPages": 1, "total": 53 }"""            
        map """{ "page": 1, "pages": 1, "total": 53 }""" 
            ToTarget """{ "mappedPage": 1, "MappedPages": 1, "total": 53 }"""            
    }

let matchedKeys = matchKeys ["a"; "b"] ["a"; "b"]

let apiResponse = """[ { "newPropertyName": 1, "NewMappedPages": 1, "total": 60 },    
    [ { "indicator": {"value": "Central government debt, total (% of GDP)"},
        "country": {"id":"CZ","value":"Czech Republic"},
        "value":null,"decimal":"1","date":"2000"},
        { "indicator": {"value": "Central government debt, total (% of GDP)"},
        "country": {"id":"CZ","value":"Czech Republic"},
        "value":"16.6567773464055","decimal":"1","date":"2010"} ] ]"""
let parsedApiResponse = JsonValue.Parse apiResponse
let mappedResult = mapToTargetStructure sampleRules parsedApiResponse



MappingService.main()

#r "../../packages/FSharp.Data/lib/net40/FSharp.Data.dll"

open FSharp.Data.HttpRequestHeaders
open FSharp.Data
let response = Http.RequestString( 
                            "http://hmmas8wmeibjab4e.myfritz.net/api/tracks",
                            httpMethod = "OPTIONS",                                                    
                            headers = [ ContentType HttpContentTypes.Json ]
                            )
printfn "%s" (response.ToString())
