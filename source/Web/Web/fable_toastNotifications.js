var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { createElement, Component } from "react";
import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { Any, equals, extendInfo } from "fable-core/Util";
import { createConnector, withStateMapper, buildComponent } from "fable-reactredux/Fable.Helpers.ReactRedux";
import { LocationTracker } from "./fable_domainModel";
export var ToastNotifications = function (_Component) {
    _inherits(ToastNotifications, _Component);

    _createClass(ToastNotifications, [{
        key: _Symbol.reflection,
        value: function () {
            return extendInfo(ToastNotifications, {
                type: "Fable_toastNotifications.ToastNotifications",
                interfaces: [],
                properties: {}
            });
        }
    }]);

    function ToastNotifications(props) {
        _classCallCheck(this, ToastNotifications);

        var _this = _possibleConstructorReturn(this, (ToastNotifications.__proto__ || Object.getPrototypeOf(ToastNotifications)).call(this, props));

        return _this;
    }

    _createClass(ToastNotifications, [{
        key: "componentDidUpdate",
        value: function (prevProps, prevState) {
            return this.render();
        }
    }, {
        key: "render",
        value: function () {
            if (!equals(this.props.Error, null)) {
                jQuery.notify(this.props.Error);
            }

            return createElement("div", {
                id: "notifications",
                className: "toastNotifications"
            });
        }
    }]);

    return ToastNotifications;
}(Component);
setType("Fable_toastNotifications.ToastNotifications", ToastNotifications);

function mapStateToProps(state, ownprops) {
    return {
        Error: state.Error
    };
}

export var createToastNotifications = buildComponent(function (c) {
    return withStateMapper(function (state) {
        return function (ownprops) {
            return mapStateToProps(state, ownprops);
        };
    }, c);
}(createConnector()), {
    TComponent: ToastNotifications,
    TProps: Any,
    TCtx: Any,
    TState: LocationTracker
});
//# sourceMappingURL=fable_toastNotifications.js.map