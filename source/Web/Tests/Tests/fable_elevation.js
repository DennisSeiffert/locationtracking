var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Any, extendInfo, compareRecords, equalsRecords } from "fable-core/Util";
import { createElement, Component } from "react";
import { svg as svg_1, scale } from "d3";
import * as d3 from "d3";
import { format } from "fable-core/String";
import { reduce } from "fable-core/Seq";
import { map } from "fable-core/List";
import List from "fable-core/List";
import { LocationTracker, TrackVisualization } from "./fable_domainModel";
import { createConnector, withStateMapper, withProps, buildComponent } from "fable-reactredux/Fable.Helpers.ReactRedux";
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
        key: "componentDidMount",
        value: function (_arg1) {
            this.initializeChart();
        }
    }, {
        key: "onMouseOverHandler",
        value: function (index) {
            var geoPoint = this.props.CurrentTrack.getGeoPointFromElevationDataIndex(index);
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
        value: function (state, chartWidth, chartHeight) {
            var _this2 = this;

            var bars = function (d) {
                return d.append("rect").attr("class", "elevationbar").attr("x", function (data, _arg2, _arg1) {
                    return state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered));
                }).attr("y", function (data, _arg4, _arg3) {
                    return state.y(data.elevation);
                }).attr("width", function (data, _arg6, _arg5) {
                    return (state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index + 1).distanceCovered)) < state.x.range()[1] ? state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index + 1).distanceCovered)) : state.x.range()[1]) - state.x(_this2.toKm(_this2.props.CurrentTrack.getGeoPointFromElevationDataIndex(data.index).distanceCovered));
                }).attr("height", function (data, i, j) {
                    return chartHeight - state.y(data.elevation);
                }).on("mouseover", function (data, i, j) {
                    _this2.onMouseOverHandler(data.index);

                    d3.select("#elevationbar").attr("fill", "").classed("active", true);
                    return 0;
                }).on("mouseout", function (data, _arg8, _arg7) {
                    d3.select("#elevationbar").attr("fill", "").classed("active", false);
                    return 0;
                });
            }(function (d) {
                return d.enter();
            }(state.chartWrapper.selectAll(".bar").data(Array.from(this.props.CurrentTrack.Points))));
        }
    }, {
        key: "renderChart",
        value: function () {
            var _this3 = this;

            var dimensions = this.updateDimensions(window.innerWidth);
            this.state.x.range(new Float64Array([0, dimensions.xAxisWidth]));
            this.state.y.range(new Float64Array([dimensions.chartHeight, 0]));
            this.state.ySpeed.range(new Float64Array([dimensions.chartHeight, 0]));
            this.state.svg.attr("width", dimensions.svgWidth).attr("height", dimensions.svgHeight);
            this.state.chartWrapper.attr("transform", function (_arg11) {
                return function (_arg10) {
                    return function (_arg9) {
                        return "translate(" + String(dimensions.margin.left) + "," + String(dimensions.margin.top) + ")";
                    };
                };
            });
            this.state.xAxis.scale(this.state.x);
            this.state.yAxis.scale(this.state.y);
            this.state.ySpeedAxis.scale(this.state.ySpeed);
            this.state.svg.select(".x.axis").attr("transform", function (_arg14) {
                return function (_arg13) {
                    return function (_arg12) {
                        return "translate(0," + String(dimensions.chartHeight) + ")";
                    };
                };
            }).call(this.state.xAxis);
            this.state.svg.select(".y.axis").call(this.state.yAxis);
            this.state.svg.select(".ySpeed.axis").attr("transform", function (_arg17) {
                return function (_arg16) {
                    return function (_arg15) {
                        return "translate(" + String(dimensions.xAxisWidth) + ", 0)";
                    };
                };
            }).call(this.state.ySpeedAxis);
            return this.state.chartWrapper.selectAll(".elevationbar").attr("x", function (d) {
                return _this3.state.x(_this3.toKm(_this3.props.CurrentTrack.getGeoPointFromElevationDataIndex(d.index).distanceCovered));
            }).attr("width", function (d) {
                return (_this3.state.x(_this3.toKm(_this3.props.CurrentTrack.getGeoPointFromElevationDataIndex(d.index + 1).distanceCovered)) < _this3.state.x.range()[1] ? _this3.state.x(_this3.toKm(_this3.props.CurrentTrack.getGeoPointFromElevationDataIndex(d.index + 1).distanceCovered)) : _this3.state.x.range()[1]) - _this3.state.x(_this3.toKm(_this3.props.CurrentTrack.getGeoPointFromElevationDataIndex(d.index).distanceCovered));
            }).attr("y", function (d) {
                return _this3.state.y(d.elevation);
            }).attr("height", function (d) {
                return function (i) {
                    return function (j) {
                        return dimensions.chartHeight - _this3.state.y(d.elevation);
                    };
                };
            });
        }
    }, {
        key: "initializeChart",
        value: function () {
            var _this4 = this;

            var dimensions = this.updateDimensions(window.innerWidth);
            var svg = d3.select(".elevation_chart").append("svg").attr("width", dimensions.svgWidth).attr("height", dimensions.svgHeight);
            var touchScale = scale.linear().domain(new Float64Array([0, dimensions.xAxisWidth])).range(new Float64Array([0, this.props.CurrentTrack.Points.length - 1])).clamp(true);
            var x = scale.linear().range(new Float64Array([0, dimensions.xAxisWidth])).domain(new Float64Array([0, reduce(function (x, y) {
                return Math.max(x, y);
            }, map(function (d) {
                return _this4.toKm(_this4.getGeoPointFromElevationDataIndex(d.index).distanceCovered);
            }, this.props.CurrentTrack.Points))]));
            var y = scale.linear().range(new Float64Array([dimensions.chartHeight, 0])).domain(new Float64Array([0, reduce(function (x, y) {
                return Math.max(x, y);
            }, map(function (d) {
                return d.elevation;
            }, this.props.CurrentTrack.Points))]));
            var ySpeed = scale.linear().range(new Float64Array([dimensions.chartHeight, 0])).domain(new Float64Array([0, reduce(function (x, y) {
                return Math.max(x, y);
            }, map(function (d) {
                return d.speed * 3.6;
            }, this.props.CurrentTrack.Points))]));
            var chartWrapper = svg.append("g").attr("transform", "translate(" + String(dimensions.margin.left) + "," + String(dimensions.margin.top) + ")").on("touchmove", function (data, _arg19, _arg18) {
                _this4.onTouchMove(event);

                return 0;
            });

            var state = function () {
                var touchScale_1 = scale.linear().domain(new Float64Array([0, dimensions.xAxisWidth])).range(new Float64Array([0, _this4.props.CurrentTrack.Points.length - 1])).clamp(true);
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
            this.drawPaths(state, dimensions.chartWidth, dimensions.chartHeight);
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
        CurrentTrack: state.Visualization
    };
}

function setDefaultProps(ownprops) {
    return {
        CurrentTrack: new TrackVisualization("", new List())
    };
}

export var createElevationViewComponent = buildComponent(function (c) {
    return withProps(function (ownprops) {
        return setDefaultProps(ownprops);
    }, c);
}(function (c) {
    return withStateMapper(function (state) {
        return function (ownprops) {
            return mapStateToProps(state, ownprops);
        };
    }, c);
}(createConnector())), {
    TComponent: ElevationChart,
    TProps: Any,
    TCtx: Any,
    TState: LocationTracker
});
//# sourceMappingURL=fable_elevation.js.map