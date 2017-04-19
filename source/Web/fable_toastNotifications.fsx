#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-react/Fable.React.dll"
#r "node_modules/fable-redux/Fable.Redux.dll"
#r "node_modules/fable-reactredux/Fable.ReactRedux.dll"
#r "node_modules/fable-reduxthunk/Fable.ReduxThunk.dll"
#load "fable_domainModel.fsx"
open Fable_domainModel
#load "fable_Commands.fsx"



open Fable.Core
open Fable.Import
open System
open Fable.Core.JsInterop
open Fable.Helpers.Redux
open Fable.Helpers.ReactRedux

module R = Fable.Helpers.React
open R.Props
// domain models


type [<Import("*","bootstrap-notify")>] Toast = 
            static member notify(content : string, options: obj option): unit = jsNative

[<Emit("jQuery.notify($0)")>]
let postNotification content = Toast.notify (content, None)

type [<Pojo>] MainViewProps = {
    Error : string option
    Info : string option
}

type ToastNotifications(props) = 
    inherit React.Component<MainViewProps, obj>(props)

    // member this.componentDidUpdate prevProps prevState =                 
    //     this.render()

    member this.render () = 
        if this.props.Error <> None then
            postNotification this.props.Error.Value
        if this.props.Info <> None then
            postNotification this.props.Info.Value
        R.div [Id "notifications";  ClassName "toastNotifications"] []

let private mapStateToProps (state : LocationTracker) (ownprops : MainViewProps) =
    { ownprops with
        Error = state.Error
        Info = state.Info
    }    

let createToastNotifications =
    createConnector ()
    |> withStateMapper mapStateToProps
    |> buildComponent<ToastNotifications, _, _, _>   