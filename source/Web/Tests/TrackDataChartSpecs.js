describe("Elevation Chart", function() {   
  var currentTrack;  

  beforeEach(function() {
    currentTrack = new TrackViewModel([
                  { latitude : 37.772, longitude : -122.214, timestamputc : { $date : '2016-10-01T10:10:10.000Z' }}, 
                  { latitude : 21.291, longitude : -157.821, timestamputc : { $date : '2016-10-01T19:12:10.000Z' }},  
                  { latitude : -18.142, longitude : 178.431, timestamputc : { $date : '2016-10-02T10:10:10.000Z' }},
                  { latitude : -27.467, longitude : 153.027, timestamputc : { $date : '2016-10-04T10:10:10.000Z' }}]);            
  });

  it("should be able to draw simple elevation graph", function() { 
      currentTrack.calculate(); 
      var chart = new Chart([
          {index : 0, elevation : 10 }, 
          {index : 1, elevation : 20 }, 
          {index : 2, elevation : 30 }, 
          {index : 3, elevation : 40 }, 
          {index : 4, elevation : 50 }], currentTrack);
      chart.initializeChart();                   
  }); 

  it("should be able to identify points by hovering over elevation graph", function() {
      spyOn(currentTrack, 'hasElevationMarker').and.returnValue(false);
      var chart = new Chart([], currentTrack);      
      chart.onMouseOverHandler(2);
      expect(currentTrack.hasElevationMarker).toHaveBeenCalled();    
  }); 

});