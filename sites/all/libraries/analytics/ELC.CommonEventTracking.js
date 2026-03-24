// Common Event Tracking - Analytics.
// Created this file to trigger all  common custom event for all brands.
(function (site, $) {
  Drupal.behaviors.analyticsCommonEventTracking = {
    attach: function (context) {
      if (site && site.track && site.track.evtLink) {

        // Search Icon click - overlay open event tracking
        var searchIconElements = [
          '.js-nav-search-menu-tracking',
          '.js-sd-search-gnav-input-field .js-icon-search',
          '.js-input-search-gnav-field'
        ];
      
        $(document).on('click', searchIconElements.join(','), function() {
          var $currentElem = $(this);
          if (!$currentElem.hasClass('js-search-close-icon')) {
            site.track.searchOverlayOpen();
          }
        });

        $(document).on('click', '.js-vto-shade-grid-cta-container .js-add-to-bag-button', function() {
          document.cookie = 'vtoAddToBagClick=1';
        });
      }

      $( document ).ready(function() {
        if (window.location.pathname == '/checkout/review.tmpl'
        && ($('#payment-method .payment_type').is(':visible')
        || $('#payment-container input[name="PP_PAYMENT_METHOD"]').is(':visible')) ) {
          if (site && site.track) {
            site.elcEvents && site.elcEvents.addListener('tealium:loaded', function() {
              site.track.addPaymentInfo && site.track.addPaymentInfo();
            });
          }
        }
      });
      // #MTA-9096 - Flipnet registeration start.
      if ($('div').hasClass('js-elc-iframe-content-experience--v1')) {
        window.addEventListener("message", (event) => {
          if (event.data.event == 'successful-flipnet-registration') {
            site.track.registration({
              event_label: 'flipnet',
              account_source: 'flipnet'
            });
          }
        });
      }
      // #MTA-9096 - Flipnet registeration end.

      // #MTA-9101 - Loyalty Join form tagging start.
      var userState;
      var joinFormCtaLabel;
      var loginUser = $('body').hasClass('elc-user-state-logged-in');
      var loyaltyUser = $('body').hasClass('elc-user-state-loyalty');
      if (loginUser && loyaltyUser) {
        userState = 'signed_in_loyalty_user';
      } else if (loginUser) {
        userState = 'signed_in_user';
      } else {
        userState = 'non_signed_in_user';
      }

      $(document).on('click', '.js-hero-link--1 a, .js-hero-link--2 a', function () {
        var $currentElem = $(this);
        joinFormCtaLabel = $currentElem.text().trim();
        var navTrackName = $currentElem.closest('.node').attr('trackname');
        if (userState && joinFormCtaLabel && navTrackName && navTrackName.indexOf('Loyalty') > -1) {
          site.track.joinFormLoyalty({
            event_action: userState,
            event_label: joinFormCtaLabel
          });
        }
      });
      // #MTA-9101 - Loyalty Join form tagging end.

    }
  };
})(window.site || {}, jQuery);
  