var _this = this;

import { LocationService } from "./fable_backend";
export var locationService = new LocationService("fefref");
self.addEventListener("message", function (event) {
    var data = event.data;

    if (data.command === "broadcast") {
        console.log("Broadcasting to clients");

        _this.clients.matchAll().then(function (clients) {
            clients.forEach(function (client) {
                client.postMessage("{\n                                    command : 'broadcastOnRequest'\n                                    message : 'This is a broadcast on request from the SW'\n                                   }");
            });
        });
    }

    return null;
});
self.addEventListener("install", function (event) {
    console.log("installing....");
});
//# sourceMappingURL=fable_observationServiceWorker.js.map