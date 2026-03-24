(function($, site, generic) {
  site.onLoadRpc = site.onLoadRpc || {};
  site.onLoadRpc.requests = site.onLoadRpc.requests || [];

  site.onLoadRpc.init = function() {
    // User stuff
    var signedIn = Number(site.userInfoCookie.getValue('signed_in')) === 1 || Number(site.userInfoCookie.getValue('csr_logged_in')) === 1;
    if (signedIn) {
      site.onLoadRpc.requests.push({
        method: 'user.fullData',
        params: [{}],
        onSuccess: function(data) {
          // This is for the Phone Order app to recognize values on Drupal pages
          if (!data || !data.result) {
            return;
          }

          var val = data.result.value;

          if ((val.csr_email !== undefined) && (val.csr_email !== null)) {
            $('#csr_header_holder').removeClass('hidden');
          }

          // Set a body class attribute based on user logged in status
          $('body').addClass(val.signed_in === 1 ? 'elc-user-state-logged-in' : 'elc-user-state-anonymous');

          // Populate user data
          $('[data-pg-object="user"] > [data-pg-prop], [data-pg-object="user"][data-pg-prop]').each(function() {
            var $me = $(this);
            $me.html(val[$me.attr('data-pg-prop').toLowerCase()]);
          });

          // generic.user.setUser(val);

          $(document).trigger('user.loaded', val);
        },
        onFailure: function() {}
      });
    } else {
      // generic.user.setUser({});
      $('body').addClass('elc-user-state-anonymous');
      $(document).trigger('user.loaded', {});
    }
  };

  /*
   * site.onLoadRpc.requests - a global array of RPC request objects
   * must be initialized pre-DOM-load and formatted like this:
   * [
   *     {
   *         "method":   "user.json",
   *         "params":   [{}],
   *         "getParams" : function () { return [{}] },  * one of 'params' or 'getParams' is required
   *         "onSuccess" : function () { },
   *         "onFailure" : function () { }
   *     }
   * ]
   */
  site.onLoadRpc.fetch = function() {
    var requests = site.onLoadRpc.requests || [];
    var rLen = requests.length;
    var queryVals = [];

    for (var i = 0, len = rLen; i < len; i++) {
      var postMethod = requests[i].method || 'rpc.form';

      if (typeof requests[i].getParams === 'function') {
        requests[i].params = requests[i].getParams();
      }

      queryVals[i] = {
        method: postMethod,
        params: requests[i].params,
        id: i + 1
      };
    }

    if (!queryVals.length) {
      return;
    }

    var successHandler = function(data) {
      for (var i = 0, len = rLen; i < len; i++) {
        var fn = requests[i].onSuccess;
        if (typeof fn !== 'function') {
          continue;
        }
        fn(data[i]);
      }
    };

    var url = generic.jsonrpc.url || '/rpc/jsonrpc.tmpl';
    var options = {};

    // ELCTWO-571 requires that we pass brand, region, and locale ids to ensure proper responses
    // on the pg side for drupal sites.  To accomplish this we pass 'addl_url_params' within the arguments.
    // This snippets searches for such entries and adds 'em to the request url.
    var url_params = '';
    $(queryVals).each(function() {
      if (this.params[0].url_params) {
        if (this.params[0].url_params.charAt(0) === '&') {
          url_params += this.params[0].url_params;
        } else {
          url_params += '&' + this.params[0].url_params;
        }
      }
    });
    if (url_params !== '') {
      url += '?' + url_params.substring(1);
    }

    options.data = $.param({JSONRPC: JSON.stringify(queryVals)});

    options.type = 'POST';
    options.success = function(data, textStatus, response) {
      successHandler(data, textStatus, response);
    };
    options.error = function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown);
    };
    $.ajax(url, options);
  };

  $(document).trigger('onLoadRpc.fetch');
  // Set user cookie
  site.userInfoCookie.init();
  site.onLoadRpc.init();
  site.onLoadRpc.fetch();

  if (window.location.hash === '#sign-in') {
    setTimeout(function () {
      $('#return-user-link').trigger('click');
    }, 500);
  }
  if (window.location.hash === '#new-account') {
    setTimeout(function () {
      $('#new-account-link').trigger('click');
    }, 500);
  }
})(jQuery, window.site || {}, window.generic || {});
