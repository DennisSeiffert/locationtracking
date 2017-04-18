#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"
#r "node_modules/fable-redux/Fable.Redux.dll"
#r "node_modules/fable-reactredux/Fable.ReactRedux.dll"
#r "node_modules/fable-reduxthunk/Fable.ReduxThunk.dll"
#load "fable_Commands.fsx"
open Commands
#load "fable_domainModel.fsx"
open Fable_domainModel
#load "fable_backend.fsx"
open Backend

open Fable.Core
open Fable.Import
open System
open Fable.Core.JsInterop
module R = Fable.Helpers.React
open R.Props
open Fable.Helpers.ReactRedux
open Fable.Helpers.ReduxThunk

let jq = importDefault<obj> "jquery"

type [<Pojo>] NavigationViewState = 
    { 
        trackingIdentifier: string
        observationIdentifier : string
        SelectedTrack : string
        beginDateTimeLocal : DateTime
        endDateTimeLocal : DateTime
        VisualizeRecordedTracks : string               
    }

type [<Pojo>] ModelViewProps = {
    onLoadTracks : unit -> unit 
    onBeginTracking : string -> unit
    onStopTracking : string -> unit
    onLoadTrackingPoints : DateTime * DateTime * string -> unit
    onClearTrackingPoints : unit -> unit  
    onObserve : string -> unit
    onImportTrackingFiles : Browser.File[] -> unit   
    Tracks : Track List
}

[<KeyValueList>]
type AdditionalHtmlAttr = 
    |[<CompiledName("data-toggle")>]DataToggle of string 
    |[<CompiledName("data-target")>]DataTarget of string
    |[<CompiledName("aria-label")>]AriaLabel of string
    |[<CompiledName("aria-haspopup")>]AriaHasPopup of string
    |[<CompiledName("aria-expanded")>]AriaExpanded of string
    interface IHTMLProp

let buildUniqueIdentifier t =
    String.Join("", t.name, t.mintimestamp.ToString())

type NavigationView(props) =
    inherit React.Component<ModelViewProps, NavigationViewState>(props)      
    do base.setInitState({ 
                            trackingIdentifier = ""
                            SelectedTrack = ""
                            observationIdentifier = ""
                            beginDateTimeLocal = DateTime.Now
                            endDateTimeLocal = DateTime.Now
                            VisualizeRecordedTracks = "Visualize Recorded Tracks"        
                        })

    member this.componentDidMount (_) =
        this.props.onLoadTracks()
    member this.onBeginTracking(_) = 
        this.props.onBeginTracking this.state.trackingIdentifier

    member this.onStopTracking(_) =         
        this.props.onStopTracking this.state.trackingIdentifier

    member this.onBeginDateTimeLocalChanged(e: React.SyntheticEvent) = 
        this.setState(
            { this.state with
                beginDateTimeLocal = unbox e.target?value                
            })

    member this.onEndDateTimeLocalChanged(e: React.SyntheticEvent) = 
        this.setState(
            { this.state with                
                endDateTimeLocal = unbox e.target?value                
            })

    member this.onSelectTrackingFiles(e: React.FormEvent) = 
        let result = box e.target?files        
        this.props.onImportTrackingFiles(result :?> Browser.File[])

    member this.onTrackSelected(e: React.SyntheticEvent) =
        let selectedTrackName = unbox e.currentTarget?value
        let selectedTrack = this.props.Tracks |> List.find (fun i -> buildUniqueIdentifier i = selectedTrackName)        
        this.setState(
            { this.state with                
                SelectedTrack = selectedTrack.name
                beginDateTimeLocal = selectedTrack.mintimestamp                
                endDateTimeLocal = selectedTrack.maxtimestamp
            })
        let children = jq $ (e.currentTarget?parentNode?children) 
        children?removeClass("active") |> ignore
        let selectedbutton = jq $ (e.currentTarget) 
        selectedbutton?addClass("active") |> ignore 
        this.props.onLoadTrackingPoints(selectedTrack.mintimestamp, selectedTrack.maxtimestamp, selectedTrack.name)

    member this.onObservationIdentifierChanged (e: React.SyntheticEvent) = 
        this.setState({this.state with observationIdentifier = string (e.target?value) })

    member this.onObserve(e: React.SyntheticEvent) = 
        this.props.onObserve this.state.observationIdentifier

    member this.onLoadTrackingPoints(_) =
        this.props.onLoadTrackingPoints(this.state.beginDateTimeLocal, this.state.endDateTimeLocal, this.state.SelectedTrack)

    member this.onClearTrackingPoints(_) = 
        this.props.onClearTrackingPoints()
    member this.getTrackSelection() = 
        R.div [ClassName "list-group track-selection-list"]
                // R.a [ClassName "list-group-item"; Href "#"; DataToggle "dropdown";
                //             OnClick (fun mouseEvent -> mouseEvent.preventDefault()
                //                                        mouseEvent.stopPropagation() |> ignore);                             
                //             ][
                //     unbox (if String.IsNullOrEmpty(this.state.SelectedTrack) then "Select Track ..." else this.state.SelectedTrack)
                //     R.span [ClassName "caret"][]
                // ]
                // R.ul [ClassName "dropdown-menu sub-menu"; Style [Height "200px"; Overflow "Auto"; ] ]                    
                    (this.props.Tracks
                    |> List.map (fun t -> R.button [ClassName "list-group-item"; OnClick this.onTrackSelected; Value (U2.Case1 (buildUniqueIdentifier t))][
                                                    R.h4 [] [unbox t.name]
                                                    R.h6 [] [unbox(t.mintimestamp.ToString())]
                                                    R.h6 [] [unbox(t.maxtimestamp.ToString())]                                                                                                
                                                ]        
                    ))                                
  

        // R.select [ 
        //             Id "trackSelection"                                                           
        //             Value (U2.Case1 this.state.SelectedTrack)
        //             OnClick (fun mouseEvent -> mouseEvent.stopPropagation() |> ignore)
        //             OnChange this.onTrackSelected                                                                                                                                          
        //          ] (this.props.Tracks
        //            |> List.map (fun t -> R.option [                                                    
        //                                              Value (U2.Case1 t.name)
        //                                            ] [ unbox t.name]))

    member this.render () =

        R.div [ ClassName "masthead clearfix" ] [
            R.div [ ClassName "inner"] [
                R.nav [ ClassName "navbar navbar-default"] [
                    R.div [ClassName "container-fluid" ] [
                        R.div [ClassName "navbar-header"] [
                            R.button [ 
                                Type "button"
                                ClassName "navbar-toggle collapsed"
                                DataToggle "collapse" 
                                DataTarget "#bs-example-navbar-collapse-1"
                                ] [
                                    R.span [ClassName "sr-only" ] []
                                    R.span [ClassName "icon-bar" ] []
                                    R.span [ClassName "icon-bar" ] []
                                    R.span [ClassName "icon-bar" ] []
                                ]
                        ]
                        R.div [ 
                            Id "bs-example-navbar-collapse-1"
                            ClassName "collapse navbar-collapse"] [ 
                                R.ul [ ClassName "nav navbar-nav"] [ 
                                    // R.li [ ] [ 
                                    //     R.form [ 
                                    //         ClassName "form-horizontal"
                                    //         Style [ 
                                    //             MarginLeft "15px" 
                                    //             MarginRight "15px"  ]] [ 
                                    //             R.div [ ClassName "form-group" ] [ 
                                    //                 R.button [ 
                                    //                     OnClick this.onBeginTracking
                                    //                     ClassName "btn btn-default btn-succes active" ] [ 
                                    //                         unbox "Track..."
                                    //                 ]
                                    //                 R.button [ 
                                    //                     OnClick this.onStopTracking
                                    //                     ClassName "btn btn-default btn-danger" ] [ 
                                    //                         unbox "Stop Tracking"
                                    //                 ]
                                    //             ]
                                    //             R.div [ ClassName "form-group" ] [
                                    //                 R.label [ ClassName "col-md-4  col-sm-4 col-xs-4 control-label" ] [ unbox "Tracking Id" ]
                                    //                 R.div [ ClassName "col-md-8  col-sm-8 col-xs-11"; AriaLabel "..." ] [
                                    //                     R.input [ 
                                    //                         Type "text" 
                                    //                         Id "trackIdentifier" 
                                    //                         Value (U2.Case1 this.state.trackingIdentifier)
                                    //                     ] []                                                    
                                    //                 ]                                                    
                                    //             ]
                                    //     ]
                                    // ]
                                    R.li [ Role "presentation"; ClassName "dropdown" ] [ 
                                       R.a [ ClassName "dropdown-toggle"; DataToggle "dropdown"; Href "#"; Role "button"; 
                                             AriaHasPopup "true"; AriaExpanded "false"; OnClick (fun e -> 
                                                                                        e.stopPropagation()
                                                                                        e.preventDefault() |> ignore) ] [ 
                                            unbox this.state.VisualizeRecordedTracks
                                            R.span [ClassName "caret"] [ ]
                                       ]
                                       R.ul [ ClassName "dropdown-menu"] [ 
                                           R.li [] [ 
                                               R.div [ ClassName "container-fluid" ] [ 
                                                //    R.div [ ClassName "row" ] [ 
                                                //        R.label [ ] [ unbox "from" ]
                                                //        R.input [ Type "datetime"
                                                //                  Value (U2.Case1(this.state.beginDateTimeLocal.ToString()))
                                                //                  OnChange this.onBeginDateTimeLocalChanged ] [ ]
                                                //    ]
                                                //    R.div [ ClassName "row" ] [ 
                                                //        R.label [ ] [ unbox "until" ]
                                                //        R.input [ Type "datetime"
                                                //                  Value (U2.Case1(this.state.endDateTimeLocal.ToString()))
                                                //                  OnChange this.onEndDateTimeLocalChanged ] [ ]
                                                //    ]
                                                   R.div [ ClassName "row" ] [ 
                                                       this.getTrackSelection()
                                                   ]
                                                   R.div [ ClassName "row" ] [ 
                                                    //    R.button [ 
                                                    //        OnClick this.onLoadTrackingPoints
                                                    //    ] [ unbox "Load Track Points"]
                                                       R.input [ 
                                                           Type "file"
                                                           OnChange this.onSelectTrackingFiles
                                                           ] []
                                                    //    R.button [ 
                                                    //        OnClick this.onClearTrackingPoints
                                                    //    ] [ unbox "Clear"]
                                                   ]
                                               ]
                                           ]
                                       ]
                                    ]
                                    R.li [ Role "presentation"; ClassName "dropdown"] [
                                        R.a [ClassName "dropdown-toggle"; DataToggle "dropdown"; Href "#";
                                                         Role "button"; AriaHasPopup "true"; AriaExpanded "false"] [
                                                            R.label [ ] [ unbox "Observation" ] //<span class="caret"></span>
                                                         ]                                                                                        
                                        R.ul [ClassName "dropdown-menu"] [
                                                R.li [] [
                                                    R.div [] [
                                                        R.div [ClassName "container-fluid"] [
                                                            R.div [ClassName "row"] [
                                                                R.label[] [unbox "observe by identifer:"]
                                                                R.input [Type "text"
                                                                         Value  (U2.Case1(this.state.observationIdentifier))
                                                                         OnChange this.onObservationIdentifierChanged][]
                                                            ]
                                                            R.div [ClassName "row"] [
                                                                R.button [OnClick this.onObserve ] [unbox "Observe"]
                                                            ]                                                            
                                                        ]
                                                    ]
                                                ]
                                            ]             
                                                                                                                        
                                    ]                                    
                                ]
                        ]
                    ]
                ]
            ]
        ]
                        
        // let className =
        //     classNames(
        //         createObj [
        //             "completed" ==> this.props.todo.completed
        //             "editing" ==> this.props.editing
        //         ])
        // // The React helper defines a simple DSL to build HTML elements.
        // // For more info about transforming F# unions to JS option objects:
        // // https://fable-compiler.github.io/docs/interacting.html#KeyValueList-attribute
        // R.li [ ClassName className ] [
        //     R.div [ ClassName "view" ] [
        //         R.input [
        //             ClassName "toggle"
        //             Type "checkbox"
        //             Checked this.props.todo.completed
        //             OnChange this.props.onToggle  
        //         ] []
        //         R.label [ OnDoubleClick this.handleEdit ]
        //                 [ unbox this.props.todo.title ]
        //         R.button [
        //             ClassName "destroy"
        //             OnClick this.props.onDestroy ] [ ]
        //     ]
        //     R.input [
        //         ClassName "edit"
        //         Ref (fun x -> editField <- Some x)
        //         Value (U2.Case1 this.state.editText)
        //         OnBlur this.handleSubmit
        //         OnChange this.handleChange
        //         OnKeyDown this.handleKeyDown
        //     ] []
        // ]

let private mapStateToProps (state : LocationTracker) (ownprops : ModelViewProps) =
    { ownprops with
        Tracks = state.Tracks        
    }

let private mapDispatchToProps (dispatch : ReactRedux.Dispatcher) ownprops =
    { ownprops with
        onLoadTracks = fun () -> dispatch <| asThunk (Backend.getAllTracks)   
        onLoadTrackingPoints = fun(start, ``end``, trackName) -> dispatch <| asThunk (Backend.loadTrackingPoints(start, ``end``, trackName))
        onClearTrackingPoints = fun () -> dispatch(Commands.ClearTrackingPoints)
        onObserve = fun observationIdentifier -> dispatch(Commands.Observe observationIdentifier)
        onImportTrackingFiles = fun filenames -> dispatch <| asThunk (Backend.parseTrackingPointsFromGpx filenames)
    }

let private setDefaultProps (ownprops : ModelViewProps) =
    { ownprops with
         Tracks = List.Empty }         

let createNavigationViewComponent =
    createConnector ()
    |> withStateMapper mapStateToProps
    |> withDispatchMapper mapDispatchToProps
    |> withProps setDefaultProps
    |> buildComponent<NavigationView, _, _, _>