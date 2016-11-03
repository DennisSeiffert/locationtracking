// Load the Visualization API and the columnchart package.
google.load('visualization', '1', {packages: ['columnchart']});

// function initMap() {
//   // The following path marks a path from Mt. Whitney, the highest point in the
//   // continental United States to Badwater, Death Valley, the lowest point.
//   var path = [
//       {lat: 36.579, lng: -118.292},  // Mt. Whitney
//       {lat: 36.606, lng: -118.0638},  // Lone Pine
//       {lat: 36.433, lng: -117.951},  // Owens Lake
//       {lat: 36.588, lng: -116.943},  // Beatty Junction
//       {lat: 36.34, lng: -117.468},  // Panama Mint Springs
//       {lat: 36.24, lng: -116.832}];  // Badwater, Death Valley

//   var map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 8,
//     center: path[1],
//     mapTypeId: 'terrain'
//   });  

//   // Draw the path, using the Visualization API and the Elevation service.
//   displayPathElevation(path, elevator, map);
// }

function displayPathElevation(path, map) {
//   // Display a polyline of the elevation path.
//   new google.maps.Polyline({
//     path: path,
//     strokeColor: '#0000CC',
//     opacity: 0.4,
//     map: map
//   });

  // Create an ElevationService.
  var elevator = new google.maps.ElevationService;

  // Create a PathElevationRequest object using this array.
  // Ask for 256 samples along that path.
  // Initiate the path request.
  elevator.getElevationAlongPath({
    'path': path,
    'samples': 256
  }, plotElevation);
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(elevations, status) {
  var chartDiv = document.getElementById('elevation_chart');
  if (status !== google.maps.ElevationStatus.OK) {
    // Show the error code inside the chartDiv.
    chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
        status;
    return;
  }
  // Create a new chart in the elevation_chart DIV.
  var chart = new google.visualization.ColumnChart(chartDiv);

  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Sample');
  data.addColumn('number', 'Elevation');
  for (var i = 0; i < elevations.length; i++) {
    data.addRow(['', elevations[i].elevation]);
  }

  // Draw the chart using the data within its DIV.
  chart.draw(data, {
    height: 150,
    legend: 'none',
    titleY: 'Elevation (m)'
  });
}