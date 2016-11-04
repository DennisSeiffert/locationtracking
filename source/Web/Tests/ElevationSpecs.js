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
      plotElevation([{elevation : 10}, {elevation : 20}, {elevation : 30}, {elevation : 40}, {elevation : 50}], google.maps.ElevationStatus.OK, currentTrack);        
  }); 

  it("should be able to identify points by hovering over elevation graph", function() {
      spyOn(currentTrack, 'hasElevationMarker').and.returnValue(false);      
      onMouseOverHandler(2, currentTrack);
      expect(currentTrack.hasElevationMarker).toHaveBeenCalled();    
  }); 

});