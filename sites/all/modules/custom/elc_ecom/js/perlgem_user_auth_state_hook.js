(function ($, ServiceBus, Topics) {
  const PerlgemUserAuthStateHook = function () {
    return {
      beforeQuery: function (queryName, payload, next) {
        switch (queryName) {
          case Topics.queries.GET_USER_AUTH_STATE: {
            const deferred = $.Deferred();

            $(document).trigger('perlgem.user.authState', [payload, deferred]);

            return deferred.promise();
          }
          default: {
            return next(queryName, payload);
          }
        }
      }
    };
  };
  const getUserAuthState = function (userFullData) {
    const AUTH_STATE = {
      SIGNED_IN: 'SIGNEDIN',
      ANONYMOUS: 'ANONYMOUS',
      RECOGNIZED: 'RECOGNIZED'
    };

    if (userFullData && userFullData.signed_in === 1) {
      return AUTH_STATE.SIGNED_IN;
    } if (userFullData && userFullData.recognized_user === null) {
      return AUTH_STATE.ANONYMOUS;
    }

    return AUTH_STATE.RECOGNIZED;
  };

  $(document).on('perlgem.user.authState', function (e, options, deferred) {
    if (generic && generic.jsonrpc && generic.jsonrpc.hasOwnProperty('fetch')) {
      const request = {
        method: 'user.fullData',
        params: [{}],
        onSuccess: function (response) {
          const userFullData = response.getValue();
          const userAuthState = getUserAuthState(userFullData);

          deferred.resolve(userAuthState);
        },
        onFailure: function (response) {
          deferred.reject(response.getError());
        }
      };

      generic.jsonrpc.fetch(request);
    }
  });

  ServiceBus.applyHook(PerlgemUserAuthStateHook);
})(
  jQuery,
  window.GlobalServiceBus || {},
  window.ServiceBusTopics || {}
);
