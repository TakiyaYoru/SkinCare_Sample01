(function($, ServiceBus, Topics) {
  var userCookieName = 'FE_USER_CART';

  var strategies = [
    // RPC method
    {
      isEnabled: generic && generic.jsonrpc && generic.jsonrpc.hasOwnProperty('fetch'),
      isAuth: function(deferred) {
        const request = {
          method: 'signedIn',
          params: [{}],
          onSuccess: function(response) {
            const signedIn = response.getValue();
            deferred.resolve(!!parseInt(signedIn));
          },
          onFailure: function(response) {
            deferred.reject(response.getError());
          }
        };

        generic.jsonrpc.fetch(request);
      }
    },

    // Cookie method
    {
      isEnabled: !!getCookie(userCookieName),
      isAuth: function(deferred) {
        var cookie = getCookie(userCookieName);

        // Create an object out of the key=value pairs in the cookie
        // There's gotta be a global helper for this, right?
        var parts = cookie.split('&').reduce(
          function(acc, val) {
            var s = val.split(':');

            if (!!s[0]) {
              acc[s[0]] = s[1];
            }

            return acc;
          },
        {});

        deferred.resolve(parts.hasOwnProperty('signed_in') && parts['signed_in'] === '1');
      }
    },

    // Fallback
    {
      isEnabled: true,
      isAuth: function(deferred) {
        deferred.resolve(false);
      }
    }
  ];

  function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return '';
  }

  // We don't need to move this into the brand layer since we're just parsing the FE_USER_CART cookie
  $(document).on('perlgem.user.isAuth', function(e, options, deferred) {
     var strategy = strategies.filter(function(s) {
       return s.isEnabled;
     }).shift();

     strategy.isAuth(deferred);
  });

  const PerlgemIsAuthHook = function(ServiceBus) {
    return {
      beforeQuery: function(queryName, payload, next) {
        switch (queryName) {
          case Topics.queries.IS_AUTHENTICATED: {
            const deferred = $.Deferred();

            $(document).trigger('perlgem.user.isAuth', [payload, deferred]);

            return deferred.promise();
          }
          default: {
            return next(queryName, payload);
          }
        }
      }
    };
  };

  ServiceBus.applyHook(PerlgemIsAuthHook);

})(
  jQuery,
  window.GlobalServiceBus || {},
  window.ServiceBusTopics || {}
);
