/* eslint-disable no-underscore-dangle */
var lpTag = window.lpTag || {};
var site = window.site || {};

if (typeof window.lpTag._tagCount === 'undefined') {
  window.lpTag = {
    site: Drupal.settings.lp.account_id || '',
    section: lpTag.section || '',
    autoStart: lpTag.autoStart !== false,
    ovr: lpTag.ovr || {},
    _v: '1.6.0',
    _tagCount: 1,
    protocol: 'https:',
    events: {
      bind: function (app, ev, fn) {
        lpTag.defer(function () {
          lpTag.events.bind(app, ev, fn);
        }, 0);
      },
      trigger: function (app, ev, json) {
        lpTag.defer(function () {
          lpTag.events.trigger(app, ev, json);
        }, 1);
      }
    },
    defer: function (fn, fnType) {
      if (fnType === 0) {
        this._defB = this._defB || [];
        this._defB.push(fn);
      } else if (fnType === 1) {
        this._defT = this._defT || [];
        this._defT.push(fn);
      } else {
        this._defL = this._defL || [];
        this._defL.push(fn);
      }
    },
    load: function (src, chr, id) {
      var self = this;

      setTimeout(function () {
        self._load(src, chr, id);
      }, 0);
    },
    _load: function (src, chr, id) {
      var url = src;
      var s = document.createElement('script');

      if (!src) {
        url =
          this.protocol +
          '//' +
          (this.ovr && this.ovr.domain ? this.ovr.domain : 'lptag.liveperson.net') +
          '/tag/tag.js?site=' +
          this.site;
      }
      s.setAttribute('charset', chr ? chr : 'UTF-8');
      if (id) {
        s.setAttribute('id', id);
      }
      s.setAttribute('src', url);
      document.getElementsByTagName('head').item(0).appendChild(s);
    },
    init: function () {
      var self = this;

      this._timing = this._timing || {};
      this._timing.start = new Date().getTime();

      if (window.attachEvent) {
        window.attachEvent('onload', function () {
          self._domReady('domReady');
        });
      } else {
        window.addEventListener(
          'DOMContentLoaded',
          function () {
            self._domReady('contReady');
          },
          false
        );
        window.addEventListener(
          'load',
          function () {
            self._domReady('domReady');
          },
          false
        );
      }
      if (typeof window._lptStop == 'undefined') {
        this.load();
      }
    },
    start: function () {
      this.autoStart = true;
    },
    _domReady: function (n) {
      if (!this.isDom) {
        this.isDom = true;
        this.events.trigger('LPT', 'DOM_READY', { t: n });
      }
      this._timing[n] = new Date().getTime();
    },
    vars: lpTag.vars || [],
    dbs: lpTag.dbs || [],
    ctn: lpTag.ctn || [],
    sdes: lpTag.sdes || [],
    ev: lpTag.ev || []
  };
  site.observeLpLoadTime?.();
  lpTag.init();
} else {
  window.lpTag._tagCount += 1;
}

(function () {
  var lpTagLimit = 10;
  var lpTagCounter = 0;
  var lpTagExists = setInterval(function () {
    if (lpTag && lpTag.start && !lpTag.started) {
      lpTag.isDom = true;
      lpTag.start();
      clearInterval(lpTagExists);
    } else if (lpTagCounter >= lpTagLimit) {
      clearInterval(lpTagExists);
    } else {
      lpTagCounter++;
    }
  }, 500);
})();
