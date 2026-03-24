/*global generic*/
(function(site) {
  var trackingDataLayer = {
    data: {},
    runEvents: function(obj) {
      // function can be called in an event context, so "this" may not be correct
      var that = site.trackingDataLayer;

      // allow data that has "changed" during the RPC to be included
      obj = obj || {};
      var events = obj.datalayer_events || that.data.datalayer_events || {};

      /*
          events is an object with event name as the key
          values can be either:
            a) {}, indicating that the event has no data or has been defered.
              or
            b) another object contained event_data, which should be passed via the dispatch
          tag
        */

      var numberOfEvents = 0;
      var crossPlatformAuth = localStorage.getItem('cross_platform_auth');
      var eventNameAuth = ['signin', 'signinFailed', 'registration'];

      for (var eventName in events) {
        if (events.hasOwnProperty(eventName)) {
          numberOfEvents++;

          if (crossPlatformAuth && eventNameAuth.includes(eventName)) {
            continue;
          }

          if (events[eventName].event_data) {
            // Assign event_data onto the higher level data object to make sure all required data is present
            // For example, add to cart event_data contains product_ variables for the product modified
            // but the RPC contains the full cart data, so this will create an object with both
            // the product modified and the full cart
            site.elcEvents.dispatch('track:' + eventName, Object.assign({}, obj, events[eventName].event_data));
          } else {
            site.elcEvents.dispatch('track:' + eventName);
          }
        }
      }

      localStorage.removeItem('cross_platform_auth');
      if (numberOfEvents) {
        that.clearEvents();
      }
    },
    clearEvents: function() {
      if (generic && generic.cookie && generic.cookie('datalayer_events')) {
        var datalayerEvents = generic.cookie('datalayer_events')?.replace(/[^A-Za-z0-9_,]/g, '').split(',');
        var eventList = [];
        for (var i = 0; i < datalayerEvents.length; i++) {
          eventList[datalayerEvents[i]] = {};
        }
        if (window.utag_data) {
          window.utag_data.datalayer_events = eventList;
        }
        generic.cookie('datalayer_events', 0, { exp: 0, path: '/' });
      } else if (generic && generic.jsonrpc) {
        // RPC to server to delete all session events
        generic.jsonrpc.fetch({
          method: 'analytics.deleteEvents',
        });
      }

      // Maybe clear from utag_data?
      if (site && site.trackingDataLayer && site.trackingDataLayer.data && site.trackingDataLayer.data.datalayer_events) {
        if (site.trackingDataLayer.data.datalayer_events['checkoutOPC'] || site.trackingDataLayer.data.datalayer_events['addToCart']) {
          site.trackingDataLayer.data.datalayer_events = {};
        }
      }
    },
    load: function(utag_data) {
      if (typeof utag_data === 'undefined') {
        if (generic && generic.jsonrpc) {
          var params = {};
          if (Drupal.settings.analytics && Drupal.settings.analytics.datalayer_cat_override) {
            params.cmCatOverride = Drupal.settings.analytics.datalayer_cat_override;
          }
          generic.jsonrpc.fetch({
            method: 'analytics.getDataLayer',
            params: [params],
            onSuccess: function(jsonRpcResponse) {
              var dataLayer = jsonRpcResponse.getValue() || {};

              // Check for product data in page_data
              if (window.page_data && window.page_data['analytics-datalayer']) {
                Object.assign(dataLayer, window.page_data['analytics-datalayer']);
              }

              if (Drupal.settings.analytics && Drupal.settings.analytics.consent_onetrust_id) {
                var consent = {
                  "consent_onetrust_id" : Drupal.settings.analytics.consent_onetrust_id,
                  "consent_onetrust_language_setting" : Drupal.settings.analytics.consent_onetrust_language_setting,
                  "consent_onetrust_jwt_setting" : Drupal.settings.analytics.consent_onetrust_jwt_setting
                };
                Object.assign(dataLayer, consent);
              }
              if (generic && generic.cookie && generic.cookie('datalayer_events')) {
                var datalayer_events = generic.cookie('datalayer_events')?.replace(/[^A-Za-z0-9_,]/g, '').split(',');
                dataLayer.datalayer_events = dataLayer.datalayer_events || {};
                for (var i = 0; i < datalayer_events.length; i++) {
                  if (dataLayer.datalayer_events[datalayer_events[i]]) {
                    continue;
                  }
                  dataLayer.datalayer_events[datalayer_events[i]] = {};
                }
              }

              if (dataLayer) {
                site.trackingDataLayer.load(dataLayer);
                window.utag_data = site.trackingDataLayer.data;
                site.trackingDataLayer.removeLoyaltyAttributes();
              }
            }
          });
        }
      } else {
        window.utag_data = window.utag_data || {};
        if (this.data) {
          Object.assign(utag_data, this.data);
        }
        if (Drupal.settings.analytics && Drupal.settings.analytics.consent_onetrust_id && Drupal.settings.analytics.consent_onetrust_jwt_setting) {
          var consent = {
            "consent_onetrust_id" : Drupal.settings.analytics.consent_onetrust_id,
            "consent_onetrust_language_setting" : Drupal.settings.analytics.consent_onetrust_language_setting,
            "consent_onetrust_jwt_setting" : Drupal.settings.analytics.consent_onetrust_jwt_setting
          };
          Object.assign(utag_data, consent);
        }
        Object.assign(this.data, utag_data);
        Object.assign(window.utag_data, utag_data);
        site.trackingDataLayer.fixupProductData(this.data);
        Object.assign(window.utag_data, this.data);
        site.trackingDataLayer.removeLoyaltyAttributes();
        site.elcEvents.dispatch('trackingDataLayer:loaded');
      }
    },
    update: function(obj) {
      // function can be called in an event context, so "this" may not be correct
      var that = site.trackingDataLayer;

      obj && Object.assign(that.data, obj);
      if (window.utag_data) {
        that.fixupProductData(that.data);
        Object.assign(window.utag_data, that.data);
      }
      that.runEvents(obj);
    },
    fixupProductData: function(obj) {
      var that = site.trackingDataLayer;

      var dataLayer = obj || that.data || {};

      if (dataLayer.hasOwnProperty('product_impression_id')) {
        dataLayer['product_impression_list'] = [];
        dataLayer['product_impression_position'] = [];
        for (var i = 0; i < dataLayer['product_impression_id'].length; i++) {
          dataLayer['product_impression_list'].push(document.location.pathname);
          dataLayer['product_impression_position'].push(i + 1);
        }
        dataLayer['product_impression_brand'] = dataLayer['product_impression_id'].map(function() {
          return dataLayer['brand'];
        });
      }
      if (dataLayer.hasOwnProperty('cart_product_id') && typeof dataLayer['cart_product_id'] === 'object') {
        dataLayer['cart_product_brand'] = dataLayer['cart_product_id'].map(function() {
          return dataLayer['brand'];
        });
      }
      if (dataLayer.hasOwnProperty('product_id') && typeof dataLayer['product_id'] === 'object') {
        dataLayer['product_brand'] = dataLayer['product_id'].map(function() {
          return dataLayer['brand'];
        });
      }
    },
    removeLoyaltyAttributes: function() {
      if (!window?.utag_data?.is_loyalty_member) {
        window.utag_data = Object.fromEntries(
          Object.entries(window.utag_data).filter(([property]) => !property.startsWith('loyalty_'))
        );
      }
    }
  };

  site.trackingDataLayer = trackingDataLayer;
}(window.site || {}));
