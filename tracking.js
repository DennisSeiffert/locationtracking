/* global subscription */
/* global watchId */
/* global map */
var x = document.getElementById("demo");

var geo_options = {
  enableHighAccuracy: true, 
  maximumAge        : 60000, 
  timeout           : 10000
};

var ownTrackingJob = { 
    identifier : ''    
    }
var observedTrackingJobs = [ownTrackingJob];

function initialize(){
    Parse.initialize('myAppId','unused');
    Parse.serverURL = 'http://hmmas8wmeibjab4e.myfritz.net/parse';
    
    initializeMap();
    getCurrentPosition(onShowPosition)        
}

function beginTracking() {  
    if (navigator.geolocation) {
        ownTrackingJob.identifier = document.getElementById('trackIdentifier').value;
        watchId = navigator.geolocation.watchPosition(onPosition, showError, geo_options);
        subscribeToPositionNotifications(ownTrackingJob);                 
    } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function observe(){    
    var trackingJob = {
            identifier : document.getElementById('observedIdentifier').value,
            marker : new google.maps.Marker({position: new google.maps.LatLng(0, 0),map:map,title:"You are here!"})
        };
    subscribeToPositionNotifications(trackingJob)
    observedTrackingJobs.push(trackingJob);        
}

function getCurrentPosition(onGetPosition) {  
    if (navigator.geolocation) {
        watchId = navigator.geolocation.getCurrentPosition(onGetPosition, showError, geo_options);           
        ownTrackingJob.marker = new google.maps.Marker({position: new google.maps.LatLng(0, 0),map:map,title:"You are here!"})              
    } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function onPosition(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
            
    sendPosition(lat, lon);
}

function onShowPosition(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;    
            
    showPosition(lat, lon);
}

function sendPosition(latitude, longitude){        
    var obj = new Parse.Object('Posts');
    
    //latitude = Math.random() * 10.0;
    //longitude = Math.random() * 10.0;        
    
    obj.set('name', ownTrackingJob.identifier);  
    obj.set('latitude', latitude);
    obj.set('longitude', longitude);

    obj.save();
}

function subscribeToPositionNotifications(trackingJob){
    let query = new Parse.Query('Posts');
    query.equalTo('name', trackingJob.identifier);
    trackingJob.subscription = query.subscribe();
    
    trackingJob.subscription.on('create', (position) => {
        var name = position.get('name');
        var observedTrackingJob = observedTrackingJobs.find(function(v,i) { return v.identifier == name })
        console.log(position.get('latitude'), position.get('longitude'), name);
        if (observedTrackingJob !== undefined){
                x.innerHTML = "Latitude: " + position.get('latitude') + 
                              "<br>Longitude: " + position.get('longitude') + 
                              "<br>Name: " + name;  
            showPosition(position.get('latitude'), position.get('longitude'), observedTrackingJob.marker);    
        }                        
    });
}

function stopTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);        
    } else { 
        x.innerHTML = "Cannot reset geolocation tracking.";
    }
    if (ownTrackingJob.subscription !== undefined){
        ownTrackingJob.subscription.unsubscribe();    
    }    
}

function initializeMap() {
    var mapholder = document.getElementById('mapholder')
    mapholder.style.height = '250px';
    mapholder.style.width = '500px';
    var latlon = new google.maps.LatLng(0, 0)

    var myOptions = {
        center:latlon,zoom:14,
        mapTypeId:google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    }
    
    map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
}

function showPosition(latitude, longitude, marker) {         
    var latlon = new google.maps.LatLng(latitude, longitude)
    
    if (map !== undefined) {
        marker.setPosition(latlon);      
        map.panTo(latlon);    
    }    
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}