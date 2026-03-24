(function($) {
  $(document).on('perlgem.storeInventory.fetch', function(e, options, deferred) {
    const fields = 'DOOR_ID, DOORNAME, STORE_HOURS, STORE_TYPE, ADDRESS, ADDRESS2, STATE_OR_PROVINCE, CITY, COUNTRY, PHONE1, LONGITUDE, LATITUDE, DISTANCE';

    const request = {
      method: 'locator.doorsandskustatus',
      params: [{
        fields,
        radius: options.radius,
        skus: [options.skuId],
        latitude: options.geolocation.lat,
        longitude: options.geolocation.lng
      }],
      onSuccess: function(response) {
        let dataInventory = _.extend({}, response.getValue());;
        dataInventory.requestOptions = options;
        deferred.resolve(dataInventory);
      },
      onFailure: function(response) {
        deferred.reject(response.getError());
      }
    };

    generic.jsonrpc.fetch(request);
  });
})(
  jQuery  
);
