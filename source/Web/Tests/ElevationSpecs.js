describe("Elevation Chart", function() {   
  var currentTrack;  

  beforeEach(function() {
    currentTrack = new TrackViewModel([new google.maps.LatLng(37.772, -122.214), 
                  new google.maps.LatLng(21.291, -157.821), 
                  new google.maps.LatLng(-18.142, 178.431),
                  new google.maps.LatLng( -27.467, 153.027)]);            
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