
function displayPathElevation(path, map, currentTrack) {
  // Create an ElevationService.
  var elevator = new google.maps.ElevationService;

  // Create a PathElevationRequest object using this array.
  // Ask for 256 samples along that path.
  // Initiate the path request.
  elevator.getElevationAlongPath({
    'path': path,
    'samples': 256
  }, function(elevations, status) { plotElevation(elevations, status, currentTrack) });
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(elevations, status, currentTrack) {
  var chartDiv = document.getElementById('elevation_chart');
  if (status !== google.maps.ElevationStatus.OK) {
    // Show the error code inside the chartDiv.
    chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
        status;
    return;
  }

 var data = [];
  for (var i = 0; i < elevations.length; i++) {
    data.push({index : i, elevation : elevations[i].elevation});
  }

  makeChart(data, [], currentTrack); 
}

function onMouseOverHandler(index, currentTrack) {    
  var meters = index / 256.0 * currentTrack.totalDistanceInMeters;
  var markerPointIndex = currentTrack.getIndexOfNearestPoint(meters);
  var geoPoint = currentTrack.getPointAt(markerPointIndex);

  if (currentTrack.hasElevationMarker()){
    showPosition(geoPoint.lat(), geoPoint.lng(), currentTrack.elevationMarker);
  }
  
}




function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {   
  var axes = svg.append('g');

  axes.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(xAxis);

  axes.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Elevation (m)');

  // var legend = svg.append('g')
  //   .attr('class', 'legend')
  //   .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');

  // legend.append('rect')
  //   .attr('class', 'legend-bg')
  //   .attr('width',  legendWidth)
  //   .attr('height', legendHeight);

  // legend.append('rect')
  //   .attr('class', 'outer')
  //   .attr('width',  75)
  //   .attr('height', 20)
  //   .attr('x', 10)
  //   .attr('y', 10);

  // legend.append('text')
  //   .attr('x', 115)
  //   .attr('y', 25)
  //   .text('5% - 95%');

  // legend.append('rect')
  //   .attr('class', 'inner')
  //   .attr('width',  75)
  //   .attr('height', 20)
  //   .attr('x', 10)
  //   .attr('y', 40);

  // legend.append('text')
  //   .attr('x', 115)
  //   .attr('y', 55)
  //   .text('25% - 75%');

  // legend.append('path')
  //   .attr('class', 'median-line')
  //   .attr('d', 'M10,80L85,80');

  // legend.append('text')
  //   .attr('x', 115)
  //   .attr('y', 85)
  //   .text('Median');
}

function drawPaths (svg, data, x, y, chartWidth, chartHeight, currentTrack) {
  bars = svg.selectAll(".bar").data(data).enter();
  bars.append("rect")
      .attr("class", "elevationbar")
      .attr("x", function(d) { return x(d.index); })
      .attr("width", function(d) { return (x(d.index + 1) - x(d.index)) / 2})
      .attr("y", function(d) { return y(d.elevation); })
	  .attr("height", function(d,i,j) { return chartHeight - y(d.elevation); })
    .on("mouseover", function(d) { 
      onMouseOverHandler(d.index, currentTrack);
      d3.select(this).attr('fill', '').classed("active", true );
    })
    .on("mouseout", function(d) {       
      d3.select(this).attr('fill', '').classed("active", false );
    }); 
}

function makeChart (data, markers, currentTrack) {
  var svgWidth  = 960,
      svgHeight = 300,
      margin = { top: 20, right: 20, bottom: 40, left: 40 },
      chartWidth  = svgWidth  - margin.left - margin.right,
      chartHeight = svgHeight - margin.top  - margin.bottom;

  var x = d3.scale.linear().range([0, chartWidth])
            .domain(d3.extent(data, function (d) { return d.index; })),
      y = d3.scale.linear().range([chartHeight, 0])
            .domain([0, d3.max(data, function (d) { return d.elevation; })]);

  var xAxis = d3.svg.axis().scale(x).orient('bottom')
                .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
      yAxis = d3.svg.axis().scale(y).orient('left')
                .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

  var svg = d3.select('#elevation_chart').append('svg')
    .attr('width',  svgWidth)
    .attr('height', svgHeight)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
  drawPaths(svg, data, x, y, chartWidth, chartHeight, currentTrack);  
}