(function($, ServiceBus, Topics) {
  const PerlgemApptbookingTokenHook = function(ServiceBus) {
    return {
      beforeQuery: function(queryName, payload, next) {
        switch (queryName) {
          case Topics.queries.GET_APPT_BOOKING_ACCESS_TOKEN: {
            const deferred = $.Deferred();
            if (ServiceBus.log) {
              ServiceBus.log({ message: 'pg_'.concat(Topics.queries.GET_APPT_BOOKING_ACCESS_TOKEN), payload: { context: payload } });
            }
            $(document).trigger('perlgem.apptbookingToken.fetch', [payload, deferred]);
            return deferred.promise();
          }
          default: {
            return next(queryName, payload);
          }
        }
      }
    };
  };

  ServiceBus.applyHook(PerlgemApptbookingTokenHook);
})(jQuery, window.GlobalServiceBus || {}, window.ServiceBusTopics || {});
