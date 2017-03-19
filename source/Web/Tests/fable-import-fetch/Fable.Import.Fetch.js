var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
export var GlobalFetch = function () {
        function GlobalFetch() {
                _classCallCheck(this, GlobalFetch);
        }

        _createClass(GlobalFetch, [{
                key: _Symbol.reflection,
                value: function () {
                        return {
                                type: "Fable.Import.Fetch.GlobalFetch",
                                properties: {}
                        };
                }
        }]);

        return GlobalFetch;
}();
setType("Fable.Import.Fetch.GlobalFetch", GlobalFetch);
//# sourceMappingURL=Fable.Import.Fetch.js.map