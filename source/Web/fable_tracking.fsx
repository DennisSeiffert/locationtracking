let subscribeToPositionNotifications trackingJob = 
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