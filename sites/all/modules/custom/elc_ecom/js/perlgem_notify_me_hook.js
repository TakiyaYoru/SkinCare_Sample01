(function($, ServiceBus, Topics) {
  if (!Topics || !Topics.events || !Topics.events.PRODUCT_NOTIFY_ME_REQUEST) {
    return;
  }
  const PerlgemNotifyMeHook = function(ServiceBus) {
    return {
      beforeEmit: function(action, payload, next) {
        switch (action) {
          case Topics.events.PRODUCT_NOTIFY_ME_REQUEST: {
            if (payload) {
              if (ServiceBus.log) {
                ServiceBus.log({
                  message: 'pg_'.concat(Topics.events.PRODUCT_NOTIFY_ME_REQUEST),
                  payload: { context: payload }
                });
              }
              $(document).trigger('perlgem.notify_me', payload);
            }

            return;
          }
          case Topics.events.PRODUCT_NOTIFY_ME_TRIGGERED: {
            if (payload) {
              var enableHybridModal = false;
              if (Drupal.settings.elc_ecom.prodcatConfig.hasOwnProperty('waitlist')) {
                if (Drupal.settings.elc_ecom.prodcatConfig.waitlist.hasOwnProperty('enableHybridModal')) {
                  enableHybridModal = Drupal.settings.elc_ecom.prodcatConfig.waitlist.enableHybridModal;
                }
                if (!enableHybridModal) {
                  if (ServiceBus.log) {
                    ServiceBus.log({
                      message: 'pg_'.concat(Topics.events.PRODUCT_NOTIFY_ME_TRIGGERED),
                      payload: { context: payload }
                    });
                  }
                  $(document).trigger('perlgem.notify_me.show', payload);
                } else {
                  return next(action, payload);
                }
              }
            }
            return;
          }
          default: {
            return next(action, payload);
          }
        }
      }
    };
  };

  ServiceBus.applyHook(PerlgemNotifyMeHook);
})(jQuery, window.GlobalServiceBus || {}, window.ServiceBusTopics || {});

