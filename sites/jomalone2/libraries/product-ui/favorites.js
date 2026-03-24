var prodcat = prodcat || {};
prodcat.ui = prodcat.ui || {};
var site = site || {};
var cachedFavorites = null;

(function($, generic, ServiceBus, ServiceTopics) {
  if (!ServiceTopics.events
    || !ServiceTopics.events.FAVORITES_LOADED
    || !ServiceTopics.events.FAVORITE_STATUS_UPDATED) {
    return;
  }

  prodcat.ui.getFavorites = function() {
    if (cachedFavorites) {
      if (cachedFavorites.length > 0) {
        ServiceBus.emit(
          ServiceTopics.events.FAVORITES_LOADED,
          { skuBaseIds: cachedFavorites }
        );
      }
      // Returning early due to either of the following:
      // - done with the emit above
      // - fetch is running, event will be emitted afterwards
      // - user has empty favorites, no need to update anything
      return;
    }

    cachedFavorites = []; // also serves as a flag that fetch has happened
    generic.jsonrpc.fetch({
      method: "collection.items",
      params: [],
      onSuccess: function(r) {
        var result = r.getValue();

        if (result && result.skus && result.skus.length > 0) {
          var skuBaseIds = [];
          var skus = result.skus;
          for (var i = 0; i < skus.length; i++) {
            // Strip out "SKU" prefix to get the SKU Base ID
            skuBaseIds.push(parseInt(skus[i].SKU_ID.slice(3)));
          }
          cachedFavorites = skuBaseIds;
          if (skuBaseIds.length > 0) {
            ServiceBus.emit(
              ServiceTopics.events.FAVORITES_LOADED,
              { skuBaseIds: skuBaseIds }
            );
          }
        }
      }
    });
  };

  prodcat.ui.addToFavorites = function(args) {
    var params = {
      _SUBMIT: 'alter_collection',
      action: 'add',
      SKU_BASE_ID: args.skuBaseId
    };

    generic.jsonrpc.fetch({
      method: 'rpc.form',
      params: [params],
      onSuccess: function (jsonRpcResponse) {
        var data = jsonRpcResponse.getData();
        var result = data.ac_results[0].result;

        if (result.SUCCESS === 1) {
          var isAlreadyAdded = false;

          switch(result.KEY) {
            case 'SKU_ALREADY_IN_COLLECTION.ADD_SKU.COLLECTION.SAVE':
              isAlreadyAdded = true;
            case 'SUCCESS.ADD_SKU.COLLECTION.SAVE':
              ServiceBus.emit(ServiceTopics.events.FAVORITE_STATUS_UPDATED, {
                skuBaseId: parseInt(args.skuBaseId),
                isFavorite: true,
                isAlreadyAdded: isAlreadyAdded
              });
              if (!isAlreadyAdded) {
                $(document).trigger('addToWishlist.success', [data]);
              }
              break;
            default:
              return;
          }
        }
      },
      onFailure: function (errorResponse) {
        var errorObjectsArray = errorResponse.getMessages();
        $(document).trigger('addToFavorites.failure', [errorObjectsArray]);
      }
    });
  };

})(
  jQuery,
  window.generic || {},
  window.GlobalServiceBus || {},
  window.ServiceBusTopics || {}
);
