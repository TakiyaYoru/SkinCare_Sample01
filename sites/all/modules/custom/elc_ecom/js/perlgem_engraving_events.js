(function($, ServiceBus, Topics) {
  if (!Topics.events || !Topics.events.SKU_ENGRAVING_TRIGGERED) {
    return;
  }

  ServiceBus.on(Topics.events.SKU_ENGRAVING_TRIGGERED,
    function(payload) {
      if (payload) {
        if (ServiceBus.log) {
          ServiceBus.log({
            message: 'pg_'.concat(Topics.events.SKU_ENGRAVING_TRIGGERED),
            payload: { context: payload }
          });
        }
        $(document).trigger('perlgem.engraving.open', payload);
      }
    }
  );
})(
  jQuery,
  window.GlobalServiceBus || {},
  window.ServiceBusTopics || {}
);
