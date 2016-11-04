/** Converts numeric degrees to radians */
function toRad(x) {
    return x * Math.PI / 180;
}


function distance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = toRad(lat2-lat1);  // Javascript functions in radians
  var dLon = toRad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 1000.0;
}

function TrackViewModel(points){
    this.totalDistanceInMeters = 0.0;
    this.points = points;  
    this.elevationMarker = null;       

    this.getIndexOfNearestPoint = function(distanceInMeters) {
        var currentDistanceInMeters = 0.0;
        for(var i=1;i < this.points.length; i++){
            currentDistanceInMeters += distance(this.points[i-1].lat(), this.points[i-1].lng(), this.points[i].lat(), this.points[i].lng());
            if(currentDistanceInMeters > distanceInMeters){
                return i-1;
            }
        }
        return this.points.length - 1;
    };

    this.getPointAt = function(index){
      return this.points[index];
    }

    this.assignElevationMarker = function(marker){
        this.elevationMarker = marker;
    }

    this.hasElevationMarker = function(){
        return this.elevationMarker !== null;
    }

    this.calculateTotalDistance = function() {
        for(var i=1;i < this.points.length; i++){
            this.totalDistanceInMeters += distance(this.points[i-1].lat(), this.points[i-1].lng(), this.points[i].lat(), this.points[i].lng());
        }
    }
}