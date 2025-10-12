/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@deriv-com/analytics"), require("@deriv-com/derivatives-charts"), require("@deriv-com/translations"), require("@deriv/components"), require("@deriv/reports/src/Stores/useReportsStores"), require("@deriv/shared"), require("@deriv/shared/src/utils/helpers/market-underlying"), require("mobx"), require("mobx-react-lite"), require("react"), require("react-dom"), require("react-router"), require("react-router-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["@deriv-com/analytics", "@deriv-com/derivatives-charts", "@deriv-com/translations", "@deriv/components", "@deriv/reports/src/Stores/useReportsStores", "@deriv/shared", "@deriv/shared/src/utils/helpers/market-underlying", "mobx", "mobx-react-lite", "react", "react-dom", "react-router", "react-router-dom"], factory);
	else if(typeof exports === 'object')
		exports["@deriv/trader"] = factory(require("@deriv-com/analytics"), require("@deriv-com/derivatives-charts"), require("@deriv-com/translations"), require("@deriv/components"), require("@deriv/reports/src/Stores/useReportsStores"), require("@deriv/shared"), require("@deriv/shared/src/utils/helpers/market-underlying"), require("mobx"), require("mobx-react-lite"), require("react"), require("react-dom"), require("react-router"), require("react-router-dom"));
	else
		root["@deriv/trader"] = factory(root["@deriv-com/analytics"], root["@deriv-com/derivatives-charts"], root["@deriv-com/translations"], root["@deriv/components"], root["@deriv/reports/src/Stores/useReportsStores"], root["@deriv/shared"], root["@deriv/shared/src/utils/helpers/market-underlying"], root["mobx"], root["mobx-react-lite"], root["react"], root["react-dom"], root["react-router"], root["react-router-dom"]);
})(self, (__WEBPACK_EXTERNAL_MODULE__deriv_com_analytics__, __WEBPACK_EXTERNAL_MODULE__deriv_com_derivatives_charts__, __WEBPACK_EXTERNAL_MODULE__deriv_com_translations__, __WEBPACK_EXTERNAL_MODULE__deriv_components__, __WEBPACK_EXTERNAL_MODULE__deriv_reports_src_Stores_useReportsStores__, __WEBPACK_EXTERNAL_MODULE__deriv_shared__, __WEBPACK_EXTERNAL_MODULE__deriv_shared_src_utils_helpers_market_underlying__, __WEBPACK_EXTERNAL_MODULE_mobx__, __WEBPACK_EXTERNAL_MODULE_mobx_react_lite__, __WEBPACK_EXTERNAL_MODULE_react__, __WEBPACK_EXTERNAL_MODULE_react_dom__, __WEBPACK_EXTERNAL_MODULE_react_router__, __WEBPACK_EXTERNAL_MODULE_react_router_dom__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/@deriv-com/ui/dist/_commonjsHelpers-BkfeUUK-.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/@deriv-com/ui/dist/_commonjsHelpers-BkfeUUK-.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   a: () => (/* binding */ l),\n/* harmony export */   c: () => (/* binding */ u),\n/* harmony export */   g: () => (/* binding */ f)\n/* harmony export */ });\nvar u = typeof globalThis < \"u\" ? globalThis : typeof window < \"u\" ? window : typeof global < \"u\" ? global : typeof self < \"u\" ? self : {};\nfunction f(e) {\n  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, \"default\") ? e.default : e;\n}\nfunction l(e) {\n  if (e.__esModule) return e;\n  var r = e.default;\n  if (typeof r == \"function\") {\n    var t = function o() {\n      return this instanceof o ? Reflect.construct(r, arguments, this.constructor) : r.apply(this, arguments);\n    };\n    t.prototype = r.prototype;\n  } else t = {};\n  return Object.defineProperty(t, \"__esModule\", { value: !0 }), Object.keys(e).forEach(function(o) {\n    var n = Object.getOwnPropertyDescriptor(e, o);\n    Object.defineProperty(t, o, n.get ? n : {\n      enumerable: !0,\n      get: function() {\n        return e[o];\n      }\n    });\n  }), t;\n}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi4vLi4vbm9kZV9tb2R1bGVzL0BkZXJpdi1jb20vdWkvZGlzdC9fY29tbW9uanNIZWxwZXJzLUJrZmVVVUstLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BkZXJpdi90cmFkZXIvLi4vLi4vbm9kZV9tb2R1bGVzL0BkZXJpdi1jb20vdWkvZGlzdC9fY29tbW9uanNIZWxwZXJzLUJrZmVVVUstLmpzPzRkM2YiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIHUgPSB0eXBlb2YgZ2xvYmFsVGhpcyA8IFwidVwiID8gZ2xvYmFsVGhpcyA6IHR5cGVvZiB3aW5kb3cgPCBcInVcIiA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgPCBcInVcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmIDwgXCJ1XCIgPyBzZWxmIDoge307XG5mdW5jdGlvbiBmKGUpIHtcbiAgcmV0dXJuIGUgJiYgZS5fX2VzTW9kdWxlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLCBcImRlZmF1bHRcIikgPyBlLmRlZmF1bHQgOiBlO1xufVxuZnVuY3Rpb24gbChlKSB7XG4gIGlmIChlLl9fZXNNb2R1bGUpIHJldHVybiBlO1xuICB2YXIgciA9IGUuZGVmYXVsdDtcbiAgaWYgKHR5cGVvZiByID09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciB0ID0gZnVuY3Rpb24gbygpIHtcbiAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgbyA/IFJlZmxlY3QuY29uc3RydWN0KHIsIGFyZ3VtZW50cywgdGhpcy5jb25zdHJ1Y3RvcikgOiByLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICB0LnByb3RvdHlwZSA9IHIucHJvdG90eXBlO1xuICB9IGVsc2UgdCA9IHt9O1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHQsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiAhMCB9KSwgT2JqZWN0LmtleXMoZSkuZm9yRWFjaChmdW5jdGlvbihvKSB7XG4gICAgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIG8pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LCBvLCBuLmdldCA/IG4gOiB7XG4gICAgICBlbnVtZXJhYmxlOiAhMCxcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBlW29dO1xuICAgICAgfVxuICAgIH0pO1xuICB9KSwgdDtcbn1cbmV4cG9ydCB7XG4gIGwgYXMgYSxcbiAgdSBhcyBjLFxuICBmIGFzIGdcbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///../../node_modules/@deriv-com/ui/dist/_commonjsHelpers-BkfeUUK-.js\n\n}");

/***/ }),

/***/ "../../node_modules/@deriv-com/ui/dist/hooks/useDevice.js":
/*!****************************************************************!*\
  !*** ../../node_modules/@deriv-com/ui/dist/hooks/useDevice.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useDevice: () => (/* binding */ d)\n/* harmony export */ });\n/* harmony import */ var _index_EY1gwl5O_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../index-EY1gwl5O.js */ \"../../node_modules/@deriv-com/ui/dist/index-EY1gwl5O.js\");\n\nconst d = () => {\n  const i = (0,_index_EY1gwl5O_js__WEBPACK_IMPORTED_MODULE_0__.u)(\"(min-width: 1280px)\"), a = (0,_index_EY1gwl5O_js__WEBPACK_IMPORTED_MODULE_0__.u)(\"(max-width: 600px)\"), n = (0,_index_EY1gwl5O_js__WEBPACK_IMPORTED_MODULE_0__.u)(\n    \"(min-width: 601px) and (max-width: 1279px)\"\n  ), e = (0,_index_EY1gwl5O_js__WEBPACK_IMPORTED_MODULE_0__.u)(\n    \"(min-width: 601px) and (max-width: 1279px) and (orientation: portrait)\"\n  ), o = (0,_index_EY1gwl5O_js__WEBPACK_IMPORTED_MODULE_0__.u)(\n    \"(max-width: 1279px) and (orientation: landscape)\"\n  );\n  return {\n    /** returns Larger screen tablets [min-width: 1280px] */\n    isDesktop: i,\n    /**  returns Smaller screen tablets [max-width: 600px] */\n    isMobile: a,\n    /** returns Larger screen phones and smaller screen desktop [min-width: 601px and max-width: 1279px] */\n    isTablet: n,\n    /** returns tablet screen with portrait orientation [min-width: 601px and max-width: 1279px and orientation: portrait] */\n    isTabletPortrait: e,\n    /** returns mobile or medium screens in landscape orientation [max-width: 1279px and orientation: landscape] */\n    isMobileOrTabletLandscape: o\n  };\n};\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi4vLi4vbm9kZV9tb2R1bGVzL0BkZXJpdi1jb20vdWkvZGlzdC9ob29rcy91c2VEZXZpY2UuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGRlcml2L3RyYWRlci8uLi8uLi9ub2RlX21vZHVsZXMvQGRlcml2LWNvbS91aS9kaXN0L2hvb2tzL3VzZURldmljZS5qcz9kZjY4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHUgYXMgdCB9IGZyb20gXCIuLi9pbmRleC1FWTFnd2w1Ty5qc1wiO1xuY29uc3QgZCA9ICgpID0+IHtcbiAgY29uc3QgaSA9IHQoXCIobWluLXdpZHRoOiAxMjgwcHgpXCIpLCBhID0gdChcIihtYXgtd2lkdGg6IDYwMHB4KVwiKSwgbiA9IHQoXG4gICAgXCIobWluLXdpZHRoOiA2MDFweCkgYW5kIChtYXgtd2lkdGg6IDEyNzlweClcIlxuICApLCBlID0gdChcbiAgICBcIihtaW4td2lkdGg6IDYwMXB4KSBhbmQgKG1heC13aWR0aDogMTI3OXB4KSBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdClcIlxuICApLCBvID0gdChcbiAgICBcIihtYXgtd2lkdGg6IDEyNzlweCkgYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKVwiXG4gICk7XG4gIHJldHVybiB7XG4gICAgLyoqIHJldHVybnMgTGFyZ2VyIHNjcmVlbiB0YWJsZXRzIFttaW4td2lkdGg6IDEyODBweF0gKi9cbiAgICBpc0Rlc2t0b3A6IGksXG4gICAgLyoqICByZXR1cm5zIFNtYWxsZXIgc2NyZWVuIHRhYmxldHMgW21heC13aWR0aDogNjAwcHhdICovXG4gICAgaXNNb2JpbGU6IGEsXG4gICAgLyoqIHJldHVybnMgTGFyZ2VyIHNjcmVlbiBwaG9uZXMgYW5kIHNtYWxsZXIgc2NyZWVuIGRlc2t0b3AgW21pbi13aWR0aDogNjAxcHggYW5kIG1heC13aWR0aDogMTI3OXB4XSAqL1xuICAgIGlzVGFibGV0OiBuLFxuICAgIC8qKiByZXR1cm5zIHRhYmxldCBzY3JlZW4gd2l0aCBwb3J0cmFpdCBvcmllbnRhdGlvbiBbbWluLXdpZHRoOiA2MDFweCBhbmQgbWF4LXdpZHRoOiAxMjc5cHggYW5kIG9yaWVudGF0aW9uOiBwb3J0cmFpdF0gKi9cbiAgICBpc1RhYmxldFBvcnRyYWl0OiBlLFxuICAgIC8qKiByZXR1cm5zIG1vYmlsZSBvciBtZWRpdW0gc2NyZWVucyBpbiBsYW5kc2NhcGUgb3JpZW50YXRpb24gW21heC13aWR0aDogMTI3OXB4IGFuZCBvcmllbnRhdGlvbjogbGFuZHNjYXBlXSAqL1xuICAgIGlzTW9iaWxlT3JUYWJsZXRMYW5kc2NhcGU6IG9cbiAgfTtcbn07XG5leHBvcnQge1xuICBkIGFzIHVzZURldmljZVxufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///../../node_modules/@deriv-com/ui/dist/hooks/useDevice.js\n\n}");

/***/ }),

/***/ "../../node_modules/@deriv-com/ui/dist/index-EY1gwl5O.js":
/*!***************************************************************!*\
  !*** ../../node_modules/@deriv-com/ui/dist/index-EY1gwl5O.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   a: () => (/* binding */ g),\n/* harmony export */   u: () => (/* binding */ O)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var _commonjsHelpers_BkfeUUK_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_commonjsHelpers-BkfeUUK-.js */ \"../../node_modules/@deriv-com/ui/dist/_commonjsHelpers-BkfeUUK-.js\");\n\n\nvar v = typeof _commonjsHelpers_BkfeUUK_js__WEBPACK_IMPORTED_MODULE_1__.c == \"object\" && _commonjsHelpers_BkfeUUK_js__WEBPACK_IMPORTED_MODULE_1__.c && _commonjsHelpers_BkfeUUK_js__WEBPACK_IMPORTED_MODULE_1__.c.Object === Object && _commonjsHelpers_BkfeUUK_js__WEBPACK_IMPORTED_MODULE_1__.c, E = typeof self == \"object\" && self && self.Object === Object && self;\nv || E || Function(\"return this\")();\nvar f = typeof window < \"u\" ? react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect : react__WEBPACK_IMPORTED_MODULE_0__.useEffect;\nfunction L(t, s, o, i) {\n  const c = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(s);\n  f(() => {\n    c.current = s;\n  }, [s]), (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\n    const n = window;\n    if (!(n && n.addEventListener))\n      return;\n    const r = (e) => {\n      c.current(e);\n    };\n    return n.addEventListener(t, r, i), () => {\n      n.removeEventListener(t, r, i);\n    };\n  }, [t, o, i]);\n}\nvar h = typeof window > \"u\";\nfunction O(t, {\n  defaultValue: s = !1,\n  initializeWithValue: o = !0\n} = {}) {\n  const i = (e) => h ? s : window.matchMedia(e).matches, [c, n] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => o ? i(t) : s);\n  function r() {\n    n(i(t));\n  }\n  return f(() => {\n    const e = window.matchMedia(t);\n    return r(), e.addListener ? e.addListener(r) : e.addEventListener(\"change\", r), () => {\n      e.removeListener ? e.removeListener(r) : e.removeEventListener(\"change\", r);\n    };\n  }, [t]), c;\n}\nfunction g(t, s, o = \"mousedown\", i = {}) {\n  L(\n    o,\n    (c) => {\n      const n = c.target;\n      if (!n || !n.isConnected)\n        return;\n      (Array.isArray(t) ? t.filter((e) => !!e.current).every((e) => e.current && !e.current.contains(n)) : t.current && !t.current.contains(n)) && s(c);\n    },\n    void 0,\n    i\n  );\n}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi4vLi4vbm9kZV9tb2R1bGVzL0BkZXJpdi1jb20vdWkvZGlzdC9pbmRleC1FWTFnd2w1Ty5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGRlcml2L3RyYWRlci8uLi8uLi9ub2RlX21vZHVsZXMvQGRlcml2LWNvbS91aS9kaXN0L2luZGV4LUVZMWd3bDVPLmpzPzExM2QiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUgYXMgZCwgdXNlTGF5b3V0RWZmZWN0IGFzIG0sIHVzZUVmZmVjdCBhcyB1LCB1c2VSZWYgYXMgbCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgYyBhcyBhIH0gZnJvbSBcIi4vX2NvbW1vbmpzSGVscGVycy1Ca2ZlVVVLLS5qc1wiO1xudmFyIHYgPSB0eXBlb2YgYSA9PSBcIm9iamVjdFwiICYmIGEgJiYgYS5PYmplY3QgPT09IE9iamVjdCAmJiBhLCBFID0gdHlwZW9mIHNlbGYgPT0gXCJvYmplY3RcIiAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcbnYgfHwgRSB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG52YXIgZiA9IHR5cGVvZiB3aW5kb3cgPCBcInVcIiA/IG0gOiB1O1xuZnVuY3Rpb24gTCh0LCBzLCBvLCBpKSB7XG4gIGNvbnN0IGMgPSBsKHMpO1xuICBmKCgpID0+IHtcbiAgICBjLmN1cnJlbnQgPSBzO1xuICB9LCBbc10pLCB1KCgpID0+IHtcbiAgICBjb25zdCBuID0gd2luZG93O1xuICAgIGlmICghKG4gJiYgbi5hZGRFdmVudExpc3RlbmVyKSlcbiAgICAgIHJldHVybjtcbiAgICBjb25zdCByID0gKGUpID0+IHtcbiAgICAgIGMuY3VycmVudChlKTtcbiAgICB9O1xuICAgIHJldHVybiBuLmFkZEV2ZW50TGlzdGVuZXIodCwgciwgaSksICgpID0+IHtcbiAgICAgIG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcih0LCByLCBpKTtcbiAgICB9O1xuICB9LCBbdCwgbywgaV0pO1xufVxudmFyIGggPSB0eXBlb2Ygd2luZG93ID4gXCJ1XCI7XG5mdW5jdGlvbiBPKHQsIHtcbiAgZGVmYXVsdFZhbHVlOiBzID0gITEsXG4gIGluaXRpYWxpemVXaXRoVmFsdWU6IG8gPSAhMFxufSA9IHt9KSB7XG4gIGNvbnN0IGkgPSAoZSkgPT4gaCA/IHMgOiB3aW5kb3cubWF0Y2hNZWRpYShlKS5tYXRjaGVzLCBbYywgbl0gPSBkKCgpID0+IG8gPyBpKHQpIDogcyk7XG4gIGZ1bmN0aW9uIHIoKSB7XG4gICAgbihpKHQpKTtcbiAgfVxuICByZXR1cm4gZigoKSA9PiB7XG4gICAgY29uc3QgZSA9IHdpbmRvdy5tYXRjaE1lZGlhKHQpO1xuICAgIHJldHVybiByKCksIGUuYWRkTGlzdGVuZXIgPyBlLmFkZExpc3RlbmVyKHIpIDogZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIHIpLCAoKSA9PiB7XG4gICAgICBlLnJlbW92ZUxpc3RlbmVyID8gZS5yZW1vdmVMaXN0ZW5lcihyKSA6IGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCByKTtcbiAgICB9O1xuICB9LCBbdF0pLCBjO1xufVxuZnVuY3Rpb24gZyh0LCBzLCBvID0gXCJtb3VzZWRvd25cIiwgaSA9IHt9KSB7XG4gIEwoXG4gICAgbyxcbiAgICAoYykgPT4ge1xuICAgICAgY29uc3QgbiA9IGMudGFyZ2V0O1xuICAgICAgaWYgKCFuIHx8ICFuLmlzQ29ubmVjdGVkKVxuICAgICAgICByZXR1cm47XG4gICAgICAoQXJyYXkuaXNBcnJheSh0KSA/IHQuZmlsdGVyKChlKSA9PiAhIWUuY3VycmVudCkuZXZlcnkoKGUpID0+IGUuY3VycmVudCAmJiAhZS5jdXJyZW50LmNvbnRhaW5zKG4pKSA6IHQuY3VycmVudCAmJiAhdC5jdXJyZW50LmNvbnRhaW5zKG4pKSAmJiBzKGMpO1xuICAgIH0sXG4gICAgdm9pZCAwLFxuICAgIGlcbiAgKTtcbn1cbmV4cG9ydCB7XG4gIGcgYXMgYSxcbiAgTyBhcyB1XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///../../node_modules/@deriv-com/ui/dist/index-EY1gwl5O.js\n\n}");

/***/ }),

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _deriv_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @deriv/components */ \"@deriv/components\");\n/* harmony import */ var _deriv_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_deriv_components__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _deriv_shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @deriv/shared */ \"@deriv/shared\");\n/* harmony import */ var _deriv_shared__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_deriv_shared__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _deriv_com_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @deriv-com/ui */ \"../../node_modules/@deriv-com/ui/dist/hooks/useDevice.js\");\n\n\n\n\nvar AppLoader = (0,_deriv_shared__WEBPACK_IMPORTED_MODULE_2__.makeLazyLoader)(function () {\n  return (0,_deriv_shared__WEBPACK_IMPORTED_MODULE_2__.moduleLoader)(function () {\n    return Promise.all(/*! import() | trader-app */[__webpack_require__.e(\"vendors-node_modules_deriv_quill-icons_dist_esm_react_Legacy_LegacyAccumulatorIcon_js-node_mo-b2e3b6\"), __webpack_require__.e(\"vendors-node_modules_deriv_quill-icons_dist_esm_react_Legacy_LegacyArrowDown1pxIcon_js-node_m-091da4\"), __webpack_require__.e(\"src_App_Components_Elements_PositionsDrawer_helpers_index_ts-src_App_init-store_ts-src_Module-64739f\"), __webpack_require__.e(\"trader-app\")]).then(__webpack_require__.bind(__webpack_require__, /*! ./App/index */ \"./src/App/index.tsx\"));\n  });\n}, function () {\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_deriv_components__WEBPACK_IMPORTED_MODULE_1__.Loading, null);\n})();\nvar AppV2Loader = (0,_deriv_shared__WEBPACK_IMPORTED_MODULE_2__.makeLazyLoader)(function () {\n  return (0,_deriv_shared__WEBPACK_IMPORTED_MODULE_2__.moduleLoader)(function () {\n    return Promise.all(/*! import() | trader-app-v2 */[__webpack_require__.e(\"vendors-node_modules_deriv_quill-icons_dist_esm_react_Legacy_LegacyAccumulatorIcon_js-node_mo-b2e3b6\"), __webpack_require__.e(\"vendors-node_modules_cloudflare_stream-react_dist_stream-react_esm_js-node_modules_deriv_quil-b38a48\"), __webpack_require__.e(\"src_App_Components_Elements_PositionsDrawer_helpers_index_ts-src_App_init-store_ts-src_Module-64739f\"), __webpack_require__.e(\"src_Modules_Contract_Containers_replay-chart_tsx-src_Stores_Modules_Trading_Helpers_logic_ts\"), __webpack_require__.e(\"trader-app-v2\")]).then(__webpack_require__.bind(__webpack_require__, /*! ./AppV2/index */ \"./src/AppV2/index.tsx\"));\n  });\n}, function () {\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_deriv_components__WEBPACK_IMPORTED_MODULE_1__.Loading.DTraderV2, {\n    initial_app_loading: true,\n    is_contract_details: window.location.pathname.startsWith('/contract/'),\n    is_positions: window.location.pathname === _deriv_shared__WEBPACK_IMPORTED_MODULE_2__.routes.trader_positions,\n    is_closed_tab: (0,_deriv_shared__WEBPACK_IMPORTED_MODULE_2__.getPositionsV2TabIndexFromURL)() === 1\n  });\n})();\nvar App = function App(_ref) {\n  var passthrough = _ref.passthrough;\n  var _useDevice = (0,_deriv_com_ui__WEBPACK_IMPORTED_MODULE_3__.useDevice)(),\n    isMobile = _useDevice.isMobile;\n  return isMobile ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(AppV2Loader, {\n    passthrough: passthrough\n  }) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(AppLoader, {\n    passthrough: passthrough\n  });\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXgudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFFQTtBQUNBO0FBRUE7QUFXQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFBQTtBQUdBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUlBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZGVyaXYvdHJhZGVyLy4vc3JjL2luZGV4LnRzeD9kOTg2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcblxyXG5pbXBvcnQgeyBMb2FkaW5nIH0gZnJvbSAnQGRlcml2L2NvbXBvbmVudHMnO1xyXG5pbXBvcnQgeyBnZXRQb3NpdGlvbnNWMlRhYkluZGV4RnJvbVVSTCwgbWFrZUxhenlMb2FkZXIsIG1vZHVsZUxvYWRlciwgcm91dGVzIH0gZnJvbSAnQGRlcml2L3NoYXJlZCc7XHJcbmltcG9ydCB7IFRDb3JlU3RvcmVzIH0gZnJvbSAnQGRlcml2L3N0b3Jlcy90eXBlcyc7XHJcbmltcG9ydCB7IHVzZURldmljZSB9IGZyb20gJ0BkZXJpdi1jb20vdWknO1xyXG5cclxuaW1wb3J0IHsgVFdlYlNvY2tldCB9IGZyb20gJ1R5cGVzJztcclxuXHJcbnR5cGUgQXBwdHlwZXMgPSB7XHJcbiAgICBwYXNzdGhyb3VnaDoge1xyXG4gICAgICAgIHJvb3Rfc3RvcmU6IFRDb3JlU3RvcmVzO1xyXG4gICAgICAgIFdTOiBUV2ViU29ja2V0O1xyXG4gICAgfTtcclxufTtcclxuXHJcbmNvbnN0IEFwcExvYWRlciA9IG1ha2VMYXp5TG9hZGVyKFxyXG4gICAgKCkgPT4gbW9kdWxlTG9hZGVyKCgpID0+IGltcG9ydCgvKiB3ZWJwYWNrQ2h1bmtOYW1lOiBcInRyYWRlci1hcHBcIiwgd2VicGFja1ByZWxvYWQ6IHRydWUgKi8gJy4vQXBwL2luZGV4JykpLFxyXG4gICAgKCkgPT4gPExvYWRpbmcgLz5cclxuKSgpIGFzIFJlYWN0LkNvbXBvbmVudFR5cGU8QXBwdHlwZXM+O1xyXG5cclxuY29uc3QgQXBwVjJMb2FkZXIgPSBtYWtlTGF6eUxvYWRlcihcclxuICAgICgpID0+IG1vZHVsZUxvYWRlcigoKSA9PiBpbXBvcnQoLyogd2VicGFja0NodW5rTmFtZTogXCJ0cmFkZXItYXBwLXYyXCIsIHdlYnBhY2tQcmVsb2FkOiB0cnVlICovICcuL0FwcFYyL2luZGV4JykpLFxyXG4gICAgKCkgPT4gKFxyXG4gICAgICAgIDxMb2FkaW5nLkRUcmFkZXJWMlxyXG4gICAgICAgICAgICBpbml0aWFsX2FwcF9sb2FkaW5nXHJcbiAgICAgICAgICAgIGlzX2NvbnRyYWN0X2RldGFpbHM9e3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdGFydHNXaXRoKCcvY29udHJhY3QvJyl9XHJcbiAgICAgICAgICAgIGlzX3Bvc2l0aW9ucz17d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSByb3V0ZXMudHJhZGVyX3Bvc2l0aW9uc31cclxuICAgICAgICAgICAgaXNfY2xvc2VkX3RhYj17Z2V0UG9zaXRpb25zVjJUYWJJbmRleEZyb21VUkwoKSA9PT0gMX1cclxuICAgICAgICAvPlxyXG4gICAgKVxyXG4pKCkgYXMgUmVhY3QuQ29tcG9uZW50VHlwZTxBcHB0eXBlcz47XHJcblxyXG5jb25zdCBBcHAgPSAoeyBwYXNzdGhyb3VnaCB9OiBBcHB0eXBlcykgPT4ge1xyXG4gICAgY29uc3QgeyBpc01vYmlsZSB9ID0gdXNlRGV2aWNlKCk7XHJcbiAgICByZXR1cm4gaXNNb2JpbGUgPyA8QXBwVjJMb2FkZXIgcGFzc3Rocm91Z2g9e3Bhc3N0aHJvdWdofSAvPiA6IDxBcHBMb2FkZXIgcGFzc3Rocm91Z2g9e3Bhc3N0aHJvdWdofSAvPjtcclxufTtcclxuZXhwb3J0IGRlZmF1bHQgQXBwO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/index.tsx\n\n}");

/***/ }),

/***/ "@deriv-com/analytics":
/*!***************************************!*\
  !*** external "@deriv-com/analytics" ***!
  \***************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__deriv_com_analytics__;

/***/ }),

/***/ "@deriv-com/derivatives-charts":
/*!************************************************!*\
  !*** external "@deriv-com/derivatives-charts" ***!
  \************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__deriv_com_derivatives_charts__;

/***/ }),

/***/ "@deriv-com/translations":
/*!******************************************!*\
  !*** external "@deriv-com/translations" ***!
  \******************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__deriv_com_translations__;

/***/ }),

/***/ "@deriv/components":
/*!************************************!*\
  !*** external "@deriv/components" ***!
  \************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__deriv_components__;

/***/ }),

/***/ "@deriv/reports/src/Stores/useReportsStores":
/*!*************************************************************!*\
  !*** external "@deriv/reports/src/Stores/useReportsStores" ***!
  \*************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__deriv_reports_src_Stores_useReportsStores__;

/***/ }),

/***/ "@deriv/shared":
/*!********************************!*\
  !*** external "@deriv/shared" ***!
  \********************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__deriv_shared__;

/***/ }),

/***/ "@deriv/shared/src/utils/helpers/market-underlying":
/*!********************************************************************!*\
  !*** external "@deriv/shared/src/utils/helpers/market-underlying" ***!
  \********************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__deriv_shared_src_utils_helpers_market_underlying__;

/***/ }),

/***/ "mobx":
/*!***********************!*\
  !*** external "mobx" ***!
  \***********************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_mobx__;

/***/ }),

/***/ "mobx-react-lite":
/*!**********************************!*\
  !*** external "mobx-react-lite" ***!
  \**********************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_mobx_react_lite__;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_react_dom__;

/***/ }),

/***/ "react-router":
/*!*******************************!*\
  !*** external "react-router" ***!
  \*******************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_react_router__;

/***/ }),

/***/ "react-router-dom":
/*!***********************************!*\
  !*** external "react-router-dom" ***!
  \***********************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_react_router_dom__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk prefetch function */
/******/ 	(() => {
/******/ 		__webpack_require__.F = {};
/******/ 		__webpack_require__.E = (chunkId) => {
/******/ 			Object.keys(__webpack_require__.F).map((key) => {
/******/ 				__webpack_require__.F[key](chunkId);
/******/ 			});
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "trader/js/trader." + chunkId + "." + {"vendors-node_modules_deriv_quill-icons_dist_esm_react_Legacy_LegacyAccumulatorIcon_js-node_mo-b2e3b6":"c271ab0dcf8d2e912962","vendors-node_modules_deriv_quill-icons_dist_esm_react_Legacy_LegacyArrowDown1pxIcon_js-node_m-091da4":"8dbe466a617f3307b532","src_App_Components_Elements_PositionsDrawer_helpers_index_ts-src_App_init-store_ts-src_Module-64739f":"efcce59d23b60d58de39","trader-app":"8b8258e8b94b5c0b8033","vendors-node_modules_cloudflare_stream-react_dist_stream-react_esm_js-node_modules_deriv_quil-b38a48":"4b9516ab7288f5a2315e","src_Modules_Contract_Containers_replay-chart_tsx-src_Stores_Modules_Trading_Helpers_logic_ts":"bd96b0359f21af6f71b2","trader-app-v2":"77aae9973d248969de1e","trade-modals":"30692025e45b147f4437","error-component":"f71825c9153e15a14c59","vendors-node_modules_deriv_quill-icons_dist_esm_react_Illustration_DerivLightEmptyCardboardBo-1317ad":"93be6c72ccf712ef2128","contract":"736a8bc969799ab106a9","market-countdown-timer":"ac6e8b480aa74b410b59","vendors-node_modules_deriv_quill-icons_dist_esm_react_LabelPaired_LabelPairedChevronsDownCapt-843178":"f39121abe21d5acbd94d","src_Modules_Trading_Components_Form_TradeParams_Accumulator_accumulators-info-display_tsx-src-a7086a":"1b0f875cc948ca426728","screen-small":"012823bd52c93b533a0c","screen-large":"367b22c5a394d4022995","settings-chart":"3adca034431b72841fd4","accumulators-trade-description":"1dedcfbc68ed3eef4519","multipliers-trade-description":"654f31f75a22889b0691","vanillas-trade-description":"6e84c7b9cf7efcd11d32","turbos-trade-description":"b32dc34e8e20ab93416a","rise-fall-trade-description":"b2a1dbf6db365f326eed","higher-lower-trade-description":"7c213620d557f6651312","touch-no-touch-trade-description":"892d398aab2e54172831","matches-differs-trade-description":"d283236530e58d970589","even-odd-trade-description":"d5efd8ec4f6076d58567","over-under-trade-description":"1fdeba9b985151dc7f67"}[chunkId] + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "trader/css/trader." + chunkId + "." + {"vendors-node_modules_deriv_quill-icons_dist_esm_react_Legacy_LegacyAccumulatorIcon_js-node_mo-b2e3b6":"d7ac14b411fd81d3b28b","src_App_Components_Elements_PositionsDrawer_helpers_index_ts-src_App_init-store_ts-src_Module-64739f":"f7dfcb3b3f9eeea39620","trader-app":"3799d2636bba7e3a4740","vendors-node_modules_cloudflare_stream-react_dist_stream-react_esm_js-node_modules_deriv_quil-b38a48":"b3ff57fc68e6657abd97","trader-app-v2":"8947eedfedae8383c583","src_Modules_Trading_Components_Form_TradeParams_Accumulator_accumulators-info-display_tsx-src-a7086a":"ff43494817cccb6f84cd","screen-small":"6008654a9185512919e5"}[chunkId] + ".css";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "@deriv/trader:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/css loading */
/******/ 	(() => {
/******/ 		var createStylesheet = (chunkId, fullhref, resolve, reject) => {
/******/ 			var linkTag = document.createElement("link");
/******/ 		
/******/ 			linkTag.rel = "stylesheet";
/******/ 			linkTag.type = "text/css";
/******/ 			var onLinkComplete = (event) => {
/******/ 				// avoid mem leaks.
/******/ 				linkTag.onerror = linkTag.onload = null;
/******/ 				if (event.type === 'load') {
/******/ 					resolve();
/******/ 				} else {
/******/ 					var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 					var realHref = event && event.target && event.target.href || fullhref;
/******/ 					var err = new Error("Loading CSS chunk " + chunkId + " failed.\n(" + realHref + ")");
/******/ 					err.code = "CSS_CHUNK_LOAD_FAILED";
/******/ 					err.type = errorType;
/******/ 					err.request = realHref;
/******/ 					linkTag.parentNode.removeChild(linkTag)
/******/ 					reject(err);
/******/ 				}
/******/ 			}
/******/ 			linkTag.onerror = linkTag.onload = onLinkComplete;
/******/ 			linkTag.href = fullhref;
/******/ 		
/******/ 			document.head.appendChild(linkTag);
/******/ 			return linkTag;
/******/ 		};
/******/ 		var findStylesheet = (href, fullhref) => {
/******/ 			var existingLinkTags = document.getElementsByTagName("link");
/******/ 			for(var i = 0; i < existingLinkTags.length; i++) {
/******/ 				var tag = existingLinkTags[i];
/******/ 				var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");
/******/ 				if(tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return tag;
/******/ 			}
/******/ 			var existingStyleTags = document.getElementsByTagName("style");
/******/ 			for(var i = 0; i < existingStyleTags.length; i++) {
/******/ 				var tag = existingStyleTags[i];
/******/ 				var dataHref = tag.getAttribute("data-href");
/******/ 				if(dataHref === href || dataHref === fullhref) return tag;
/******/ 			}
/******/ 		};
/******/ 		var loadStylesheet = (chunkId) => {
/******/ 			return new Promise((resolve, reject) => {
/******/ 				var href = __webpack_require__.miniCssF(chunkId);
/******/ 				var fullhref = __webpack_require__.p + href;
/******/ 				if(findStylesheet(href, fullhref)) return resolve();
/******/ 				createStylesheet(chunkId, fullhref, resolve, reject);
/******/ 			});
/******/ 		}
/******/ 		// object to store loaded CSS chunks
/******/ 		var installedCssChunks = {
/******/ 			"trader": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.miniCss = (chunkId, promises) => {
/******/ 			var cssChunks = {"vendors-node_modules_deriv_quill-icons_dist_esm_react_Legacy_LegacyAccumulatorIcon_js-node_mo-b2e3b6":1,"src_App_Components_Elements_PositionsDrawer_helpers_index_ts-src_App_init-store_ts-src_Module-64739f":1,"trader-app":1,"vendors-node_modules_cloudflare_stream-react_dist_stream-react_esm_js-node_modules_deriv_quil-b38a48":1,"trader-app-v2":1,"src_Modules_Trading_Components_Form_TradeParams_Accumulator_accumulators-info-display_tsx-src-a7086a":1,"screen-small":1};
/******/ 			if(installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);
/******/ 			else if(installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {
/******/ 				promises.push(installedCssChunks[chunkId] = loadStylesheet(chunkId).then(() => {
/******/ 					installedCssChunks[chunkId] = 0;
/******/ 				}, (e) => {
/******/ 					delete installedCssChunks[chunkId];
/******/ 					throw e;
/******/ 				}));
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no hmr
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"trader": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.F.j = (chunkId) => {
/******/ 			if((!__webpack_require__.o(installedChunks, chunkId) || installedChunks[chunkId] === undefined) && true) {
/******/ 				installedChunks[chunkId] = null;
/******/ 				var link = document.createElement('link');
/******/ 				link.charset = 'utf-8';
/******/ 		
/******/ 				if (__webpack_require__.nc) {
/******/ 					link.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				link.rel = "prefetch";
/******/ 				link.as = "script";
/******/ 				link.href = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 				document.head.appendChild(link);
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk_deriv_trader"] = self["webpackChunk_deriv_trader"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/chunk prefetch trigger */
/******/ 	(() => {
/******/ 		var chunkToChildrenMap = {
/******/ 			"trader-app": [
/******/ 				"settings-chart",
/******/ 				"trade-modals"
/******/ 			]
/******/ 		};
/******/ 		__webpack_require__.f.prefetch = (chunkId, promises) => (Promise.all(promises).then(() => {
/******/ 			var chunks = chunkToChildrenMap[chunkId];
/******/ 			Array.isArray(chunks) && chunks.map(__webpack_require__.E);
/******/ 		}));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module factories are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.tsx");
/******/ 	__webpack_exports__ = __webpack_exports__["default"];
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});