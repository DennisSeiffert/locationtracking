importScripts("parse-latest.js")

var _this = this;

Parse.initialize("myAppId", "unused");
Parse.serverURL = this.location.host + "/parse";


self.addEventListener("message", function (event) {
    var data = event.data;

    if (data.command === "subscribe") {
        console.log("Broadcasting to clients");  
        _this.subscribe(data.message);
    }

    return null;
});


self.addEventListener("install", function (event) {
    console.log("installing....");
});

var subscribe = function (identifier) {
            var parseQuery = new Parse.Query('Posts');
            parseQuery.equalTo("name", identifier);
            var subscription = parseQuery.subscribe();
            subscription.on("create", function (position) {
                var name = toString(position.get("name"));
                var latitude = position.get("latitude");
                var longitude = position.get("longitude");
                var timestamp = position.get("timestamputc");
                _this.clients.matchAll().then(function (clients) {
                        clients.forEach(function (client) {
                                client.postMessage({
                                    'command' : 'ReceivedPositionUpdate',
                                    'name' : name,
                                    'latitude' : latitude,
                                    'longitude' : longitude,
                                    'timestamputc' : timestamp,
                                });
                        });
                });                                
            });
}