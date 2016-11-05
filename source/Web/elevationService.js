function displayPathElevation(path, map, currentTrack) {
  // Create an ElevationService.
  var elevator = new google.maps.ElevationService;

  // Create a PathElevationRequest object using this array.
  // Ask for 256 samples along that path.
  // Initiate the path request.
  elevator.getElevationAlongPath({
    'path': path,
    'samples': 256
  }, function (elevations, status) { plotElevation(elevations, status, currentTrack) });
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
    data.push({ index: i, elevation: elevations[i].elevation });
  }

  var chart = new Chart(data, currentTrack);
  chart.initializeChart();  
  //makeChart(data, [], currentTrack);
}