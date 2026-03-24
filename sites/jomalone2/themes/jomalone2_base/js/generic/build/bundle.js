(function($, generic) {
  /**
   * This method is a getter or setter for changing or retrieving a cookie value.
   *
   * @class cookie
   * @namespace generic.cookie
   *
   * @param {string} name The name of the cookie to set or retrieve.
   * @param {string} value *OPTIONAL* When passed, this is the new value of the cookie.
   * @param {object} props *OPTIONAL* Object used to set additional props for the cookie.
   *
   * @return {string} When name is only passed, it will return the value of that cookie when available.
   */
  generic.cookie = function(name, value, props) {
    var c = document.cookie;
    if (arguments.length === 1) {
      var matches = c.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      if (matches) {
        matches = decodeURIComponent(matches[1]);
        try {
          return JSON.parse(matches); //Object
        } catch (e) {
          return matches; //String
        }
      } else {
        return undefined;
      }
    } else {
      props = props || {};
      var exp = props.expires;
      if (typeof exp === 'number') {
        var d = new Date();
        d.setTime(d.getTime() + exp * 24 * 60 * 60 * 1000);
        exp = props.expires = d;
      }
      if (exp && exp.toUTCString) {
        props.expires = exp.toUTCString();
      }

      value = encodeURIComponent(value);
      var updatedCookie = name + '=' + value;
      var propName;

      for (propName in props) {
        updatedCookie += '; ' + propName;
        var propValue = props[propName];
        if (propValue !== true) {
          updatedCookie += '=' + propValue;
        }
      }

      document.cookie = updatedCookie;
    }
  };
})(jQuery, window.generic || {});

jQuery,(window.generic||{}).cookie=function(e,r,n){var o=document.cookie;if(1===arguments.length){var t=o.match(new RegExp("(?:^|; )"+e+"=([^;]*)"));if(!t)return;t=decodeURIComponent(t[1]);try{return jQuery.parseJSON(t)}catch(e){return t}}else{var i=(n=n||{}).expires;if("number"==typeof i){var c=new Date;c.setTime(c.getTime()+24*i*60*60*1e3),i=n.expires=c}i&&i.toUTCString&&(n.expires=i.toUTCString());var a,u=e+"="+(r=encodeURIComponent(r));for(a in n){u+="; "+a;var m=n[a];!0!==m&&(u+="="+m)}document.cookie=u}};
//# sourceMappingURL=cookie.min.js.map

var generic = generic || {};

(function($) {
  if (!!window.localStorage) {
    var origSetItem = Storage.prototype.setItem;
    Object.defineProperty(Storage.prototype, 'setItem', {
      value: function() {
        var args = $.makeArray(arguments);
        if (!!args[0] && !!args[1]) {
          $(document).trigger('storage', [ args[0], args[1] ]);
        }
        origSetItem.apply(this, arguments);
      }
    });
  }
})(jQuery);

/**
 * Usage:
 *
 * var data = generic.data.get('SomeName');
 *
 * data.set('SomeName', { key: value }, {
 *   type: 'local',
 *   expires: function() {
 *     var date = new Date();
 *     date.setDate(date.getDate() + 1);  // today + 1 day
 *     return date;
 *   }
 * });
 */
generic.data = (function() {
  var data = {
    future: 9999999999,

    /**
     * Utility function
     */
    isFunction: function(val) {
      return !!(val && val.constructor && val.call && val.apply);
    },

    /**
     * Utility function
     */
    isEmpty: function(val) {
      var undef;
      var ev = [undef, null, false, 0, '', '0'];
      for (var i = 0, len = ev.length; i < len; i++) {
        if (val === ev[i]) {
          return true;
        }
      }
      return false;
    },

    /**
     * Utility function to detect an invalid storage type
     */
    isValidStoreType: function(type) {
      return !this.isEmpty(type) && ['local', 'session', 'cookie'].indexOf(type) != -1;
    },

    /**
     * Cookie storage object. It's a middle-man to the cookies.
     */
    cookieStorage: {
      getItem: function(name) {
        var c_start, c_end;
        if (document.cookie.length > 0) {
          c_start = document.cookie.indexOf(name + '=');
          if (c_start !== -1) {
            c_start = c_start + name.length + 1;
            c_end = document.cookie.indexOf(';', c_start);
            if (c_end === -1) {
              c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end)).replace(/^"(.*)"$/, '$1');
          }
        }
        return '';
      },

      setItem: function(name, value) {
        if (typeof value !== 'string') {
          value = JSON.parse(value);
        }
        var expires = value.expires;
        var date = new Date();
        date.setTime(expires * 1000); // data is passed as epoch seconds (not milli), so we multiply by 1000
        expires = ';expires=' + date.toGMTString();
        document.cookie = name + '=' + JSON.stringify(value).replace(/^"(.*)"$/, '$1') + expires + ';path=/';
      },

      removeItem: function(name) {
        this.setItem(name, '', -1);
      }
    },

    /**
     * Utility function to get the storage object from the type
     */
    getStore: function(key) {
      var map = {
        cookie: this.cookieStorage,
        local: window.localStorage,
        session: window.sessionStorage
      };

      var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
      key = isIE11 ? 'cookie' : key;

      return map[key] || false;
    },

    /**
     * Getter
     */
    get: function(name, type) {
      name = !this.isEmpty(name) ? name : false;
      type = this.isValidStoreType(type) ? type : 'local';

      var store = this.getStore(type);

      if (!name || !store) {
        return '';
      }

      var data = store.getItem(name);

      if (!data) {
        return '';
      }

      if (typeof data !== 'string') {
        data = JSON.parse(data);
      }

      // Removing the expiration feature because the react components won't be calling these helper methods
      // expires = (type != 'cookie' && !!data.expires) ? data.expires : this.future;
      // return (now < expires && !!data.data) ? data.data : '';
      return data;
    },

    /**
     * Setter
     */
    set: function(name, value, options) {
      options = !this.isEmpty(options) ? options : {};
      var type = !!options.type && this.isValidStoreType(options.type) ? options.type : 'local';
      var store = this.getStore(type);

      if (this.isEmpty(name) || !value || !store) {
        return false;
      }

      // Removing the expiration feature because the react components won't be calling these helper methods
      // var expires = options.expires || this.future;
      // if (this.isFunction(expires)) {
      //   expires = Math.round(expires().getTime() / 1000.0);
      // }

      // store.setItem(name, JSON.stringify({
      //   expires : expires,
      //   data    : value
      // }));

      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      store.setItem(name, value);
    },

    /**
     * Remover
     */
    remove: function(name, type) {
      name = !this.isEmpty(name) ? name : false;
      type = this.isValidStoreType(type) ? type : 'local';

      var store = this.getStore(type);
      store.removeItem(name);
    }
  };

  return data;
})();

/**
 * (function($) {
 *
 * $(function() {
 *    generic.data.set('Cart', {'greg': 'local'}, {
 *      type: 'cookie',
 *      expires: function() {
 *        var date = new Date();
 *        date.setDate(date.getDate() + 1);  // today + 1 day
 *        return date;
 *      }
 *    });
 *    var d = generic.data.get('Cart', 'local');
 * 
 *    console.log(' ---- storage demo ---- ');
 *    console.log(d);
 * });
 *
 * })(jQuery);
 **/

var generic=generic||{};!function(e){if(window.localStorage){var t=Storage.prototype.setItem;Object.defineProperty(Storage.prototype,"setItem",{value:function(){var o=e.makeArray(arguments);o[0]&&o[1]&&e(document).trigger("storage",[o[0],o[1]]),t.apply(this,arguments)}})}}(jQuery),generic.data={future:9999999999,isFunction:function(e){return!!(e&&e.constructor&&e.call&&e.apply)},isEmpty:function(e){for(var t=[void 0,null,!1,0,"","0"],o=0,i=t.length;o<i;o++)if(e===t[o])return!0;return!1},isValidStoreType:function(e){return!this.isEmpty(e)&&-1!=["local","session","cookie"].indexOf(e)},cookieStorage:{getItem:function(e){var t,o;return document.cookie.length>0&&-1!==(t=document.cookie.indexOf(e+"="))?(t=t+e.length+1,-1===(o=document.cookie.indexOf(";",t))&&(o=document.cookie.length),unescape(document.cookie.substring(t,o)).replace(/^"(.*)"$/,"$1")):""},setItem:function(e,t){"string"!=typeof t&&(t=JSON.parse(t));var o=t.expires,i=new Date;i.setTime(1e3*o),o=";expires="+i.toGMTString(),document.cookie=e+"="+JSON.stringify(t).replace(/^"(.*)"$/,"$1")+o+";path=/"},removeItem:function(e){this.setItem(e,"",-1)}},getStore:function(e){return{cookie:this.cookieStorage,local:window.localStorage,session:window.sessionStorage}[e=window.MSInputMethodContext&&document.documentMode?"cookie":e]||!1},get:function(e,t){e=!this.isEmpty(e)&&e,t=this.isValidStoreType(t)?t:"local";var o=this.getStore(t);if(!e||!o)return"";var i=o.getItem(e);return i?("string"!=typeof i&&(i=JSON.parse(i)),i):""},set:function(e,t,o){var i=(o=this.isEmpty(o)?{}:o).type&&this.isValidStoreType(o.type)?o.type:"local",n=this.getStore(i);if(this.isEmpty(e)||!t||!n)return!1;"string"!=typeof t&&(t=JSON.stringify(t)),n.setItem(e,t)},remove:function(e,t){e=!this.isEmpty(e)&&e,t=this.isValidStoreType(t)?t:"local",this.getStore(t).removeItem(e)}};
//# sourceMappingURL=data.min.js.map

(function($, generic) {
  generic.errorStateClassName = 'error';

  /**
   * This method displays error messages. It takes an array of error objects and a UL node
   * as parameters. If the UL is not spuulied, it will attempt to find a <UL class="error_messages">
   * in the DOM. It will then attempt to insert one directly after a <DIV id="header"> (If no header
   * is found, the method exits.) All the LI child nodes (previous messages) of the UL are hidden.
   * The text property of each error Hash is then displayed as an LI.
   * This method can also alter the style of the input elements that triggered the error.
   * The tags property in an error hash must be an array that contains a string starting with
   * "field." If the optional formNode parameter is supplied, this form node will be
   * searched for the field, and that field will be passed to the generic.showErrorState method.
   *
   * @example
   * var errArray = [
   *      {
   *          "text": "Last Name Alternate must use Kana characters.",
   *          "display_locations": [],
   *          "severity": "MESSAGE",
   *          "tags": ["FORM", "address", "field.last_name_alternate"],
   *          "key": "unicode_script.last_name_alternate.address"
   *      },
   *      {
   *          "text": "First Name Alternate must use Kana characters.",
   *          "display_locations": [],
   *          "severity": "MESSAGE",
   *          "tags": ["FORM", "address", "field.first_name_alternate"],
   *          "key": "unicode_script.first_name_alternate.address"
   *      }
   *  ];
   * var listNode = $$("ul.error_messages")[0];
   * generic.showErrors(errArray, listNode);
   * @param {Array} errorObjectsArray Array of error hashes.
   * @param {DOM} errListNode UL element in which the error messages will be displayed.
   * @param {DOM} formNode Form element (or any container node) that contains the inputs
   * to be marked as being in an error state.
   *
   * @return {undefined}
   */
  generic.showErrors = function(errorObjectsArray, errListNode, formNode) {
    var allInputNodes = $(formNode).find('input, select, label');
    var ulNode = errListNode != null ? errListNode : $('ul.error_messages');
    // prototype version acted on a single node. This could be a list
    // so cut it down to avoid redundant messaging in places. i.e - signin
    ulNode = $(ulNode[0]);

    if ($('ul.error_messages').length === 0) {
      var header = $('div#header');
      if (header.length === 0) {
        return null;
      } else {
        $("<ul class='error_messages'></ul>").insertAfter(header);
        ulNode = $('.error_messages');
      }
    }
    var errListItemNodes = ulNode.children('li');

    errListItemNodes.hide();
    if (errorObjectsArray.length > 0) {
      // hide all error states on fields
      allInputNodes.each(function () {
        generic.hideErrorState(this);
      });
    }
    for (var i = 0, len = errorObjectsArray.length; i < len; i++) {
      var errObj = errorObjectsArray[i];
      var errKey = errObj.key;
      var errListItemNode = [];
      if (errKey) {
        var regEx = new RegExp(errKey);
        // try to find LI whose ID matches the error key
        errListItemNode = errListItemNodes.filter(function() {
          return regEx.test(this.id);
        });
      }

      if (errListItemNode.length > 0) {
        errListItemNode.html(errObj.text);
        errListItemNode.show();
      } else {
        errListItemNode = $('<li/>');
        errListItemNode.html(errObj.text);
        errListItemNode.attr('id', errObj.key);
        ulNode.append(errListItemNode);
      }
      if (errObj.displayMode && errObj.displayMode === 'message') {
        errListItemNode.addClass('message');
      }
      if (errObj.tags && Array.isArray(errObj.tags)) {
        // search through error objects, show error state for any tagged with "field.[NAME]"
        var fieldPrefixRegEx = /^field\.(\w+)$/;
        for (var j = 0, jlen = errObj.tags.length; j < jlen; j++) {
          var tag = errObj.tags[j];
          var reResults = tag.match(fieldPrefixRegEx);
          if (reResults && reResults[1]) {
            var fieldName = reResults[1].toUpperCase();
            var inputNode = $('input[name=' + fieldName + '], select[name=' + fieldName + ']', formNode);
            if (inputNode.length > 0) {
              generic.showErrorState(inputNode[0]);
              var labelNode = $('label[for=' + inputNode[0].id + ']', formNode);
              generic.showErrorState(labelNode[0]);
            }
          }
        }
      }
    }
    ulNode.show();
    ulNode.addClass('error_messages_display');
  };

  generic.showErrorState = function(/* DOM Node */ inputNode) {
    if (!inputNode || !generic.isElement(inputNode)) {
      return null;
    }
    $(inputNode).addClass(generic.errorStateClassName);
  };

  generic.hideErrorState = function(/* DOM Node */ inputNode) {
    if (!inputNode || !generic.isElement(inputNode)) {
      return null;
    }
    $(inputNode).removeClass(generic.errorStateClassName);
  };
})(jQuery, window.generic || {});

!function(e,r){r.errorStateClassName="error",r.showErrors=function(s,a,t){var l=null!=a?a:e("ul.error_messages");if(l=e(l[0]),0===e("ul.error_messages").length){var n=e("div#header");if(0===n.length)return null;e("<ul class='error_messages'></ul>").insertAfter(n),l=e(".error_messages")}var i=l.children("li");(i.hide(),s.length>0)&&(t=e(t)).children("input, select, label").each((function(){r.hideErrorState(this)}));for(var o=0,h=s.length;o<h;o++){var d=s[o],u=d.key,f=[];if(u){var g=new RegExp(u);f=i.filter((function(){return g.test(this.id)}))}if(f.length>0?f.show():((f=e("<li/>")).html(d.text),l.append(f)),d.displayMode&&"message"===d.displayMode&&f.addClass("message"),d.tags&&e.isArray(d.tags))for(var m=/^field\.(\w+)$/,c=0,v=d.tags.length;c<v;c++){var p=d.tags[c].match(m);if(p&&p[1]){var w=p[1].toUpperCase(),E=e("input[name="+w+"], select[name="+w+"]",t);if(E.length>0){r.showErrorState(E[0]);var C=e("label[for="+E[0].id+"]",t);r.showErrorState(C[0])}}}}l.show(),l.addClass("error_messages_display")},r.showErrorState=function(s){if(!s||!r.isElement(s))return null;e(s).addClass(r.errorStateClassName)},r.hideErrorState=function(s){if(!s||!r.isElement(s))return null;e(s).removeClass(r.errorStateClassName)}}(jQuery,window.generic||{});
//# sourceMappingURL=error.min.js.map

(function($, generic) {
  /**
   * generic.forms contains helper methods to change different form input types
   * defined within the forms object.
   *
   * @class forms
   * @namespace generic.forms
   *
   * @return {undefined}
   */
  generic.forms = {
    select: {
      addOption: function(args) {
        if (!args) {
          return;
        }
        var val = args.value;
        var label = args.label || val;
        var opt = '<option value="' + val + '">' + label + '</option>';
        args.menuNode.append(opt);
      },
      setValue: function(args) {
        var idx = 0;
        for (var i = 0, len = args.menuNode[0].options.length; i < len; i++) {
          if (args.value === args.menuNode[0].options[i].value) {
            idx = i;
            break;
          }
        }
        args.menuNode[0].selectedIndex = idx;
      }
    }
  };
})(jQuery, window.generic || {});

jQuery,(window.generic||{}).forms={select:{addOption:function(e){if(e){var n=e.value,o='<option value="'+n+'">'+(e.label||n)+"</option>";e.menuNode.append(o)}},setValue:function(e){for(var n=0,o=0,u=e.menuNode[0].options.length;o<u;o++)if(e.value===e.menuNode[0].options[o].value){n=o;break}e.menuNode[0].selectedIndex=n}}};
//# sourceMappingURL=forms.min.js.map

var $H = $H || {};

(function($, generic) {
  /**
   * @description Wrap Function - Return a new function that triggers a parameter function first and
   * then moves on to the original, wrapped function.  The follow up of the original can be
   * precluded by returning false from the parameter of type function.
   *
   **/
  $.extend(Function.prototype, {
    /**
     * @param {function} step-ahead function to the original function being wrapped
     * @return {function} new function to be assigned to original namespace
     */
    wrap: function(fn) {
      var _generic_ = fn; // generic-level
      var _site_ = this; // site-level

      var passObj = true;

      return function() {
        passObj = _generic_.apply(fn, arguments);
        if (passObj) {
          _site_.call(this, passObj);
        } else {
          return;
        }
      };
    }
  });

  /**
   * @description Minimal Native Version of Prototype Hash Class
   *
   * @class Hash
   * @namespace generic.Hash
   *
   * @returns A public api object (get, set, etc).
   *
   */
  generic.Hash = function(obj) {
    var H = obj instanceof Object ? obj : {}, index = [], _queue = [];
    var queryString = function() {
      /** @inner **/
      var Q = function(o, v, isArr) {
        var i, S = Object.prototype.toString, A = '[object Array]', _queue = [];
        o = o || H;
        for (i in o) {
          var n;
          if (typeof o[i] === 'object') {
            _queue = S.call(o[i]) === A ? Q(o[i], i, true) : Q(o[i], i);
          } else {
            n = isArr ? v : i; _queue.push(n + '=' + o[i]);
          }
        }
        return _queue;
      };
      return Q().join('&');
    };

    return {
    /**
     * @public get
     */
      get: function(x) {
        return H[x] || false;
      },
      /**
     * @public set
     */
      set: function(x, y) {
        H[x] = y; index.push(x); return this;
      },
      /**
       * @public toQueryString
       */
      toQueryString: queryString,
      /**
     * @public fromQueryString
     */
      queryToJson: function(q) {
        var query = q;
        var k, v, i;
        var obj = {};

        var xArr = query.split('&');

        for (i = 0; i < xArr.length; i++) {
          k = xArr[i].split('=')[0]; v = xArr[i].split('=')[1];
          var evalStr = "obj['" + k + "']='" + v + "'";
          eval(evalStr);
        }
        return obj;
      },

      /**
     * @public slice
     *
     * @param {array}
     * @returns hash containing only the key/value pairs matched by the keys
     *          passed in the array
     *
     */
      slice: function(array) {
        // @todo: $H needs replacement
        var h = $H();
        for (var i in array) {
          h.set(array[i], H[array[i]]);
        }
        return h;
      },

      obj: function() {
        return H;
      }
    }; // end api set
  };

  generic.HashFactory = function(hash) {
    var H = new generic.Hash(hash);
    return H;
  };

  /**
   * @see generic.Hash
   */
  $H = generic.HashFactory; // map convenience alias

  /**
   * Minimal Native Version of Prototype Class
   *
   * @deprecated Jquery extend method has options for deep copy extensions
   *
   * @class Class
   * @namespace generic.Class
   *
   */
  generic.Class = { // Uppercase 'Class', avoid IE errors

    fn: function(src, props) {
      var tgt, prxy, xyz, z, fnTest = /xyz/.test(function() {
        xyz;
      }) ? /\b_super\b/ : /.*/;

      tgt = function() { // New Constructor
        // Initialize Method is a Requirement of Class
        // With the inclusion of the _super method, initialize in the superclass should only be called on demand
        /*if(tgt.superclass&&tgt.superclass.hasOwnProperty("initialize")){
                tgt.superclass.initialize.apply(this,arguments);
            }*/
        if (tgt.prototype.initialize) {
          tgt.prototype.initialize.apply(this, arguments);
        }
      };

      // Preserve Classical Inheritance using Proxy Middle
      src = src || Object;
      prxy = function() {}; /* Potentially define "Class" here */
      prxy.prototype = src.prototype;
      tgt.prototype = new prxy();
      tgt.superclass = src.prototype;
      tgt.prototype.constructor = tgt;

      // give new class 'own' copies of props and add _super method to call superclass' corresponding method
      for (z in props) {
        if (typeof props[z] === 'function' && typeof tgt.superclass[z] === 'function' && fnTest.test(props[z])) {
          tgt.prototype[z] = (function(z, fn) {
            return function() {
              this._super = tgt.superclass[z];
              var ret = fn.apply(this, arguments);
              return ret;
            };
          })(z, props[z]);
        } else {
          tgt.prototype[z] = props[z];
        }
      }

      return tgt;
    },
    create: function() {
      var len = arguments.length, args = Array.prototype.slice.call(arguments);
      var tgt;

      if (len === 2) {
        tgt = generic.Class.fn(args[0], args[1]);
      } else if (len === 1) {
        tgt = generic.Class.fn(null, args[0]);
      } else {
        tgt = function() {}; /* return empty constructor */
      }

      return tgt; // return constructor that stacks named Class w/ object-literal, works with instanceof
    }, // End Create Method
    mixin: function(baseClass, mixin) {
      var newClass = baseClass;
      if (mixin && mixin.length) {
        for (var i = 0; i < mixin.length; i++) {
          newClass = generic.Class.mixin(newClass, mixin[i]);
        }
      } else {
        if (mixin) {
          newClass = generic.Class.create(newClass, mixin);
        }
      }
      return newClass;
    }
  };

  /**
   * @memberOf generic
   *
   */
  generic.isElement = function(o) {
    return o.nodeType && (o.nodeType === 1);
  };

  /**
   * @memberOf generic
   *
   */
  generic.isString = function(s) {
    return typeof s === 'string';
  };

  /**
   * @memberOf generic
   *
   */
  generic.env = {
    isIE: !!(typeof ActiveXObject === 'function'),
    isIE6: !!(!!(typeof ActiveXObject === 'function') && /MSIE\s6\.0/.test(navigator.appVersion)),
    isFF: !!(typeof navigator.product !== 'undefined' && navigator.product === 'Gecko' && !(document.childNodes && !navigator.taintEnabled) && /firefox/.test(navigator.userAgent.toLowerCase())),
    isFF2: !!(typeof navigator.product !== 'undefined' && navigator.product === 'Gecko' && !(document.childNodes && !navigator.taintEnabled) && navigator.userAgent.toLowerCase().split(' firefox/').length > 1 && navigator.userAgent.toLowerCase().split(' firefox/')[1].split('.')[0] === '2'),
    isFF3: !!(typeof navigator.product !== 'undefined' && navigator.product === 'Gecko' && !(document.childNodes && !navigator.taintEnabled) && navigator.userAgent.toLowerCase().split(' firefox/').length > 1 && navigator.userAgent.toLowerCase().split(' firefox/')[1].split('.')[0] === '3'),
    isMac: !!/macppc|macintel/.test(navigator.platform.toLowerCase()),
    isSafari: !!/Safari/.test(navigator.userAgent),

    domain: window.location.protocol + '//' + window.location.hostname,

    debug: true, //JSTest check subdomain

    parsedQuery: function() {
      var query = window.location.search.toString().split('?')[1] || '';
      var splitStr = query.split('&');
      var key, value, tempObj, tempStr;
      var a = {}; a.n = {};
      var main = function() {
        var params = {};
        var arr = [];

        if (!query) {
          return;
        }

        for (var i = 0; i < splitStr.length; i++) {
        // just take the key
          key = splitStr[i].split('=')[0];
          value = splitStr[i].split('=')[1];

          var c = splitStr[i].match(new RegExp(key));
          var cItem = a.n[c] = a.n[c] || { 'v': [], 'key': c };
          cItem.e = cItem.e ? cItem.e + 1 : 0;
          cItem.v.push(value);
        }

        for (var namespace in a.n) {
        // if duplicate keys
          if (a.n[namespace].e > 0) {
            for (var n = 0; n <= a.n[namespace].e; n++) {
              arr.push(a.n[namespace].v.pop());
            } // end for-loop
            a.n[namespace].v = arr;
          }
          tempObj = a.n[namespace].v;

          if (tempObj.length > 1) {
            eval('params["' + namespace + '"]=tempObj');
          } else {
            tempStr = tempObj[0]; eval('params["' + namespace + '"]=tempStr');
          }
        }
        return params;
      };

      var parameters = main() || {};
      return parameters;
    },
    query: function(key) {
      var result = generic.env.parsedQuery()[key] || null;
      return result;
    }
  };
})(jQuery, window.generic || {});

var $H=$H||{};!function($,generic){$.extend(Function.prototype,{wrap:function(e){var t=e,r=this,n=!0;return function(){(n=t.apply(e,arguments))&&r.call(this,n)}}}),generic.Hash=function(obj){var H=obj instanceof Object?obj:{},index=[],_queue=[],queryString=function(){var e=function(t,r,n){var i,a=Object.prototype.toString,o=[];for(i in t=t||H){var c;"object"==typeof t[i]?o="[object Array]"===a.call(t[i])?e(t[i],i,!0):e(t[i],i):(c=n?r:i,o.push(c+"="+t[i]))}return o};return e().join("&")};return{get:function(e){return H[e]||!1},set:function(e,t){return H[e]=t,index.push(e),this},toQueryString:queryString,queryToJson:function(q){var query=q,k,v,i,obj={},xArr=query.split("&");for(i=0;i<xArr.length;i++){k=xArr[i].split("=")[0],v=xArr[i].split("=")[1];var evalStr="obj['"+k+"']='"+v+"'";eval(evalStr)}return obj},slice:function(e){var t=$H();for(var r in e)t.set(e[r],H[e[r]]);return t},obj:function(){return H}}},generic.HashFactory=function(e){return new generic.Hash(e)},$H=generic.HashFactory,generic.Class={fn:function(e,t){var r,n,i,a=/xyz/.test((function(){}))?/\b_super\b/:/.*/;for(i in r=function(){r.prototype.initialize&&r.prototype.initialize.apply(this,arguments)},(n=function(){}).prototype=(e=e||Object).prototype,r.prototype=new n,r.superclass=e.prototype,r.prototype.constructor=r,t)"function"==typeof t[i]&&"function"==typeof r.superclass[i]&&a.test(t[i])?r.prototype[i]=function(e,t){return function(){this._super=r.superclass[e];var n=t.apply(this,arguments);return n}}(i,t[i]):r.prototype[i]=t[i];return r},create:function(){var e=arguments.length,t=Array.prototype.slice.call(arguments);return 2===e?generic.Class.fn(t[0],t[1]):1===e?generic.Class.fn(null,t[0]):function(){}},mixin:function(e,t){var r=e;if(t&&t.length)for(var n=0;n<t.length;n++)r=generic.Class.mixin(r,t[n]);else t&&(r=generic.Class.create(r,t));return r}},generic.isElement=function(e){return e.nodeType&&1===e.nodeType},generic.isString=function(e){return"string"==typeof e},generic.env={isIE:!("function"!=typeof ActiveXObject),isIE6:!("function"!=typeof ActiveXObject||!/MSIE\s6\.0/.test(navigator.appVersion)),isFF:!(void 0===navigator.product||"Gecko"!==navigator.product||document.childNodes&&!navigator.taintEnabled||!/firefox/.test(navigator.userAgent.toLowerCase())),isFF2:!(void 0===navigator.product||"Gecko"!==navigator.product||document.childNodes&&!navigator.taintEnabled||!(navigator.userAgent.toLowerCase().split(" firefox/").length>1)||"2"!==navigator.userAgent.toLowerCase().split(" firefox/")[1].split(".")[0]),isFF3:!(void 0===navigator.product||"Gecko"!==navigator.product||document.childNodes&&!navigator.taintEnabled||!(navigator.userAgent.toLowerCase().split(" firefox/").length>1)||"3"!==navigator.userAgent.toLowerCase().split(" firefox/")[1].split(".")[0]),isMac:!!/macppc|macintel/.test(navigator.platform.toLowerCase()),isSafari:!!/Safari/.test(navigator.userAgent),domain:window.location.protocol+"//"+window.location.hostname,debug:!0,parsedQuery:function(){var query=window.location.search.toString().split("?")[1]||"",splitStr=query.split("&"),key,value,tempObj,tempStr,a={n:{}},main=function(){var params={},arr=[];if(query){for(var i=0;i<splitStr.length;i++){key=splitStr[i].split("=")[0],value=splitStr[i].split("=")[1];var c=splitStr[i].match(new RegExp(key)),cItem=a.n[c]=a.n[c]||{v:[],key:c};cItem.e=cItem.e?cItem.e+1:0,cItem.v.push(value)}for(var namespace in a.n){if(a.n[namespace].e>0){for(var n=0;n<=a.n[namespace].e;n++)arr.push(a.n[namespace].v.pop());a.n[namespace].v=arr}tempObj=a.n[namespace].v,tempObj.length>1?eval('params["'+namespace+'"]=tempObj'):(tempStr=tempObj[0],eval('params["'+namespace+'"]=tempStr'))}return params}},parameters=main()||{};return parameters},query:function(e){return generic.env.parsedQuery()[e]||null}}}(jQuery,window.generic||{});
//# sourceMappingURL=utilities.min.js.map
