


function Chart(data, currentTrack) {
  this.data = data;
  this.currentTrack = currentTrack;
  this.x = null;
  this.y = null;
  this.xAxis = null;
  this.yAxis = null;
  this.svg = null;
  this.chartWrapper = null;

  this.onMouseOverHandler = function (index) {
    var meters = index / 256.0 * this.currentTrack.totalDistanceInMeters;
    var markerPointIndex = this.currentTrack.getIndexOfNearestPoint(meters);
    var geoPoint = this.currentTrack.getPointAt(markerPointIndex);

    if (this.currentTrack.hasElevationMarker()) {
      showPosition(geoPoint.latitude, geoPoint.longitude, this.currentTrack.elevationMarker);
    }
  }




  this.addAxes = function (xAxisWidth, chartHeight) {
    var axes = this.chartWrapper.append('g');

    axes.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(this.xAxis);

    axes.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Elevation (m)');

    axes.append('g')
      .attr('class', 'ySpeed axis')
      .attr('transform', 'translate('+ xAxisWidth +', 0)')
      .call(this.ySpeedAxis)
      .append('text')      
      .attr('transform', 'rotate(-90)')
      .attr('y', 70)                  
      .style('text-anchor', 'end')
      .text('Speed (m/s)');
  }

  this.drawPaths = function (chartWidth, chartHeight) {
    var self = this;
    this.bars = this.chartWrapper.selectAll(".bar").data(this.data).enter();
    this.bars.append("rect")
      .attr("class", "elevationbar")
      .attr("x", function (d) { return self.x(d.index); })
      .attr("width", function (d) { return Math.min(self.x(d.index + 1), self.x.range()[1]) - self.x(d.index) })
      .attr("y", function (d) { return self.y(d.elevation); })
      .attr("height", function (d, i, j) { return chartHeight - self.y(d.elevation); })
      .on("mouseover", function (d) {
        self.onMouseOverHandler(d.index, this.currentTrack);
        d3.select(this).attr('fill', '').classed("active", true);
      })
      .on("mouseout", function (d) {
        d3.select(this).attr('fill', '').classed("active", false);
      });
    this.path = this.chartWrapper.append('path').datum(this.data).classed('line', true);
    this.line = d3.svg.line()
      .x(function(d) { return self.x(d.index) })
      .y(function(d) { return self.ySpeed(d.speed) });
    this.path.attr('d', this.line);
  }

  this.initializeChart = function () {
    var dimensions = this.updateDimensions(window.innerWidth);

    this.x = d3.scale.linear().range([0, dimensions.xAxisWidth])
      .domain(d3.extent(this.data, function (d) { return d.index; }));
    this.y = d3.scale.linear().range([dimensions.chartHeight, 0])
      .domain([0, d3.max(this.data, function (d) { return d.elevation; })]);
    this.ySpeed = d3.scale.linear().range([dimensions.chartHeight, 0])
      .domain([0, d3.max(this.data, function (d) { return d.speed; })]);

    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom')
      .innerTickSize(-dimensions.chartHeight).outerTickSize(0).tickPadding(10);
    this.yAxis = d3.svg.axis().scale(this.y).orient('left')
      .innerTickSize(-dimensions.chartWidth).outerTickSize(0).tickPadding(10);
    this.ySpeedAxis = d3.svg.axis().scale(this.ySpeed).orient('right')
      .innerTickSize(-dimensions.chartWidth).outerTickSize(0).tickPadding(10);

    this.svg = d3.select('#elevation_chart').append('svg')
      .attr('width', dimensions.svgWidth)
      .attr('height', dimensions.svgHeight);
    this.chartWrapper = this.svg
      .append('g')
      .attr('transform', 'translate(' + dimensions.margin.left + ',' + dimensions.margin.top + ')');

    this.addAxes(dimensions.xAxisWidth, dimensions.chartHeight);
    this.drawPaths(dimensions.chartWidth, dimensions.chartHeight);
    var self = this;
    window.addEventListener('resize', function () { self.renderChart(self); });
  }

  this.renderChart = function (self) {
    var dimensions = self.updateDimensions(window.innerWidth);


    //update x and y scales to new dimensions
    self.x.range([0, dimensions.xAxisWidth]);
    self.y.range([dimensions.chartHeight, 0]);
    self.ySpeed.range([dimensions.chartHeight, 0]);

    //update svg elements to new dimensions
    self.svg
      .attr('width', dimensions.svgWidth)
      .attr('height', dimensions.svgHeight);
    self.chartWrapper.attr('transform', 'translate(' + dimensions.margin.left + ',' + dimensions.margin.top + ')');

    //update the axis and line
    self.xAxis.scale(self.x);
    self.yAxis.scale(self.y);
    self.ySpeedAxis.scale(self.ySpeed);

    self.svg.select('.x.axis')
      .attr('transform', 'translate(0,' + dimensions.chartHeight + ')')
      .call(self.xAxis);

    self.svg.select('.y.axis')
      .call(self.yAxis);

    self.svg.select('.ySpeed.axis')
      .call(self.ySpeedAxis);

    self.chartWrapper.selectAll(".elevationbar")
      .attr("x", function (d) { return self.x(d.index); })
      .attr("width", function (d) {         
        return Math.min(self.x(d.index + 1), self.x.range()[1]) - self.x(d.index) 
      })
      .attr("y", function (d) { return self.y(d.elevation); })
      .attr("height", function (d, i, j) { return dimensions.chartHeight - self.y(d.elevation); });

    self.path.attr('d', self.line);
  }

  this.updateDimensions = function (winWidth) {
    var dimensions = {
      margin: { top: 20, right: 40, left: 40, bottom: 40 },
      svgWidth: winWidth - 40,
      svgHeight: 300,
      leftAxisSpace : 40
    };

    dimensions.chartWidth = dimensions.svgWidth - dimensions.margin.left - dimensions.margin.right;
    dimensions.chartHeight = dimensions.svgHeight - dimensions.margin.top - dimensions.margin.bottom;
    dimensions.xAxisWidth = dimensions.chartWidth - dimensions.leftAxisSpace;

    return dimensions;
  }
}






































// function onMouseOverHandler(index, currentTrack) {
//   var meters = index / 256.0 * currentTrack.totalDistanceInMeters;
//   var markerPointIndex = currentTrack.getIndexOfNearestPoint(meters);
//   var geoPoint = currentTrack.getPointAt(markerPointIndex);

//   if (currentTrack.hasElevationMarker()) {
//     showPosition(geoPoint.latitude, geoPoint.longitude, currentTrack.elevationMarker);
//   }

// }




// function addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
//   var axes = svg.append('g');

//   axes.append('g')
//     .attr('class', 'x axis')
//     .attr('transform', 'translate(0,' + chartHeight + ')')
//     .call(xAxis);

//   axes.append('g')
//     .attr('class', 'y axis')
//     .call(yAxis)
//     .append('text')
//     .attr('transform', 'rotate(-90)')
//     .attr('y', 6)
//     .attr('dy', '.71em')
//     .style('text-anchor', 'end')
//     .text('Elevation (m)');

//   // var legend = svg.append('g')
//   //   .attr('class', 'legend')
//   //   .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');

//   // legend.append('rect')
//   //   .attr('class', 'legend-bg')
//   //   .attr('width',  legendWidth)
//   //   .attr('height', legendHeight);

//   // legend.append('rect')
//   //   .attr('class', 'outer')
//   //   .attr('width',  75)
//   //   .attr('height', 20)
//   //   .attr('x', 10)
//   //   .attr('y', 10);

//   // legend.append('text')
//   //   .attr('x', 115)
//   //   .attr('y', 25)
//   //   .text('5% - 95%');

//   // legend.append('rect')
//   //   .attr('class', 'inner')
//   //   .attr('width',  75)
//   //   .attr('height', 20)
//   //   .attr('x', 10)
//   //   .attr('y', 40);

//   // legend.append('text')
//   //   .attr('x', 115)
//   //   .attr('y', 55)
//   //   .text('25% - 75%');

//   // legend.append('path')
//   //   .attr('class', 'median-line')
//   //   .attr('d', 'M10,80L85,80');

//   // legend.append('text')
//   //   .attr('x', 115)
//   //   .attr('y', 85)
//   //   .text('Median');
// }

// function drawPaths(svg, data, x, y, chartWidth, chartHeight, currentTrack) {
//   bars = svg.selectAll(".bar").data(data).enter();
//   bars.append("rect")
//     .attr("class", "elevationbar")
//     .attr("x", function (d) { return x(d.index); })
//     .attr("width", function (d) { return (x(d.index + 1) - x(d.index)) / 2 })
//     .attr("y", function (d) { return y(d.elevation); })
//     .attr("height", function (d, i, j) { return chartHeight - y(d.elevation); })
//     .on("mouseover", function (d) {
//       onMouseOverHandler(d.index, currentTrack);
//       d3.select(this).attr('fill', '').classed("active", true);
//     })
//     .on("mouseout", function (d) {
//       d3.select(this).attr('fill', '').classed("active", false);
//     });
// }

// function initializeChart(data, currentTrack) {
//   // var svgWidth  = window.innerWidth,
//   //     svgHeight = 300,
//   //     margin = { top: 20, right: 20, bottom: 40, left: 40 },
//   //     chartWidth  = svgWidth  - margin.left - margin.right,
//   //     chartHeight = svgHeight - margin.top  - margin.bottom;
//   var dimensions = updateDimensions(window.innerWidth);

//   var x = d3.scale.linear().range([0, dimensions.chartWidth])
//     .domain(d3.extent(data, function (d) { return d.index; })),
//     y = d3.scale.linear().range([dimensions.chartHeight, 0])
//       .domain([0, d3.max(data, function (d) { return d.elevation; })]);

//   var xAxis = d3.svg.axis().scale(x).orient('bottom')
//     .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
//     yAxis = d3.svg.axis().scale(y).orient('left')
//       .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

//   var svg = d3.select('#elevation_chart').append('svg')
//     .attr('width', dimensions.svgWidth)
//     .attr('height', dimensions.svgHeight)
//     .append('g')
//     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//   addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
//   drawPaths(svg, data, x, y, chartWidth, chartHeight, currentTrack);
// }

// function makeChart(data, markers, currentTrack) {
//   var svgWidth = window.innerWidth,
//     svgHeight = 300,
//     margin = { top: 20, right: 20, bottom: 40, left: 40 },
//     chartWidth = svgWidth - margin.left - margin.right,
//     chartHeight = svgHeight - margin.top - margin.bottom;

//   var x = d3.scale.linear().range([0, chartWidth])
//     .domain(d3.extent(data, function (d) { return d.index; })),
//     y = d3.scale.linear().range([chartHeight, 0])
//       .domain([0, d3.max(data, function (d) { return d.elevation; })]);

//   var xAxis = d3.svg.axis().scale(x).orient('bottom')
//     .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
//     yAxis = d3.svg.axis().scale(y).orient('left')
//       .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

//   var svg = d3.select('#elevation_chart').append('svg')
//     .attr('width', svgWidth)
//     .attr('height', svgHeight)
//     .append('g')
//     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//   addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
//   drawPaths(svg, data, x, y, chartWidth, chartHeight, currentTrack);
// }

// function updateDimensions(winWidth) {
//   var dimensions = {
//     margin: { top: 20, right: 20, left: 40, bottom: 40 },
//     svgWidth: winWidth,
//     svgHeight: 300
//   };

//   dimensions.chartWidth = winWidth - dimensions.margin.left - dimensions.margin.right;
//   dimensions.chartHeight = dimensions.svgHeight - dimensions.margin.top - dimensions.margin.bottom;

//   return dimensions;
// }