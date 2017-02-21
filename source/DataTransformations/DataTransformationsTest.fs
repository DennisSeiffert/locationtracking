
module DataTransformationsTest
open System
open System.IO
open Microsoft.FSharp.Compiler.SimpleSourceCodeServices
open FsUnit
open NUnit.Framework
open DataTransformations.DataTransformations
open FSharp.Data


let referencedAssemblies =
    let rootDir =  __SOURCE_DIRECTORY__ + "/../../bin/SwaggerProvider/"
    List.collect (fun x->
        ["-r"; Path.Combine(rootDir, x)]) ["SwaggerProvider.Runtime.dll"
                                           "SwaggerProvider.DesignTime.dll"
                                           "SwaggerProvider.dll";]

[<Test; >]
let ``Compile TP`` url =
    let tempFile = Path.GetTempFileName()
    let fs = Path.ChangeExtension(tempFile, ".fs")
    let dll = Path.ChangeExtension(tempFile, ".dll")
    
    File.WriteAllText(fs, sprintf """
    module TestModule
    open SwaggerProvider
    type ProvidedSwagger = SwaggerProvider<"%s">
    let instance = ProvidedSwagger()
    """ url)
    let scs = new Microsoft.FSharp.Compiler.SimpleSourceCodeServices.SimpleSourceCodeServices()
    
    let errors, exitCode =
        scs.Compile(Array.ofList
                        (["fsc.exe"; "-o"; dll; "-a"; fs] @ referencedAssemblies))
    
    [tempFile; fs; dll]
    |> List.filter File.Exists
    |> List.iter File.Delete
    
    if exitCode <> 0 then
        let strs = errors |> Array.map(fun x->x.ToString())
        failwithf "Error:\n%s" (String.Join("\n", strs )) 


[<Test>]
let ``Should map record structure`` =    
    let r = mapKeys([|("key1", JsonValue.String "ValueOfKey1"); ("key2", JsonValue.String "ValueOfKey2")|], [|("key3", JsonValue.String "Value"); ("key4", JsonValue.String "Value")|])    
    Assert.AreEqual (r, [Some ("key3", "ValueOfKey1"); Some ("key4", "ValueOfKey2")]) 

[<Test>]
let ``Should extract keys from record tuples`` = 
    let result = extractKeysFrom [|("key1", JsonValue.String "Value"); ("key2", JsonValue.String "Value")|] 
    Assert.AreEqual (result, ["key"; "key2"])
    
[<Test>]
let ``Should Create Mapping Rules`` = 
    let example = 
        mappings {
            map """{ "page": 1, "pages": 1, "total": 53 }""" ToTarget """{}"""
            map """{ "page": 1, "pages": 1, "total": 53 }""" ToTarget """{ "page": 1, "pages": 1, "total": 53 }"""
        }
    ignore() 

[<Test>]
let ``Should get rule`` = 
    let rules = 
        mappings {
            map """{ "page": 1, "pages": 1, "total": 53 }""" ToTarget """{}"""
            map """{ "page": 1, "pages": 1, "total": 53 }""" ToTarget """{ "page": 1, "pages": 1, "total": 53 }"""
        }
    let mappingRules = match rules with MappingRules listOfRules -> listOfRules
    let rule = getRule mappingRules ["page"; "pages"; "total"]
    Assert.IsTrue (rule.IsSome)

[<Test>]
let ``Should map according to mapping rules`` = 
    let sampleRules = 
        mappings {        
            map """{ "page": 1, "pages": 1, "total": 53 }""" ToTarget """{ "mappedPage": 1, "MappedPages": 1, "total": 53 }"""
        }
    let testString = """[ { "page": 1, "pages": 1, "total": 60 },    
    [ { "indicator": {"value": "Central government debt, total (% of GDP)"},
        "country": {"id":"CZ","value":"Czech Republic"},
        "value":null,"decimal":"1","date":"2000"},
        { "indicator": {"value": "Central government debt, total (% of GDP)"},
        "country": {"id":"CZ","value":"Czech Republic"},
        "value":"16.6567773464055","decimal":"1","date":"2010"} ] ]"""
    let bankingData = JsonValue.Parse testString
    let mappedResult = mapToTargetStructure sampleRules bankingData
    let result = mappedResult.ToString()
    Assert.AreEqual("""[
  {
    "mappedPage": 1,
    "MappedPages": 1,
    "total": 60
  },
  [
    {
      "indicator": {
        "value": "Central government debt, total (% of GDP)"
      },
      "country": {
        "id": "CZ",
        "value": "Czech Republic"
      },
      "value": null,
      "decimal": "1",
      "date": "2000"
    },
    {
      "indicator": {
        "value": "Central government debt, total (% of GDP)"
      },
      "country": {
        "id": "CZ",
        "value": "Czech Republic"
      },
      "value": "16.6567773464055",
      "decimal": "1",
      "date": "2010"
    }
  ]
]""", result)