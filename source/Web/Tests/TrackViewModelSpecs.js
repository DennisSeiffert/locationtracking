describe("trackViewModel", function() {
  var sut;  

  beforeEach(function() {
    sut = new TrackViewModel([new google.maps.LatLng(37.772, -122.214), 
                  new google.maps.LatLng(21.291, -157.821), 
                  new google.maps.LatLng(-18.142, 178.431),
                  new google.maps.LatLng( -27.467, 153.027)]);            
  });

  it("should be able to calculate total distance", function() {
    sut.calculateTotalDistance();
    expect(sut.totalDistanceInMeters).toEqual(11755297.543391723);
  });

  it("should be able to get point at index", function() { 
        var point = sut.getPointAt(2);   
        expect(Math.round(point.lat())).toEqual(-18);
        expect(Math.round(point.lng())).toEqual(178);
  });

  describe("when total distance has been calculated", function() {
    beforeEach(function() {      
      sut.calculateTotalDistance(); 
    });

    it("should get index of nearest point", function() {
      expect(sut.getIndexOfNearestPoint(11755297.543391723)).toEqual(3);
      expect(sut.getIndexOfNearestPoint(0.0)).toEqual(0);
      expect(sut.getIndexOfNearestPoint(6000000.0)).toEqual(1);
    });    
  });

//   // demonstrates use of spies to intercept and test method calls
//   it("tells the current song if the user has made it a favorite", function() {
//     spyOn(song, 'persistFavoriteStatus');

//     player.play(song);
//     player.makeFavorite();

//     expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
//   });

//   //demonstrates use of expected exceptions
//   describe("#resume", function() {
//     it("should throw an exception if song is already playing", function() {
//       player.play(song);

//       expect(function() {
//         player.resume();
//       }).toThrowError("song is already playing");
//     });
//   });
});
