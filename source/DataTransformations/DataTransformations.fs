namespace DataTransformations

open FSharp.Data

module DataTransformations =                   
    type MappingRule =
        | SourceToTarget of mapFrom:JsonValue * mapTo:JsonValue
        | ApiChange of mapFrom:JsonValue * mapTo:JsonValue        

    type Rules = 
        |MappingRules of List<MappingRule>

    type Directions = 
        |ToTarget
        |ToSource

    type Operations = 
        | Renaming
        | Deleting        
        | Extending


    type MappingRulesBuilder() =    
        member x.Yield (_) = MappingRules []

        [<CustomOperation("map")>]
        member x.Map (MappingRules rules, from: string, dir:Directions, mapto: string) =
            let rule = match dir with 
                        | ToTarget -> SourceToTarget(JsonValue.Parse from,JsonValue.Parse mapto)
                        | ToSource -> ApiChange(JsonValue.Parse from,JsonValue.Parse mapto)
            MappingRules [ yield! rules
                           yield  rule] 

        [<CustomOperation("apichange")>]
        member x.ChangeApi (MappingRules rules, from: string, dir:Directions, mapto: string) =
            let rule = match dir with 
                        | ToTarget -> SourceToTarget(JsonValue.Parse from,JsonValue.Parse mapto)
                        | ToSource -> ApiChange(JsonValue.Parse from,JsonValue.Parse mapto)
            MappingRules [ yield! rules
                           yield  rule]  


    let mappings = MappingRulesBuilder()

    let extractKeysFrom (recordProperties:(string * JsonValue)[]) = 
        recordProperties |> Array.map (fun i -> match i with (key, _) -> key)        

    let matchKeys sourceKeys targetKeys = 
        List.compareWith (fun e1 e2 -> 
                            if e1 > e2 then 1
                            elif e1 < e2 then -1
                            else 0) sourceKeys targetKeys = 0    

    let mapKeys (source:(string * JsonValue)[], target:(string * JsonValue)[]) = 
        seq {        
            for i = 0 to source.Length - 1 do
                let (_, value) = source.[i]
                let (targetKey, targetValue) = target.[i]
                yield match value with
                        |JsonValue.String sourceValue -> Some (targetKey, JsonValue.String sourceValue)
                        |JsonValue.Boolean sourceValue -> Some (targetKey, JsonValue.Boolean sourceValue)
                        |JsonValue.Number sourceValue -> Some (targetKey, JsonValue.Number sourceValue)
                        |JsonValue.Float sourceValue -> Some (targetKey, JsonValue.Float sourceValue)
                        | _ -> None            
        }

    let mapKey sourceValue targetKey = 
        match sourceValue with
            |JsonValue.String sourceValue -> Some (targetKey, JsonValue.String sourceValue)
            |JsonValue.Boolean sourceValue -> Some (targetKey, JsonValue.Boolean sourceValue)
            |JsonValue.Number sourceValue -> Some (targetKey, JsonValue.Number sourceValue)
            |JsonValue.Float sourceValue -> Some (targetKey, JsonValue.Float sourceValue)
            | _ -> None

    let getRule rules keys = 
        rules 
        |> Seq.tryFind (fun rule -> 
                             let ruleSourceKeys = match rule with 
                                                    |SourceToTarget (JsonValue.Record fromProperties, _) -> extractKeysFrom fromProperties
                                                    | _ -> [||]
                             matchKeys keys (List.ofArray ruleSourceKeys)
                          )        

    let getApiChanges rules =
        rules |> Seq.where (fun r -> match r with 
                                        |ApiChange (_) -> true
                                        | _ -> false)

    let switchMappingDirection rule = function        
            | ApiChange (s, t) -> ApiChange(t, s)
            | SourceToTarget (s, t) -> SourceToTarget(s, t)

    let mapToTargetStructure rules sourceStructure = 
        let mappingRules = match rules with MappingRules listOfRules -> listOfRules
        let rec matching = function         
            | JsonValue.Null -> JsonValue.Null      
            | JsonValue.Boolean b -> JsonValue.Boolean b
            | JsonValue.Number number -> JsonValue.Number number
            | JsonValue.Float number -> JsonValue.Float number
            | JsonValue.String s -> JsonValue.String s
            | JsonValue.Record properties ->
                let sourceKeys =  extractKeysFrom properties
                let rule = getRule mappingRules (List.ofArray sourceKeys)
                let targetKeys = match rule with 
                                 | Some (SourceToTarget(_, JsonValue.Record mapToProperties)) -> extractKeysFrom mapToProperties
                                 | Some _ -> sourceKeys
                                 | None -> sourceKeys                        
                let mappedRecordProperties = 
                    seq {
                        for i = 0 to properties.Length - 1 do
                            let sourceKey,v = properties.[i]
                            let targetKey = targetKeys.[i]                                                
                            yield (targetKey, matching v)                    
                    }
                JsonValue.Record (Array.ofSeq mappedRecordProperties)
            | JsonValue.Array elements ->
                JsonValue.Array (Array.ofSeq (seq {
                    for i = 0 to elements.Length - 1 do                        
                        yield matching elements.[i]  
                }))
        matching sourceStructure         
                
        


