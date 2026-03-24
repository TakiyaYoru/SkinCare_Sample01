(function($, ServiceBus, Topics) {
  if (!Topics.events
    || !Topics.events.FAVORITE_SELECTED
    || !Topics.events.PRODUCT_LOADED) {
    return;
  }

  ServiceBus.on(Topics.events.PRODUCT_LOADED, function() {
    if (ServiceBus.log) {
      ServiceBus.log({
        message: 'pg_'.concat(Topics.events.PRODUCT_LOADED)
      });
    }
    $(document).trigger('perlgem.favorites.fetch');
  }, { replay: true });

  ServiceBus.on(
    Topics.events.FAVORITE_SELECTED,
    function(payload) {
      if (payload && payload.skuBaseId) {
        var args = {skuBaseId: payload.skuBaseId};
        if (ServiceBus.log) {
          ServiceBus.log({
            message: 'pg_'.concat(Topics.events.FAVORITE_SELECTED),
            payload: { context: args }
          });
        }
        $(document).trigger('perlgem.favorites.updateItem', args);
      }
    }
  );
})(
  jQuery,
  window.GlobalServiceBus || {},
  window.ServiceBusTopics || {}
);
