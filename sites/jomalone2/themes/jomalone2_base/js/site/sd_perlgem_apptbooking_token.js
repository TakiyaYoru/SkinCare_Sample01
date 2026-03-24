(function($) {
  $(document).on('perlgem.apptbookingToken.fetch', function(e, options, deferred) {

    const request = {
      method: 'appointmentbooking.getauthtoken',
      params: [],
      onSuccess: function(response) {
        deferred.resolve(response.getValue().auth_token);
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
