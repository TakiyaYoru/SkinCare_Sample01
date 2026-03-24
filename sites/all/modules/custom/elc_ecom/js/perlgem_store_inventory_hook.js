(function($, ServiceBus, Topics) {
  const PerlgemStoreInventoryHook = function() {
    return {
      beforeQuery: function(queryName, payload, next) {
        switch (queryName) {
          case Topics.queries.GET_STORE_INVENTORY: {
            const deferred = $.Deferred();
            if (ServiceBus.log) {
              ServiceBus.log({
                message: 'pg_'.concat(Topics.queries.GET_STORE_INVENTORY),
                payload: { context: payload }
              });
            }
            $(document).trigger('perlgem.storeInventory.fetch', [payload, deferred]);
            return deferred.promise();
          }
          default: {
            return next(queryName, payload);
          }
        }
      }
    };
  };

  ServiceBus.applyHook(PerlgemStoreInventoryHook);
})(
  jQuery,
  window.GlobalServiceBus || {},
  window.ServiceBusTopics || {}
);
