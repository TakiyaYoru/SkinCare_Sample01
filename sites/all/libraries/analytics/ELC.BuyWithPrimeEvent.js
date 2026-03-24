(function (site) {
  // Event track common function call start.
  function trackEvent(eName, eCategory, eAction, elabel) {
    var eventObj = {
      event_name: eName,
      event_category: eCategory,
      event_action: eAction,
      event_label: elabel
    };

    site?.track?.evtLink(eventObj);
  }
  // Event track common function call end.

  window.addEventListener('AMAZON-SHOPPER-EVENTS', (evt) => {
    var eventDetails = evt.detail;
    var utagData = window.utag_data;

    if (eventDetails && eventDetails.name) {
      if (eventDetails.name === 'ADD-TO-CART' && utagData && utagData.product_name) {
        trackEvent('bw_prime_add_to_cart', 'bw_prime', 'add_to_bag', `${utagData.product_name[0]} - ${utagData.product_id[0]}`);
      }
    }
  });
})(window.site || {});
