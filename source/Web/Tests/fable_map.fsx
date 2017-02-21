#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"

open Fable.Core
open Fable.Import
open System
open Fable.Core.JsInterop
module R = Fable.Helpers.React
open R.Props

[<Emit("google.maps.MapTypeId.TERRAIN")>]
let terrain() : obj = 
    failwith "JS only"

[<Emit("google.maps.NavigationControlStyle.SMALL")>]
let small() : obj = 
    failwith "JS only"

[<Emit("new google.maps.LatLng($0, $1)")>]
let LatLng(lat: double) (lng:double): obj =
    failwith "JS only"

[<Emit("new google.maps.Map($0, $1)")>]
let GoogleMap(mapHolder:obj) (options:obj) : unit = 
    failwith "JS only"


type [<Pojo>] MapViewModel  =
    { map : string }

type [<Pojo>] MapState = { map : obj }

type MapView(props) =
    inherit React.Component<MapViewModel, MapState>(props)    
    member val mapHolder = R.div [ ClassName "jumbotron"] [ ]    

    member this.componentDidMount (_) =
        this.Initialize()

    member this.Initialize() =
        let initialLatLng = LatLng (0.0) (0.0)
        let options = createObj [
                            "center" ==> initialLatLng
                            "zoom" ==> 14
                            "mapTypeId" ==>  terrain() //google.maps.MapTypeId.TERRAIN
                            "mapTypeControl" ==> true
                            "navigationControlOptions" ==> createObj 
                                                ["style" ==>  small()] //google.maps.NavigationControlStyle.SMALL
                            ]

        let map = GoogleMap (Browser.document.getElementsByClassName("jumbotron").[0]) (options)
        this.setState({map = map})
    
    member this.render () =        
        // The React helper defines a simple DSL to build HTML elements.
        // For more info about transforming F# unions to JS option objects:
        // https://fable-compiler.github.io/docs/interacting.html#KeyValueList-attribute
        // <div id="mapholder" class="jumbotron" style="padding-top:0px;padding-bottom:0px"></div>
        this.mapHolder