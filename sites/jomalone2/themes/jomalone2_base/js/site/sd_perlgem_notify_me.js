(function($, ServiceBus, ServiceTopics) {
  $(document).on('perlgem.notify_me', function(e, payload) {
    if (!payload || !payload.skuId || !payload.skuBaseId || !payload.email || !ServiceTopics.events) {
      return false;
    }

    var params = {
      _SUBMIT: 'bis_notification',
      EMAIL_ADDRESS: payload.email,
      EVENT_NAME: 'BIS',
      REQUEST_TYPE: 'BIS',
      SKU_BASE_ID: payload.skuBaseId,
    };

    var responsePayload = { skuId: payload.skuId };
    
    generic.jsonrpc.fetch({
      method: 'form.get',
      params: [params],
      onSuccess: function(response) {
        ServiceBus.emit(ServiceTopics.events.PRODUCT_NOTIFY_ME_REQUEST_SUCCESS, responsePayload);
      },
      onFailure: function(jsonRpcResponse) {
        ServiceBus.emit(ServiceTopics.events.PRODUCT_NOTIFY_ME_REQUEST_FAILURE, responsePayload);
      },
      onError: function(t) {
        ServiceBus.emit(ServiceTopics.events.PRODUCT_NOTIFY_ME_REQUEST_FAILURE, responsePayload);
      }
    });
  });
})(jQuery, window.GlobalServiceBus || {}, window.ServiceBusTopics || {});

