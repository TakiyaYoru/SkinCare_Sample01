var site = site || {};
var generic = generic || {};

(function($, ServiceBus, ServiceBusTopics) {
  site.addToCart = function(args) {
    var skuBaseId;
    if (args.skuBaseId) {
      skuBaseId = args.skuBaseId;
    } else {
      return null;
    }

    var catBaseId = '';
    if (args.skuData && args.skuData.PARENT_CAT_ID) {
      var matchResult = args.skuData.PARENT_CAT_ID.match('[0-9]+');
      if (matchResult) {
        cat_base_id = matchResult[0];
      }
    }

    var params = {
      skus: Array.isArray(skuBaseId) ? skuBaseId : [skuBaseId],
      itemType: 'cart',
      INCREMENT: 1,
      CAT_BASE_ID: catBaseId
    };

    generic.checkout.cart.updateCart({
      params: params,
      onSuccess: function(r) {
        var resultData = r.getData();
        $(document).trigger('addToCart.success', [resultData]);
      },
      onFailure: function(ss) {
        var errors = ss.getMessages();
        var resultData = ss.getData();
        $(document).trigger('addToCart.failure', [errors, resultData]);
      }
    });
  };

  $(document).on('perlgem.cart.addItem', function(e, skuBaseId, payload) {
    payload = typeof payload !== 'undefined' ? payload : {};
    var args = {};

    // Set sku base id
    args.skuBaseId = skuBaseId;

    // Set quantity
    args.qty = payload.quantity ? payload.quantity : 1;

    // Set replenishment if it exists
    var frequency = payload.replenishment ? payload.replenishment : null;
    if (!!frequency) {
      args.REPLENISHMENT_FREQ = frequency;
    }

    site.addToCart(args);
  });

  $(document).on('addToCart.success', function() {
    if (ServiceBus && ServiceBus.emit && ServiceBusTopics && ServiceBusTopics.events && ServiceBusTopics.events.CART_UPDATED) {
      ServiceBus.emit(
        ServiceBusTopics.events.CART_UPDATED
      );
    }
  });

  $(document).on('addToCart.failure', function() {
    if (ServiceBus && ServiceBus.emit && ServiceBusTopics && ServiceBusTopics.events && ServiceBusTopics.events.CART_FAILURE) {
      ServiceBus.emit(
        ServiceBusTopics.events.CART_FAILURE
      );
    }
  });
})(
  jQuery,
  window.GlobalServiceBus || {},
  window.ServiceBusTopics || {}
);
