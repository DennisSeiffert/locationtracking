var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Any, extendInfo, compareRecords, equalsRecords } from "fable-core/Util";
import { createElement, Component } from "react";
import { scale, svg as svg_1 } from "d3";
import * as d3 from "d3";
import { format } from "fable-core/String";
import { map, reduce } from "fable-core/Seq";
import { map as map_1 } from "fable-core/List";
import List from "fable-core/List";
import { LocationTracker, TrackVisualization } from "./fable_domainModel";
import { createConnector, withStateMapper, withDispatchMapper, withProps, buildComponent } from "fable-reactredux/Fable.Helpers.ReactRedux";
export var Margin = function () {
    function Margin(top, right, left, bottom) {
        _classCallCheck(this, Margin);

        this.top = top;
        this.right = right;
        this.left = left;
        this.bottom = bottom;
    }

    _createClass(Margin, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_elevation.Margin",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    top: "number",
                    right: "number",
                    left: "number",
                    bottom: "number"
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsRecords(this, other);
        }
    }, {
        key: "CompareTo",
        value: function (other) {
            return compareRecords(this, other);
        }
    }]);

    return Margin;
}();
setType("Fable_elevation.Margin", Margin);
export var ChartDimension = function () {
    function ChartDimension(margin, svgWidth, svgHeight, leftAxisSpace, chartWidth, chartHeight, xAxisWidth) {
        _classCallCheck(this, ChartDimension);

        this.margin = margin;
        this.svgWidth = svgWidth;
        this.svgHeight = svgHeight;
        this.leftAxisSpace = leftAxisSpace;
        this.chartWidth = chartWidth;
        this.chartHeight = chartHeight;
        this.xAxisWidth = xAxisWidth;
    }

    _createClass(ChartDimension, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "Fable_elevation.ChartDimension",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    margin: Margin,
                    svgWidth: "number",
                    svgHeight: "number",
                    leftAxisSpace: "number",
                    chartWidth: "number",
                    chartHeight: "number",
                    xAxisWidth: "number"
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsRecords(this, other);
        }
    }, {
        key: "CompareTo",
        value: function (other) {
            return compareRecords(this, other);
        }
    }]);

    return ChartDimension;
}();
setType("Fable_elevation.ChartDimension", ChartDimension);
export var ElevationChart = function (_Component) {
    _inherits(ElevationChart, _Component);

    _createClass(ElevationChart, [{
        key: _Symbol.reflection,
        value: function () {
            return extendInfo(ElevationChart, {
                type: "Fable_elevation.ElevationChart",
                interfaces: [],
                properties: {}
            });
        }
    }]);

    function ElevationChart(props) {
        _classCallCheck(this, ElevationChart);

        var _this = _possibleConstructorReturn(this, (ElevationChart.__proto__ || Object.getPrototypeOf(ElevationChart)).call(this, props));

        return _this;
    }

    _createClass(ElevationChart, [{
        key: "shouldComponentUpdate",
        value: function (nextprops, nextState) {
            return nextprops.CurrentTrack.ElevationPoints.length > 0;
        }
    }, {
        key: "componentDidMount",
        value: function (_arg1) {
            this.initializeChart();
        }
    }, {
        key: "componentDidUpdate",
        value: function (prevProps, prevState) {
            this.renderChart();
        }
    }, {
        key: "onMouseOverHandler",
        value: function (index) {
            var geoPoint = this.props.CurrentTrack.getGeoPointFromElevationDataIndex(index);
            this.props.OnShowElevationMarker(geoPoint);
        }
    }, {
        key: "onTouchMove",
        value: function (e) {
            var xy = d3.touches(e.target)[0];
            var xPos = xy[0];
            var yPos = xy[1];
            var dimensions = this.updateDimensions(window.innerWidth);
            this.state.speedMarker.attr("x1", xPos).attr("y1", yPos).attr("x2", dimensions.xAxisWidth).attr("y2", yPos).classed("visible", true);
            this.state.elevationMarker.attr("x1", 0).attr("y1", yPos).attr("x2", xPos).attr("y2", yPos).classed("visible", true);
        }
    }, {
        key: "getGeoPointFromElevationDataIndex",
        value: function (index) {
            var meters = index / this.props.CurrentTrack.Points.length * this.props.CurrentTrack.totalDistanceInMeters();
            var markerPointIndex = this.props.CurrentTrack.getIndexOfNearestPoint(meters);
            var geoPoint = this.props.CurrentTrack.getPointAt(markerPointIndex);
            return geoPoint;
        }
    }, {
        key: "toKm",
        value: function (meters) {
            return meters / 1000;
        }
    }, {
        key: "addAxes",
        value: function (state, xAxisWidth, chartHeight) {
            var axes = state.chartWrapper.append("g");
            axes.append("g").attr("class", "x axis").attr("transform", format("translate(0, {0})", String(chartHeight))).call(state.xAxis);
            axes.append("g").attr("class", "y axis").call(state.yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Elevation (m)");
            return axes.append("g").attr("class", "ySpeed axis").attr("transform", format("translate({0}, 0)", xAxisWidth)).call(state.ySpeedAxis).append("text").attr("transform", "rotate(-90)").attr("y", 70).style("text-anchor", "end").text("Speed (km/h)");
        }
    }, {
        key: "drawPaths",
        value: function (state, dimensions) {
            var _this2 = this;

            state.x.range(new Float64Array([0, dimensions.xAxisWidth]));
            state.y.range(new Float64Array([dimensions.chartHeight, 0]));
            state.ySpeed.range(new Float64Array([dimensions.chartHeight, 0]));
            var maxXValue = this.toKm(this.props.CurrentTrack.totalDistanceInMeters());
            state.x.domain(new Float64Array([0, maxXValue]));
            state.y.domain(new Float64Array([0, reduce(function (x, y) {
                return Math.max(x, y);
            }, Float64Array.from(map(function (d) {
                return d.elevation;
            }, this.props.CurrentTrack.ElevationPoints)))]));
            state.ySpeed.domain(new Float64Array([0, reduce(function (x, y) {
                return Math.max(x, y);
            }, map_1(function (d) {
                return d.speed * 3.6;
            }, this.props.CurrentTrack.Points))]));
            var bars = state.chartWrapper.selectAll(".elevationbar").data(this.props.CurrentTrack.ElevationPoints);
            bars.attr("x", function (data, _arg2, _arg1) {
                return state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered));
            }).attr("y", function (data, _arg4, _arg3) {
                return state.y(data.elevation);
            }).attr("width", function (data, _arg6, _arg5) {
                return (state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index + 1).distanceCovered)) < state.x.range()[1] ? state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index + 1).distanceCovered)) : state.x.range()[1]) - state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered));
            }).attr("height", function (data, i, j) {
                return dimensions.chartHeight - state.y(data.elevation);
            });
            bars.enter().append("rect").attr("class", "elevationbar").attr("x", function (data, _arg8, _arg7) {
                return state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered));
            }).attr("y", function (data, _arg10, _arg9) {
                return state.y(data.elevation);
            }).attr("width", function (data, _arg12, _arg11) {
                return (state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index + 1).distanceCovered)) < state.x.range()[1] ? state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index + 1).distanceCovered)) : state.x.range()[1]) - state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered));
            }).attr("height", function (data, i, j) {
                return dimensions.chartHeight - state.y(data.elevation);
            }).on("mouseover", function (data, i, j) {
                _this2.onMouseOverHandler(data.index);

                return d3.select(event.currentTarget).attr("fill", "").classed("active", true);
            }).on("mouseout", function (data, _arg14, _arg13) {
                return d3.select(event.currentTarget).attr("fill", "").classed("active", false);
            });
            bars.exit().remove();
            state.xAxis.scale(state.x);
            state.yAxis.scale(state.y);
            state.ySpeedAxis.scale(state.ySpeed);
            var lines = state.chartWrapper.selectAll(".line").data(Array.from(this.props.CurrentTrack.Points));
            var line = svg_1.line().x(function (d, _arg15) {
                return state.x(_this2.toKm(d.distanceCovered));
            }).y(function (d, _arg16) {
                return state.ySpeed(d.speed * 3.6);
            }).interpolate('monotone');
            lines.attr("d", line(Array.from(this.props.CurrentTrack.Points)));
            return lines.enter().append("path").classed("line", true);
        }
    }, {
        key: "renderChart",
        value: function () {
            var dimensions = this.updateDimensions(window.innerWidth);
            {
                this.drawPaths(this.state, dimensions);
            }
            this.state.svg.attr("width", dimensions.svgWidth).attr("height", dimensions.svgHeight);
            this.state.chartWrapper.attr("transform", "translate(" + String(dimensions.margin.left) + "," + String(dimensions.margin.top) + ")");
            this.state.svg.select(".x.axis").attr("transform", "translate(0," + String(dimensions.chartHeight) + ")").call(this.state.xAxis);
            this.state.svg.select(".y.axis").call(this.state.yAxis);
            this.state.svg.select(".ySpeed.axis").attr("transform", "translate(" + String(dimensions.xAxisWidth) + ", 0)").call(this.state.ySpeedAxis);
        }
    }, {
        key: "initializeChart",
        value: function () {
            var _this3 = this;

            var dimensions = this.updateDimensions(window.innerWidth);
            var svg = d3.select(".elevation_chart").append("svg").attr("width", dimensions.svgWidth).attr("height", dimensions.svgHeight);
            var touchScale = scale.linear().domain(new Float64Array([0, dimensions.xAxisWidth])).range(new Float64Array([0, this.props.CurrentTrack.Points.length - 1])).clamp(true);
            var maxXValue = this.toKm(this.props.CurrentTrack.totalDistanceInMeters());
            var x = scale.linear().range(new Float64Array([0, dimensions.xAxisWidth])).domain(new Float64Array([0, maxXValue]));
            var y = scale.linear().range(new Float64Array([dimensions.chartHeight, 0])).domain(new Float64Array([0, reduce(function (x, y) {
                return Math.max(x, y);
            }, Float64Array.from(map(function (d) {
                return d.elevation;
            }, this.props.CurrentTrack.ElevationPoints)))]));
            var ySpeed = scale.linear().range(new Float64Array([dimensions.chartHeight, 0])).domain(new Float64Array([0, reduce(function (x, y) {
                return Math.max(x, y);
            }, map_1(function (d) {
                return d.speed * 3.6;
            }, this.props.CurrentTrack.Points))]));
            var chartWrapper = svg.append("g").attr("transform", "translate(" + String(dimensions.margin.left) + "," + String(dimensions.margin.top) + ")").on("touchmove", function (data, _arg18, _arg17) {
                _this3.onTouchMove(event);

                return 0;
            });

            var state = function () {
                var touchScale_1 = scale.linear().domain(new Float64Array([0, dimensions.xAxisWidth])).range(new Float64Array([0, _this3.props.CurrentTrack.Points.length - 1])).clamp(true);
                return {
                    x: x,
                    y: y,
                    ySpeed: ySpeed,
                    touchScale: touchScale_1,
                    xAxis: svg_1.axis().scale(x).orient("bottom").innerTickSize(-dimensions.chartHeight).outerTickSize(0).tickPadding(10),
                    yAxis: svg_1.axis().scale(y).orient("left").innerTickSize(-dimensions.chartWidth).outerTickSize(0).tickPadding(10),
                    ySpeedAxis: svg_1.axis().scale(ySpeed).orient("right").innerTickSize(-dimensions.chartWidth).outerTickSize(0).tickPadding(10),
                    svg: svg,
                    chartWrapper: chartWrapper,
                    speedMarker: chartWrapper.append("line").classed("speedmarker", true),
                    elevationMarker: chartWrapper.append("line").classed("elevationmarker", true)
                };
            }();

            var axes = this.addAxes(state, dimensions.xAxisWidth, dimensions.chartHeight);
            this.drawPaths(state, dimensions);
            this.setState(state);
        }
    }, {
        key: "updateDimensions",
        value: function (winWidth) {
            var dimensions = new ChartDimension(new Margin(20, 40, 40, 40), winWidth - 40, 300, 40, 0, 0, 0);
            var xAxisWidth = dimensions.svgWidth - dimensions.margin.left - dimensions.margin.right - dimensions.leftAxisSpace;
            var chartWidth = dimensions.svgWidth - dimensions.margin.left - dimensions.margin.right;
            var chartHeight = dimensions.svgHeight - dimensions.margin.top - dimensions.margin.bottom;
            return new ChartDimension(dimensions.margin, dimensions.svgWidth, dimensions.svgHeight, dimensions.leftAxisSpace, chartWidth, chartHeight, xAxisWidth);
        }
    }, {
        key: "render",
        value: function () {
            return createElement("div", {
                className: "elevation_chart"
            });
        }
    }]);

    return ElevationChart;
}(Component);
setType("Fable_elevation.ElevationChart", ElevationChart);

function mapStateToProps(state, ownprops) {
    return {
        CurrentTrack: state.Visualization,
        OnShowElevationMarker: ownprops.OnShowElevationMarker
    };
}

function mapDispatchToProps(dispatch, ownprops) {
    var OnShowElevationMarker = function OnShowElevationMarker(trackingPoint) {};

    return {
        CurrentTrack: ownprops.CurrentTrack,
        OnShowElevationMarker: OnShowElevationMarker
    };
}

function setDefaultProps(ownprops) {
    return {
        CurrentTrack: new TrackVisualization("", new List()),
        OnShowElevationMarker: function OnShowElevationMarker(trackingPoint) {}
    };
}

export var createElevationViewComponent = buildComponent(function (c) {
    return withProps(function (ownprops) {
        return setDefaultProps(ownprops);
    }, c);
}(function (c) {
    return withDispatchMapper(function (dispatch) {
        return function (ownprops) {
            return mapDispatchToProps(dispatch, ownprops);
        };
    }, c);
}(function (c) {
    return withStateMapper(function (state) {
        return function (ownprops) {
            return mapStateToProps(state, ownprops);
        };
    }, c);
}(createConnector()))), {
    TComponent: ElevationChart,
    TProps: Any,
    TCtx: Any,
    TState: LocationTracker
});
//# sourceMappingURL=fable_elevation.js.map