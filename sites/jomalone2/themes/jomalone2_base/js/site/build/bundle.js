!function(e){Drupal.behaviors.adaptivePlaceholders={attached:!1,labelMode:function(e){e.addClass("adpl__mode-label"),e.removeClass("adpl__mode-placeholder")},placeholderMode:function(e){e.removeClass("adpl__mode-label"),e.addClass("adpl__mode-placeholder")},toggleMode:function(e){""===e.val()?this.placeholderMode(e):this.labelMode(e)},bindEvents:function(e){var a=this;e.on("focusin",(function(){a.labelMode(e)})),e.on("focusout",(function(){a.toggleMode(e)})),e.on("change",(function(){a.toggleMode(e)}))},setupDOM:function(a){var t=this;a.each((function(){var a=e(this);if(!a.hasClass("adpl--processed")){var l=a.siblings("label"),o=a.attr("placeholder")||l.attr("placeholder"),n=!1;if(a.parent().is("label.adpl-container")&&(n=!0),!o)return!0;if(n)l=e('<span class="label adpl-label">'+o+"</span>");else if(l.length>0)l.remove();else{var s=a.attr("id");if(!s)return!0;l=e('<label class="label" for="'+s+'">'+o+"</label>")}l[0].hasAttribute("placeholder")||l.attr("placeholder",o),l[0].hasAttribute("alt")||l.attr("alt",o),l.find("span.label-content").length<1&&l.wrapInner('<span class="label-content"></span>'),l.insertAfter(a),"google_autocomplete"===a.attr("id")?a.attr("placeholder",""):a.removeAttr("placeholder"),t.placeholderMode(a),t.bindEvents(a),t.toggleMode(a),a.addClass("adpl--processed")}}))},attach:function(a){if(!this.attached&&(this.attached=!0,!e("html").hasClass("no-placeholder"))){var t=e('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="password"], textarea',a).not(".no-adpl");this.setupDOM(t)}}}}(jQuery);
//# sourceMappingURL=adaptive_placeholders.min.js.map

// This file includes this commit to work with require.js:
// https://github.com/pouipouidesign/Unison/commit/30b1b0d9fcff831f7c4f92952911902f01284b57
// It also has some customizations to work with IE8.

/* global Unison: true */
Unison = (function() {
  'use strict';

  var win = window;
  var doc = document;
  var head = doc.head;
  var eventCache = {};
  var unisonReady = false;
  var currentBP;

  var util = {
    parseMQ : function(el) {
      var str = this.getStyleProperty(el, 'font-family');
      return str.replace(/"/g, '').replace(/'/g, '');
    },
    getStyleProperty: function(el, attr) {
      if (this.isUndefined(win.getComputedStyle)) {
        attr = attr.replace(/-(.)/g, function(match, group1) {
          return group1.toUpperCase();
        });
        return el.currentStyle[attr];
      } else {
        return win.getComputedStyle(el, null).getPropertyValue(attr);
      }
    },
    debounce : function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        }, wait);
        if (immediate && !timeout) {
          func.apply(context, args);
        }
      };
    },
    isObject: function(e) { return typeof e === 'object'; },
    isUndefined: function(e) { return typeof e === 'undefined'; }
  };

  var events = {
    on: function(event, callback) {
      if (!util.isObject(eventCache[event])) {
        eventCache[event] = [];
      }
      eventCache[event].push(callback);
    },
    emit: function(event, data) {
      if (util.isObject(eventCache[event])) {
        var eventQ = eventCache[event].slice();
        for ( var i = 0; i < eventQ.length; i++ ) {
          eventQ[i].call(this, data);
        }
      }
    }
  };

  var breakpoints = {
    all: function() {
      var BPs = {};
      var allBP = util.parseMQ(doc.querySelector('title')).split(',');
      for ( var i = 0; i < allBP.length; i++ ) {
        var mq = allBP[i].trim().split(' ');
        BPs[mq[0]] = mq[1];
      }
      return ( unisonReady ) ? BPs : null ;
    },
    now: function(callback) {
      var nowBP = util.parseMQ(head).split(' ');
      var now = {
        name: nowBP[0],
        width: nowBP[1]
      };
      return (unisonReady) ? ((util.isUndefined(callback)) ? now : callback(now)) : null ;
    },
    update: function() {
      breakpoints.now(function(bp) {
        if ( bp.name !== currentBP ) {
          events.emit(bp.name);
          events.emit('change', bp);
          currentBP = bp.name;
        }
      });
    }
  };

  if (util.isUndefined(head)) {
    head = document.getElementsByTagName('head')[0];
  }

  win.onresize = util.debounce(breakpoints.update, 100);

  // if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
    unisonReady = util.getStyleProperty(head, 'clear') !== 'none';
    breakpoints.update();
  // } else {
  //   doc.addEventListener('DOMContentLoaded', function(){
  //     unisonReady = util.getStyleProperty(head, 'clear') !== 'none';
  //     breakpoints.update();
  //   });
  // }

  return {
    fetch: {
      all: breakpoints.all,
      now: breakpoints.now
    },
    on: events.on,
    emit: events.emit,
    util: {
      debounce: util.debounce,
      isObject: util.isObject
    }
  };
})();

Unison=function(){"use strict";var e,t=window,n=document,i=n.head,r={},o=!1,u={parseMQ:function(e){return this.getStyleProperty(e,"font-family").replace(/"/g,"").replace(/'/g,"")},getStyleProperty:function(e,n){return this.isUndefined(t.getComputedStyle)?(n=n.replace(/-(.)/g,(function(e,t){return t.toUpperCase()})),e.currentStyle[n]):t.getComputedStyle(e,null).getPropertyValue(n)},debounce:function(e,t,n){var i;return function(){var r=this,o=arguments;clearTimeout(i),i=setTimeout((function(){i=null,n||e.apply(r,o)}),t),n&&!i&&e.apply(r,o)}},isObject:function(e){return"object"==typeof e},isUndefined:function(e){return void 0===e}},l={on:function(e,t){u.isObject(r[e])||(r[e]=[]),r[e].push(t)},emit:function(e,t){if(u.isObject(r[e]))for(var n=r[e].slice(),i=0;i<n.length;i++)n[i].call(this,t)}},c={all:function(){for(var e={},t=u.parseMQ(n.querySelector("title")).split(","),i=0;i<t.length;i++){var r=t[i].trim().split(" ");e[r[0]]=r[1]}return o?e:null},now:function(e){var t=u.parseMQ(i).split(" "),n={name:t[0],width:t[1]};return o?u.isUndefined(e)?n:e(n):null},update:function(){c.now((function(t){t.name!==e&&(l.emit(t.name),l.emit("change",t),e=t.name)}))}};return u.isUndefined(i)&&(i=document.getElementsByTagName("head")[0]),t.onresize=u.debounce(c.update,100),o="none"!==u.getStyleProperty(i,"clear"),c.update(),{fetch:{all:c.all,now:c.now},on:l.on,emit:l.emit,util:{debounce:u.debounce,isObject:u.isObject}}}();
//# sourceMappingURL=unison.min.js.map
