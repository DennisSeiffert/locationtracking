#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"

open Fable.Core
open Fable.Import
open System
open Fable.Core.JsInterop
module R = Fable.Helpers.React
open R.Props

type [<Pojo>] NavigationViewModel  =            
    abstract onBeginTracking: string->unit
    abstract onStopTracking: string->unit    
    abstract onLoadTrackingPoints : string -> string -> string -> unit
    abstract onLoadTracks : unit -> unit
    

type [<Pojo>] NavigationViewState = 
    { 
        trackingIdentifier: string
        SelectedTrack : string
        beginDateTimeLocal : string
        endDateTimeLocal : string
        VisualizeRecordedTracks : string        
    }

[<KeyValueList>]
type AdditionalHtmlAttr = 
    |[<CompiledName("data-toggle")>]DataToggle of string 
    |[<CompiledName("data-target")>]DataTarget of string
    |[<CompiledName("aria-label")>]AriaLabel of string
    |[<CompiledName("aria-haspopup")>]AriaHasPopup of string
    |[<CompiledName("aria-expanded")>]AriaExpanded of string
    interface IHTMLProp

type NavigationView(props) as this =
    inherit React.Component<NavigationViewModel, NavigationViewState>(props)      
    do this.setInitState { 
        trackingIdentifier = ""
        SelectedTrack = ""
        beginDateTimeLocal = ""
        endDateTimeLocal = ""
        VisualizeRecordedTracks = "Visualize Recorded Tracks"
        }

    member this.componentDidMount (_) =
        this.props.onLoadTracks()

    member this.onBeginTracking(_) = 
        this.props.onBeginTracking(this.state.trackingIdentifier)

    member this.onStopTracking(_) = 
        this.props.onStopTracking(this.state.trackingIdentifier)    

    member this.onBeginDateTimeLocalChanged(e: React.SyntheticEvent) = 
        this.setState(
            { 
                trackingIdentifier = this.state.trackingIdentifier
                SelectedTrack = this.state.SelectedTrack
                beginDateTimeLocal = unbox e.target?value
                endDateTimeLocal = this.state.endDateTimeLocal
                VisualizeRecordedTracks = this.state.VisualizeRecordedTracks
            })

    member this.onEndDateTimeLocalChanged(e: React.SyntheticEvent) = 
        this.setState(
            { 
                trackingIdentifier = this.state.trackingIdentifier
                SelectedTrack = this.state.SelectedTrack
                beginDateTimeLocal = this.state.beginDateTimeLocal
                endDateTimeLocal = unbox e.target?value
                VisualizeRecordedTracks = this.state.VisualizeRecordedTracks
            })

    member this.onLoadTrackingPoints(_) =
        this.props.onLoadTrackingPoints this.state.beginDateTimeLocal this.state.endDateTimeLocal this.state.SelectedTrack

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
                                    R.li [ ] [ 
                                        R.form [ 
                                            ClassName "form-horizontal"
                                            Style [ 
                                                MarginLeft "15px" 
                                                MarginRight "15px"  ]] [ 
                                                R.div [ ClassName "form-group" ] [ 
                                                    R.button [ 
                                                        OnClick this.onBeginTracking
                                                        ClassName "btn btn-default btn-succes active" ] [ 
                                                            unbox "Track..."
                                                    ]
                                                    R.button [ 
                                                        OnClick this.onStopTracking
                                                        ClassName "btn btn-default btn-danger" ] [ 
                                                            unbox "Stop Tracking"
                                                    ]
                                                ]
                                                R.div [ ClassName "form-group" ] [
                                                    R.label [ ClassName "col-md-4  col-sm-4 col-xs-4 control-label" ] [ unbox "Tracking Id" ]
                                                    R.div [ ClassName "col-md-8  col-sm-8 col-xs-11"; AriaLabel "..." ] [
                                                        R.input [ 
                                                            Type "text" 
                                                            Id "trackIdentifier" 
                                                            Value (U2.Case1 this.state.trackingIdentifier)
                                                        ] []                                                    
                                                    ]                                                    
                                                ]
                                        ]
                                    ]
                                    R.li [ Role "presentation"; ClassName "dropdown" ] [ 
                                       R.a [ ClassName "dropdown-toggle"; DataToggle "dropdown"; Href "#"; Role "button"; AriaHasPopup "true"; AriaExpanded "false" ] [ 
                                            unbox this.state.VisualizeRecordedTracks
                                            R.span [ClassName "caret"] [ ]
                                       ]
                                       R.ul [ ClassName "dropdown-menu"] [ 
                                           R.li [] [ 
                                               R.div [ ClassName "container-fluid" ] [ 
                                                   R.div [ ClassName "row" ] [ 
                                                       R.label [ ] [ unbox "from" ]
                                                       R.input [ Type "datetime-local"
                                                                 Value (U2.Case1 this.state.beginDateTimeLocal)
                                                                 OnChange this.onBeginDateTimeLocalChanged ] [ ]
                                                   ]
                                                   R.div [ ClassName "row" ] [ 
                                                       R.label [ ] [ unbox "until" ]
                                                       R.input [ Type "datetime-local"
                                                                 Value (U2.Case1 this.state.endDateTimeLocal)
                                                                 OnChange this.onEndDateTimeLocalChanged ] [ ]
                                                   ]
                                                   R.div [ ClassName "row" ] [ 
                                                       R.select [ 
                                                           Id "trackSelection"
                                                           Value (U2.Case1 this.state.SelectedTrack )
                                                       ] [ ]
                                                   ]
                                                   R.div [ ClassName "row" ] [ 
                                                       R.button [ 
                                                           OnClick this.onLoadTrackingPoints
                                                       ] [ unbox "Load Track Points"]
                                                   ]
                                               ]
                                           ]
                                       ]
                                    ]
                                    //         <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                                    //         Visualize Recorded Tracks <span class="caret"></span>
                                    //         </a>
                                    //         <ul class="dropdown-menu">
                                    //             <li>
                                    //                 <div class="container-fluid">
                                    //                     <div class="row">
                                    //                         <label>from</label>
                                    //                         <input type="datetime-local" data-bind="value : beginDate" />
                                    //                     </div>
                                    //                     <div class="row">
                                    //                         <label>until</label>
                                    //                         <input type="datetime-local" data-bind="value : endDate" />
                                    //                     </div>
                                    //                     <div class="row">
                                    //                         <!--<label>Tracking Id</label>-->
                                    //                         <select id="trackSelection" data-bind="options: tracksMetadata,
                                    //                             optionsText: 'name',
                                    //                             value: selectedTrack,
                                    //                             optionsCaption: 'Choose...'"></select>
                                    //                         <!--<div class="dropdown">
                                    //                             <button class="btn dropdown-toggle" type="button" data-toggle="dropdown">Tracking Id
                                    //                                 <span class="caret"></span></button>
                                    //                             <ul class="dropdown-menu" role="menu" data-bind="foreach: tracksMetadata">
                                    //                                 <li>
                                    //                                     <a role="menuitem" tabindex="-1" href="#" data-bind="text: name, click: $parent.selectedTrack"></a>
                                    //                                 </li>
                                    //                             </ul>
                                    //                         </div>-->
                                    //                     </div>
                                    //                     <div class="row">
                                    //                         <button onclick="loadTrackingPoints()">Load Track Points</button>
                                    //                     </div>
                                    //                 </div>
                                    //             </li>
                                    //         </ul>
                                    //     </li>
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
