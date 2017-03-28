#r "node_modules/fable-core/Fable.Core.dll"
#r "node_modules/fable-react/Fable.React.dll"
#r "node_modules/fable-powerpack/Fable.PowerPack.dll"
#r "node_modules/fable-redux/Fable.Redux.dll"
#r "node_modules/fable-reactredux/Fable.ReactRedux.dll"
#r "node_modules/fable-reduxthunk/Fable.ReduxThunk.dll"
#load "node_modules/fable-import-d3/Fable.Import.D3.fs"
#load "fable_domainModel.fsx"
open Fable.Core
open Fable.React
open Fable.Import
open Fable.PowerPack
open System
open Fable_domainModel
open Fable.Core.JsInterop
open Fable.Helpers.ReactRedux

module R = Fable.Helpers.React
open R.Props

type [<Pojo>] ElevationProps = {    
    CurrentTrack : TrackVisualization
}

type Margin = { 
        top: float
        right: float
        left: float
        bottom: float 
    }

type ChartDimension = {
          margin : Margin
          svgWidth : float
          svgHeight : float
          leftAxisSpace : float
          chartWidth : float
          chartHeight : float
          xAxisWidth : float
        }

type [<Pojo>] ElevationViewState = {
    x : D3.Scale.Linear<float,float>
    y : D3.Scale.Linear<float,float>
    ySpeed : D3.Scale.Linear<float,float>
    touchScale : D3.Scale.Linear<float,float>
    xAxis : D3.Svg.Axis
    yAxis : D3.Svg.Axis
    ySpeedAxis : D3.Svg.Axis
    svg : D3.Selection<obj>
    chartWrapper :  D3.Selection<obj>    
    speedMarker : D3.Selection<obj>
    elevationMarker : D3.Selection<obj>    
}



type ElevationChart(props) = 
    inherit React.Component<ElevationProps, ElevationViewState>(props)


    member this.componentDidMount (_) =
        this.initializeChart()        
    member this.onMouseOverHandler(index) =
        let geoPoint = this.props.CurrentTrack.getGeoPointFromElevationDataIndex index
        ignore()
        // if this.props.CurrentTrack.hasElevationMarker() then 
        //     showPosition(geoPoint.latitude, geoPoint.longitude, this.currentTrack.elevationMarker);
  
  

    member this.onTouchMove (e : Browser.Event) =
        let xy = D3.Globals.touches(e.target).[0]
        let xPos = fst(xy)
        let yPos = snd(xy)
        let dimensions = this.updateDimensions(Browser.window.innerWidth)

        this.state.speedMarker
          .attr("x1", xPos)
          .attr("y1", yPos)
          .attr("x2", dimensions.xAxisWidth)
          .attr("y2", yPos)
          .classed("visible", true)
        |> ignore

        this.state.elevationMarker
          .attr("x1", 0)
          .attr("y1", yPos)
          .attr("x2", xPos)
          .attr("y2", yPos)
          .classed("visible", true)
        |> ignore
  

    member  this.getGeoPointFromElevationDataIndex(index) =   
        let meters = double index / double this.props.CurrentTrack.Points.Length * this.props.CurrentTrack.totalDistanceInMeters()
        let markerPointIndex = this.props.CurrentTrack.getIndexOfNearestPoint(meters)
        let geoPoint = this.props.CurrentTrack.getPointAt(markerPointIndex)
        geoPoint
  

    member this.toKm(meters : double) = meters / 1000.0    



    member this.addAxes(state, xAxisWidth : float, chartHeight : float) = 
        let axes = state.chartWrapper.append("g")

        axes.append("g")
          .attr("class", box "x axis")
          .attr("transform", String.Format(@"translate(0, {0})",  chartHeight.ToString()))
          .call(state.xAxis) |> ignore

        axes.append("g")
          .attr("class", box "y axis")
          .call(state.yAxis)
          .append("text")
          .attr("transform", box "rotate(-90)")
          .attr("y", 6)
          .attr("dy", box ".71em")
          .style("text-anchor", D3.Primitive.Case2 "end")
          .text("Elevation (m)") |> ignore

        axes.append("g")
          .attr("class",D3.Primitive.Case2 "ySpeed axis")
          .attr("transform", String.Format("translate({0}, 0)", xAxisWidth))
          .call(state.ySpeedAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 70)
          .style("text-anchor", "end")
          .text("Speed (km/h)")          

    member this.drawPaths (state, chartWidth, chartHeight) =     
        let bars = state.chartWrapper.selectAll(".bar").data(Array.ofList this.props.CurrentTrack.Points)
                    |> fun d -> (unbox<D3.Selection.Update<TrackingPoint>> d).enter()
                    |> fun d -> d.append("rect")                        
                                    .attr("class", "elevationbar")
                                    .attr("x",Func<_,_,_,_>(fun data _ _ ->
                                                  state.x.Invoke(this.toKm(this.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered))
                                    ))
                                    .attr("y",Func<_,_,_,_>( fun data _ _ -> state.y.Invoke(data.elevation)))
                                    .attr("width",Func<_,_,_,_>( fun data _ _ ->
                                                      Math.Min(state.x.Invoke(this.toKm(this.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index + 1).distanceCovered)), state.x.range().[1]) -
                                                      state.x.Invoke(this.toKm(this.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered))
                                    ))                                                                    
                                    .attr("height",Func<_,_,_,_>( fun data i j -> chartHeight - state.y.Invoke(data.elevation)))
                                    .on("mouseover", Func<_,_,_,_>( fun data i j ->
                                                                    this.onMouseOverHandler(data.index) 
                                                                    D3.Globals.select("#elevationbar").attr("fill", "").classed("active", true) |> ignore
                                                                    box 0
                                    ))
                                    .on("mouseout",Func<_,_,_,_>( fun data _ _ ->                                                        
                                                        D3.Globals.select("#elevationbar").attr("fill", "").classed("active", false) |> ignore
                                                        box 0
                                    ))

        // let path = state.chartWrapper.append("path").datum(this.props.CurrentTrack.Points).classed("line", true);
        // let line = D3.Svg.Globals.line<TrackingPoint>()
        //                 .x(fun data _ -> state.x.Invoke(this.toKm(data.distanceCovered)))
        //                 .y(fun d _ -> state.ySpeed.Invoke(d.speed * 3.6))
        //                 .interpolate_monotone()                        
        // path.attr("d", line) |> ignore;
        ignore()     

    member this.renderChart() =
        let dimensions = this.updateDimensions(Browser.window.innerWidth);


        //update x and y scales to new dimensions
        //self.xSpeed.range([0, dimensions.xAxisWidth]);
        this.state.x.range([|0.0; dimensions.xAxisWidth|]) |> ignore
        this.state.y.range([|dimensions.chartHeight; 0.0|]) |> ignore
        this.state.ySpeed.range([|dimensions.chartHeight; 0.0|]) |> ignore

        //update svg elements to new dimensions
        this.state.svg
          .attr("width", dimensions.svgWidth) 
          .attr("height", dimensions.svgHeight)|> ignore
        this.state.chartWrapper
            .attr("transform", fun _ _ _ -> "translate(" + dimensions.margin.left.ToString() + "," + dimensions.margin.top.ToString() + ")")
            |> ignore        

        //update the axis and line
        //self.xSpeedAxis.scale(self.xSpeed);
        this.state.xAxis.scale(this.state.x)|> ignore
        this.state.yAxis.scale(this.state.y)|> ignore
        this.state.ySpeedAxis.scale(this.state.ySpeed)|> ignore

        this.state.svg.select(".x.axis")
          .attr("transform", fun _ _ _ ->  "translate(0," + dimensions.chartHeight.ToString() + ")")
          .call(this.state.xAxis)
          |> ignore

        this.state.svg.select(".y.axis")
          .call(this.state.yAxis)
          |> ignore

        this.state.svg.select(".ySpeed.axis")
          .attr("transform", fun _ _ _ -> "translate(" + dimensions.xAxisWidth.ToString() + ", 0)")
          .call(this.state.ySpeedAxis)
          |> ignore

        this.state.chartWrapper.selectAll(".elevationbar")
          .attr("x", fun d -> this.state.x.Invoke(this.toKm(this.props.CurrentTrack.getGeoPointFromElevationDataIndex(d.index).distanceCovered)))
          .attr("width", fun d ->
                            Math.Min(this.state.x.Invoke(this.toKm(this.props.CurrentTrack.getGeoPointFromElevationDataIndex(d.index + 1).distanceCovered)), this.state.x.range().[1]) -
                            this.state.x.Invoke(this.toKm(this.props.CurrentTrack.getGeoPointFromElevationDataIndex(d.index).distanceCovered))
          )
          .attr("y", fun d -> this.state.y.Invoke(d.elevation))
          .attr("height", fun d i j -> dimensions.chartHeight - this.state.y.Invoke(d.elevation))

        //this.state.path.attr("d", this.state.line)


    member this.initializeChart() =
        let dimensions = this.updateDimensions(Browser.window.innerWidth);        
        let svg = D3.Globals.select(".elevation_chart").append("svg")
                        .attr("width", D3.Primitive.Case1 dimensions.svgWidth)
                        .attr("height", D3.Primitive.Case1 dimensions.svgHeight)
        let touchScale = D3.Scale.Globals.linear().domain([|0.0; dimensions.xAxisWidth|]).range([|0.0; (float)this.props.CurrentTrack.Points.Length-1.0|]).clamp(true)
        let x = D3.Scale.Globals.linear()
                        .range([|0.0; dimensions.xAxisWidth |])
                        .domain([|0.0; this.props.CurrentTrack.Points |> List.map (fun (d) -> this.toKm(this.getGeoPointFromElevationDataIndex(d.index).distanceCovered)) |> List.max |])
        // this.xSpeed = d3.time.scale().range([0, dimensions.xAxisWidth])
        //   .domain(d3.extent(this.currentTrack.points, function (d) { return d.timestamp; }));
        let y = D3.Scale.Globals.linear()
                        .range([|dimensions.chartHeight; 0.0|])
                        .domain([|0.0; this.props.CurrentTrack.Points |> List.map (fun (d) -> d.elevation) |> List.max |])                
        let ySpeed = D3.Scale.Globals.linear()
                        .range([|dimensions.chartHeight; 0.0|])
                        .domain([|0.0; this.props.CurrentTrack.Points |> List.map (fun (d) -> d.speed * 3.6) |> List.max |])
        let chartWrapper = svg
                            .append("g")
                            // (D3.Globals.transform("").translate(dimensions.margin.left, dimensions.margin.top))
                            .attr("transform",  "translate(" + dimensions.margin.left.ToString() + "," + dimensions.margin.top.ToString() + ")")
                            .on("touchmove", fun data _ _ -> 
                                                    this.onTouchMove Browser.event 
                                                    box 0 )
        let state =
            {        
                svg = svg
                touchScale = D3.Scale.Globals.linear().domain([|0.0; dimensions.xAxisWidth|]).range([|0.0; ((float)this.props.CurrentTrack.Points.Length)-1.0|]).clamp(true)
                x = x
        // this.xSpeed = d3.time.scale().range([0, dimensions.xAxisWidth])
        //   .domain(d3.extent(this.currentTrack.points, function (d) { return d.timestamp; }));
                y = y
                ySpeed = ySpeed
                xAxis = D3.Svg.Globals.axis().scale(x).orient("bottom")
                            .innerTickSize(-dimensions.chartHeight).outerTickSize(0.0).tickPadding(10.0)
        // this.xSpeedAxis = d3.svg.axis().scale(this.xSpeed).orient('bottom')
        //   .innerTickSize(-dimensions.chartHeight).outerTickSize(0).tickPadding(10);
                yAxis = D3.Svg.Globals.axis().scale(y).orient("left")
                            .innerTickSize(-dimensions.chartWidth).outerTickSize(0.0).tickPadding(10.0)
                ySpeedAxis = D3.Svg.Globals.axis().scale(ySpeed).orient("right")
                                .innerTickSize(-dimensions.chartWidth).outerTickSize(0.0).tickPadding(10.0)                
                chartWrapper = chartWrapper                
                speedMarker = chartWrapper.append("line").classed("speedmarker", true)
                elevationMarker = chartWrapper.append("line").classed("elevationmarker", true)
        }

        let axes = this.addAxes(state, dimensions.xAxisWidth, dimensions.chartHeight)
        this.drawPaths(state, dimensions.chartWidth, dimensions.chartHeight) |> ignore

        this.setState(state)
        // Browser.window.addEventListener("resize",fun () ->
        //                                              this.renderChart()
        //                                              EventListenerOrEventListenerObject.Case1)  

 
    member this.updateDimensions (winWidth : double) =
        let dimensions = {
          margin = { top = 20.0; right = 40.0; left = 40.0; bottom = 40.0 }
          svgWidth =  winWidth - 40.0
          svgHeight =  300.0
          leftAxisSpace = 40.0  
          chartWidth = 0.0
          chartHeight = 0.0
          xAxisWidth = 0.0        
        }
        let xAxisWidth = dimensions.svgWidth - dimensions.margin.left - dimensions.margin.right - dimensions.leftAxisSpace
        {dimensions with 
                chartWidth = dimensions.svgWidth - dimensions.margin.left - dimensions.margin.right
                chartHeight = dimensions.svgHeight - dimensions.margin.top - dimensions.margin.bottom
                xAxisWidth = xAxisWidth}

    member this.render () =                      
        R.div [ ClassName "elevation_chart"] []


let private mapStateToProps (state : LocationTracker) (ownprops : ElevationProps) =
    { ownprops with
        CurrentTrack = state.Visualization        
    }
// let private mapDispatchToProps (dispatch : ReactRedux.Dispatcher) ownprops =
//     { ownprops with
//         onLoadTracks = fun () -> dispatch <| asThunk (Backend.getAllTracks)   
//         onLoadTrackingPoints = fun(start, ``end``, trackName) -> asThunk (Backend.loadTrackingPoints(start, ``end``, trackName)) |> dispatch
//     }

let private setDefaultProps (ownprops : ElevationProps) =
    { ownprops with
         CurrentTrack = new TrackVisualization(String.Empty, List.Empty) }   

let createElevationViewComponent =
    createConnector ()
    |> withStateMapper mapStateToProps    
    |> withProps setDefaultProps
    |> buildComponent<ElevationChart, _, _, _>