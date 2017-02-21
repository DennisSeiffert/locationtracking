describe("trackViewModel", function () {
  var sut;

  beforeEach(function () {
    sut = new TrackViewModel([
      { latitude: 37.772, longitude: -122.214, timestamputc: { $date: '2016-10-01T10:10:10.000Z' } },
      { latitude: 21.291, longitude: -157.821, timestamputc: { $date: '2016-10-01T19:12:10.000Z' } },
      { latitude: 21.291, longitude: -157.821, timestamputc: { $date: '2016-10-01T19:12:10.000Z' } },
      { latitude: -18.142, longitude: 178.431, timestamputc: { $date: '2016-10-02T10:10:10.000Z' } },
      { latitude: -27.467, longitude: 153.027, timestamputc: { $date: '2016-10-04T10:10:10.000Z' } }]);
  });

  it("should be able to calculate total distance", function () {
    sut.calculate();
    expect(sut.totalDistanceInMeters).toEqual(11755297.543391727);
  });

  it("should transform json", function (){
    var input = JSON.parse("[ { \"newPropertyName\": 1, \"NewMappedPages\": 1, \"total\": 60 },    "
        +"[ { \"indicator\": {\"value\": \"Central government debt, total (% of GDP)\"},"
        +"\"country\": {\"id\":\"CZ\",\"value\":\"Czech Republic\"},"
        +"\"value\":null,\"decimal\":\"1\",\"date\":\"2000\"},"
        +"{ \"indicator\": {\"value\": \"Central government debt, total (% of GDP)\"},"
        +"\"country\": {\"id\":\"CZ\",\"value\":\"Czech Republic\"},"
        +"\"value\":\"16.6567773464055\",\"decimal\":\"1\",\"date\":\"2010\"} ] ]")

    var transform = function(input){
      var result = [];
      for(var i = 0; i < input.length;i++){
         result.push(input[i]);
         for(var j = 0; j < input[i].length; j++){
           if(input[i][j].country !== undefined){
             input[i][j].country = {name: input[i][j].country.id, value : input[i][j].country.value};
           }
         }
      }

      return result;
    }

    var transformedObject = transform(input);
    expect(transformedObject[1][0].country.name).toEqual("CZ");
  });

  it("should be able to calculate distances", function () {
    sut.calculate();
    expect(sut.points[0].distanceCovered).toEqual(0.0);
    expect(sut.points[1].distanceCovered).toEqual(3868912.1583088143);
    expect(sut.points[2].distanceCovered).toEqual(3868912.1583088143);
    expect(sut.points[4].distanceCovered).toEqual(11755297.543391727);
  });

  it("should be able to calculate speed", function () {
    sut.calculate();
    expect(sut.points[1].speed).toEqual(118.97023857038174);
    expect(sut.points[2].speed).toEqual(0.0);
    expect(sut.points[3].speed).toBeGreaterThan(0.0);
  });

  it("should be able to get point at index", function () {
    var point = sut.getPointAt(3);
    expect(Math.round(point.latitude)).toEqual(-18);
    expect(Math.round(point.longitude)).toEqual(178);
  });

  describe("when total distance has been calculated", function () {
    beforeEach(function () {
      sut.calculate();
    });

    it("should get index of nearest point", function () {
      expect(sut.getIndexOfNearestPoint(11755297.543391727)).toEqual(4);
      expect(sut.getIndexOfNearestPoint(0.0)).toEqual(0);
      expect(sut.getIndexOfNearestPoint(6000000.0)).toEqual(3);
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
