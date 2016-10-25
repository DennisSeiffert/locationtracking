/* global subscription */
/* global watchId */
/* global map */
var x = document.getElementById("status");

var geo_options = {
  enableHighAccuracy: true, 
  maximumAge        : 60000, 
  timeout           : 20000
};

var trackingViewModel = {
    ownTrackingJob : {},
    observedTrackingJobs : ko.observableArray(),    
    
    createTrackingJob : function (name, latitude, longitude) {
        return {            
            identifier : ko.observable(name),
            marker : undefined,
            subscription : undefined,
            latitude : ko.observable(latitude),
            longitude : ko.observable(longitude),
            utcTimestamp : ko.observable(UtcNow()),
            updatePositionOnMap : ko.observable(true),
            observe : ko.observable(true)        
        }
    },
    
    addTrackingJob : function (self, job, onObserveChanged) {
        if(!self.containsTrackingJob(self, job.identifier())){
            self.observedTrackingJobs.push(job);
            job.observe.subscribe(function(newValue) { onObserveChanged(job); });
        }        
    }, 
    
    deleteTrackingJob : function (self, job) {
        for(var i = self.observedTrackingJobs.length - 1; i >= 0; i--) {
            if(self.observedTrackingJobs[i] === job) {
               self.observedTrackingJobs.splice(i, 1);
            }
        }        
    },
    
    containsTrackingJob : function(self, name){
        for(var i = self.observedTrackingJobs.length - 1; i >= 0; i--) {
            if(self.observedTrackingJobs[i] === job) {
               return true;
            }
        }        
        return false;
    }
};

window.addEventListener('load', function () {
    trackingViewModel.ownTrackingJob = trackingViewModel.createTrackingJob('', 0, 0);
beginDate = ko.observable(UtcNow());
endDate = ko.observable(UtcNow());
trackingId = ko.observable();
ko.applyBindings(trackingViewModel);

    initialize();
});



function initialize(){
    
    
    Parse.initialize('myAppId','unused');
    Parse.serverURL = '/parse';
    
    initializeMap();
    getCurrentPosition(onShowOwnPosition);       
}

function beginTracking() {  
    if (navigator.geolocation) {
        // trackingViewModel.ownTrackingJob.identifier = document.getElementById('trackIdentifier').value;
        watchId = navigator.geolocation.watchPosition(onPosition, showError, geo_options);
        subscribeToPositionNotifications(trackingViewModel.ownTrackingJob);
        trackingViewModel.addTrackingJob(trackingViewModel, trackingViewModel.ownTrackingJob, onObserveChanged);                 
    } else { 
        printStatus("Geolocation is not supported by this browser.");
    }
}

function observe(){    
    var trackingJob = trackingViewModel.createTrackingJob(document.getElementById('observedIdentifier').value, 0, 0);                
    trackingJob.marker = new google.maps.Marker({position: new google.maps.LatLng(0, 0),map:map,title:"You are here!"});        
    subscribeToPositionNotifications(trackingJob);
    trackingViewModel.addTrackingJob(trackingViewModel, trackingJob, onObserveChanged);        
}

function getCurrentPosition(onGetPosition) {  
    if (navigator.geolocation) {
        watchId = navigator.geolocation.getCurrentPosition(onGetPosition, showError, geo_options);           
        trackingViewModel.ownTrackingJob.marker = new google.maps.Marker({position: new google.maps.LatLng(0, 0),map:map,title:"You are here!"});
    } else { 
        printStatus("Geolocation is not supported by this browser.");
    }
}

function onPosition(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
            
    sendPosition(lat, lon);
}

function onShowOwnPosition(position){
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    
    trackingViewModel.ownTrackingJob.latitude(lat);
    trackingViewModel.ownTrackingJob.longitude(lon);    
            
    showPosition(lat, lon, trackingViewModel.ownTrackingJob.marker);
}

function sendPosition(latitude, longitude){        
    var obj = new Parse.Object('Posts');
    
    obj.set('name', trackingViewModel.ownTrackingJob.identifier());
    obj.set('origin', 'web');  
    obj.set('latitude', latitude);
    obj.set('longitude', longitude);
    obj.set('timestamputc', UtcNow());

    obj.save();
}

function subscribeToPositionNotifications(trackingJob){
    var parseQuery = new Parse.Query('Posts');
    parseQuery.equalTo('name', trackingJob.identifier());
    trackingJob.subscription = parseQuery.subscribe();
    
    trackingJob.subscription.on('create', function(position) {
        var name = position.get('name');        
        var observedTrackingJob = trackingViewModel.observedTrackingJobs().find(function(v,i) { return v.identifier() == name });
        observedTrackingJob.latitude(position.get('latitude'));
        observedTrackingJob.longitude(position.get('longitude'));
        observedTrackingJob.utcTimestamp(position.get('timestamputc'));
                
        if (observedTrackingJob !== undefined && observedTrackingJob.updatePositionOnMap()){
            showPosition(position.get('latitude'), position.get('longitude'), observedTrackingJob.marker);    
        }                        
    });
}

function unsubscribeFromPositionNotifications(job){
    if (job.subscription !== undefined){
        job.subscription.unsubscribe();    
    }  
}

function onObserveChanged(job){
        if(job.observe() === true){
            subscribeToPositionNotifications(job);                        
        }else{
            unsubscribeFromPositionNotifications(job);
        }
}  

function stopTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);  
        printStatus("Stopped tracking.");      
    } else { 
        printStatus("Cannot reset geolocation tracking.");
    }
    
    unsubscribeFromPositionNotifications(trackingViewModel.ownTrackingJob);    
}

function initializeMap() {
    var mapholder = document.getElementById('mapholder')
    mapholder.style.height = '70%';
    // mapholder.style.width = '500px';
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

function loadTrackingPoints(){
    var utcBeginDate = new Date(beginDate()).toISOString();
    var utcEndDate = new Date(endDate()).toISOString();
    $.ajax({
    type: "POST",
    dataType : "json",
    url: "/api/trackingpoints",      
    contentType: "application/json",
    data : JSON.stringify({ beginDate : utcBeginDate, endDate : utcEndDate, trackingId : trackingId()}),
    success : showTrack
    });
}

function showTrack(geoPoints){
    if (map === undefined) return;

    var points = [];
	var bounds = new google.maps.LatLngBounds ();
	$(geoPoints).each(function() {
	  var lat = $(this).attr("latitude");
	  var lon = $(this).attr("longitude");
	  var p = new google.maps.LatLng(lat, lon);
	  points.push(p);
	  bounds.extend(p);
	});

	var poly = new google.maps.Polyline({
	  // use your own style here
	  path: points,
	  strokeColor: "#FF00AA",
	  strokeOpacity: .7,
	  strokeWeight: 4
	});
	
	poly.setMap(map);		
	map.fitBounds(bounds);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            printStatus("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            printStatus("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            printStatus("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            printStatus("An unknown error occurred.");
            break;
    }
}

function printStatus(message){
    x.innerHTML = message;
}

function UtcNow() {
    var now = new Date(); 
var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
return now_utc;
}