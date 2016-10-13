/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _marksense = __webpack_require__(2);
	
	var _marksense2 = _interopRequireDefault(_marksense);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	window.MarkSense = _marksense2.default;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var MarkSense = function () {
	  function MarkSense() {
	    _classCallCheck(this, MarkSense);
	  }
	
	  // TODO: This can probably be done in a single loop 
	  // but will do for a prototype for now.
	  // TODO: generate n-grams for finding suggestions
	
	
	  _createClass(MarkSense, [{
	    key: 'generateMarkovChain',
	    value: function generateMarkovChain(corpus) {
	      var _this = this;
	
	      var lines = corpus.split('\n').filter(function (line) {
	        return !(line === null || line.match(/^ *$/) !== null || line.indexOf('}') > -1);
	      }).map(function (l) {
	        return {
	          code: l.trim(),
	          depth: _this.depth(l)
	        };
	      });
	
	      var chain = {};
	      chain['__ROOT__'] = {
	        depth: 0,
	        children: [],
	        parent: undefined
	      };
	
	      var _loop = function _loop(i) {
	        var line = lines[i],
	            parent = _this.getParentFromIndex(lines, i, line.depth);
	
	        if (chain[line.code]) {
	          chain[parent.code].children.find(function (child) {
	            return child.code === line.code;
	          }).count++;
	        } else {
	          chain[parent.code].children.push({
	            code: line.code,
	            probability: 0,
	            count: 1
	          });
	
	          chain[line.code] = {
	            depth: line.depth,
	            parent: parent.code,
	            children: []
	          };
	        }
	      };
	
	      for (var i = 0; i < lines.length; i++) {
	        _loop(i);
	      }
	
	      Object.keys(chain).forEach(function (key) {
	        var node = chain[key],
	            childrenCount = node.children.reduce(function (acc, curr) {
	          return acc + curr.count;
	        }, 0);
	        node.children.forEach(function (child) {
	          child.probability = child.count / childrenCount;
	        });
	      });
	
	      this.chain = chain;
	
	      return chain;
	    }
	  }, {
	    key: 'getSuggestions',
	    value: function getSuggestions(code) {
	      // TODO: generate n-grams and use them to find suggestions from partially typed lines
	
	      return this.chain[code];
	    }
	  }, {
	    key: 'getParentFromIndex',
	    value: function getParentFromIndex(lines, idx, currDepth) {
	      if (currDepth === 1) {
	        return { code: '__ROOT__', depth: 0 };
	      }
	
	      // traverse backwards until a node is hit with less depth, it's parent
	      for (var i = idx - 1; i >= 0; i--) {
	        if (lines[i].depth < currDepth) {
	          return lines[i];
	        }
	      }
	    }
	  }, {
	    key: 'depth',
	    value: function depth(line) {
	      return line.split('  ').length;
	    }
	  }]);
	
	  return MarkSense;
	}();
	
	exports.default = MarkSense;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map