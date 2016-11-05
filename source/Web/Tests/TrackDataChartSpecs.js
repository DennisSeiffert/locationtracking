describe("Elevation Chart", function() {   
  var currentTrack;  

  beforeEach(function() {
    currentTrack = new TrackViewModel([
                  { latitude : 37.772, longitude : -122.214 }, 
                  { latitude : 21.291, longitude : -157.821 },  
                  { latitude : -18.142, longitude : 178.431 },
                  { latitude : -27.467, longitude : 153.027 }]);            
  });

  it("should be able to draw simple elevation graph", function() {  
      var chart = new Chart([
          {index : 0, elevation : 10, speed : 2344.0}, 
          {index : 1, elevation : 20, speed : 2344.0}, 
          {index : 2, elevation : 30, speed : 2344.0}, 
          {index : 3, elevation : 40, speed : 2344.0}, 
          {index : 4, elevation : 50, speed : 2344.0}], currentTrack);
      chart.initializeChart();                   
  }); 

  it("should be able to identify points by hovering over elevation graph", function() {
      spyOn(currentTrack, 'hasElevationMarker').and.returnValue(false);
      var chart = new Chart([], currentTrack);      
      chart.onMouseOverHandler(2);
      expect(currentTrack.hasElevationMarker).toHaveBeenCalled();    
  }); 

});