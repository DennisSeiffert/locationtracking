describe("trackViewModel", function() {
  var sut;  

  beforeEach(function() {
    sut = new TrackViewModel([
                  { latitude : 37.772, longitude : -122.214, timestamputc : '2016-10-01T10:10:10.000Z' }, 
                  { latitude : 21.291, longitude : -157.821, timestamputc : '2016-10-01T10:12:10.000Z' },  
                  { latitude : -18.142, longitude : 178.431, timestamputc : '2016-10-02T10:10:10.000Z' },
                  { latitude : -27.467, longitude : 153.027, timestamputc : '2016-12-01T10:10:10.000Z' }]);            
  });

  it("should be able to calculate total distance", function() {
    sut.calculateTotalDistance();
    expect(sut.totalDistanceInMeters).toEqual(11755297.543391727);
  });

  it("should be able to calculate speed", function() {
    sut.calculateSpeed();
    expect(sut.points[0].speed).toEqual(32240.93465257345);
  });

  it("should be able to get point at index", function() { 
        var point = sut.getPointAt(2);   
        expect(Math.round(point.latitude)).toEqual(-18);
        expect(Math.round(point.longitude)).toEqual(178);
  });

  describe("when total distance has been calculated", function() {
    beforeEach(function() {      
      sut.calculateTotalDistance(); 
    });

    it("should get index of nearest point", function() {
      expect(sut.getIndexOfNearestPoint(11755297.543391727)).toEqual(3);
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
