// This will contain generic, platform (jQuery) specific implementations that will affect all sites/brands
// Ultimately, this will be deprecated/replaced when everything is on the new platform.

(function(site, $) {
  $(function() {
    // Hook into all RPCs to determine if the data layer has been updated
    $(document).on('RPC:RESULT', function(event, responseObj, requestArgs, requestId) {
      // Skip if we're getting the datalayer itself
      if (requestArgs && requestArgs.method === 'analytics.getDataLayer') {
        return;
      }

      var responseData = JSON.parse(responseObj.responseText) || [];

      // Theoretically, we could be getting back multiple responses from one json rpc request, although that isn't currently in use anywhere on the PG sites.
      for (var i = 0; i < responseData.length; i++) {
        if (parseInt(responseData[i].id) === requestId && responseData[i].result && responseData[i].result.data) {
          var dataLayerUpdate = responseData[i].result.data.dataLayer;

          if (dataLayerUpdate) {
            site.elcEvents.dispatch('rpcResponseReceived', dataLayerUpdate);
          }
        }
      }
    });

    // TODO convert this to lodash, see SDFNDCR-619
    function throttle(fn, wait) {
      var time = Date.now();
      return function() {
        if ((time + wait - Date.now()) < 0) {
          fn();
          time = Date.now();
        }
      };
    }

    // Global initialization listeners:

    if (Drupal.settings.onetrust_enabled) {
      var onetrustLoaded = 0;
      var dataLayerLoaded = 0;

      var loadTealium = function() {
        if (onetrustLoaded && dataLayerLoaded && typeof window.loadTealium == 'function') {
          window.loadTealium();
        }
      };

      site.elcEvents.addListener('trackingDataLayer:loaded', function() {
        dataLayerLoaded = 1;
        loadTealium();
      });
      if (Drupal.settings.onetrust_loaded) {
        onetrustLoaded = 1;
        loadTealium();
      }
      site.elcEvents.addListener('onetrust:loaded', function() {
        onetrustLoaded = 1;
        loadTealium();
      });
    } else {
      // Required for Drupal as the data layer is loaded by JS, so tealium loading and event processing has to be defered.
      site.elcEvents.addListener('trackingDataLayer:loaded', window.loadTealium || function() {});
    }

    site.elcEvents.addListener('tealium:loaded', function() {
      setTimeout(function() {
        site.elcEvents.dispatch('track:ready');
        site.trackingDataLayer.runEvents();
        site.elcEvents.dispatch('tealium:displayWelcomeLoyaltyTag');
      }, 500);
    });
    site.elcEvents.addListener('rpcResponseReceived', site.trackingDataLayer.update);

    // Event specific listeners:

    var analyticsBehavior = Drupal.behaviors.analyticsBehavior;
    var events = [
      'addToCart',
      'addToFavorites',
      'checkoutOPC',
      'checkoutSampleAdded',
      'emailSignup',
      'getRecAIProdData',
      'liveChatManualInitiated',
      'liveChatManualPreSurvey',
      'liveChatManualWaiting',
      'liveChatManualChatting',
      'liveChatManualChatInitialize',
      'liveChatManualChatended',
      'liveChatProactiveDisplayed',
      'liveChatProactiveInitiated',
      'liveChatProactivePreSurvey',
      'liveChatProactiveWaiting',
      'liveChatProactiveChatting',
      'offerFailed',
      'offerSuccessful',
      'profileUpdate',
      'registration',
      'removeFromCart',
      'searchPageLoaded',
      'searchPredicted',
      'searchRedirect',
      'signin',
      'signinFailed',
      'emailWishlist',
      'productThumbnailClick',
      'cancelOrder'
    ];

    /*
    Removing Google recommended product carousel tagging
    when the Stardust site, view_item_list is enabled - MTA-4529.
    */
    function removeRecAIProd() {
      var index = events.indexOf('getRecAIProdData');

      if (index !== -1) {
        events.splice(index, 1);
      }
    }

    if ($('div').hasClass('sd-product-grid') && $('.sd-product-grid').length > 0) {
      removeRecAIProd();
    }

    if (window.GlobalServiceBus) {
      window.GlobalServiceBus.on('product.grid.viewed', function () {
        removeRecAIProd();
      });
    }

    for (var i = 0; i < events.length; i++) {
      // Try brand function first
      //  - otherwise try the global function
      site.elcEvents.addListener('track:' + events[i], (analyticsBehavior && analyticsBehavior[events[i]]) || site.track[events[i]]);
    }

    // Event listeners for other frontend features
    //  maps other frontend events into analytics specific events
    //  specifically useful for third parties, such as LivePerson

    // LivePerson Engage events
    var liveChatTrackingLoaded = false;
    function loadLiveChatTracking() {
      if (liveChatTrackingLoaded === false) {
        // Define Engagement type (1 == proactive)
        var chatEngagementType = 0;

        if (window.hasOwnProperty('lpTag') && window.lpTag.hasOwnProperty('events')) {
          //Livechat Engagements are displayed on the page
          liveChatTrackingLoaded = true;
          window.lpTag.events.bind({
            eventName: 'OFFER_DISPLAY',
            func: function (eventData) {
              if (eventData.engagementType === 1) {
                // engagementType === 1 indicates that this is a proactive invite
                site.elcEvents.dispatch('track:liveChatProactiveDisplayed');
              }
            }
          });

          // Livechat was clicked on the page
          window.lpTag.events.bind({
            eventName: 'OFFER_CLICK',
            func: function (eventData) {
              chatEngagementType = eventData.engagementType;
              if (eventData.engagementType === 1) {
                // engagementType === 1 indicates that this is a proactive invite
                site.elcEvents.dispatch('track:liveChatProactiveInitiated');
              } else {
                // otherwise it was manual
                site.elcEvents.dispatch('track:liveChatManualInitiated');
              }
            }
          });

          // Livechat conversationInfo Event start.
          window.lpTag.events.bind({
            eventName: 'conversationInfo',
            func: function (eventData) {
              var engagementType = (chatEngagementType === 1) ? 'Proactive' : 'Manual';
              if (eventData.skill && eventData.visitorId) {
                site.elcEvents.dispatch('track:liveChat' + engagementType + 'Chatting');
              }
            }
          });
          // Livechat conversationInfo Event end.

          // Livechat state change.
          var chatendEvents;
          window.lpTag.events.bind({
            eventName: 'state',
            func: function (eventData) {
              var engagementType = (chatEngagementType === 1) ? 'Proactive' : 'Manual';
              if (eventData.state === 'ended') {
                clearTimeout(chatendEvents);
                chatendEvents = setTimeout(function () {
                  site.elcEvents.dispatch('track:liveChat' + engagementType + 'Chatended');
                }, 2000);
              }
            }
          });

          window.lpTag.events.bind({
            eventName: 'state',
            func: function (eventData) {
              var engagementType = '';
              if (chatEngagementType === 1) {
                engagementType = 'Proactive';
              } else {
                engagementType = 'Manual';
              }
              if (eventData.state === 'preChat') {
                // When the survey before the chat is shown
                site.elcEvents.dispatch('track:liveChat' + engagementType + 'PreSurvey');
              }
              if (eventData.state === 'waiting') {
                // When the user submits the survey
                site.elcEvents.dispatch('track:liveChat' + engagementType + 'Waiting');
              }
              if (eventData.state === 'init') {
                // When the user start the chat
                site.elcEvents.dispatch('track:liveChat' + engagementType + 'ChatInitialize');
              }
            }
          });
        }
      }
    }

    // Testing tracking signal from Tealium
    site.elcEvents.addListener('tealium:liveperson-loaded', function() {
      // Load the tracking after we launch LivePerson from Tealium
      loadLiveChatTracking();
    });

    // Load the tracking when we've implemented LivePerson from Drupal
    loadLiveChatTracking();

    // END LivePerson Engage events

    // LiveTex Tracking
    site.elcEvents.addListener('tealium:livetex-loaded', function() {
      var LiveTex = window.LiveTex;

      function trackLiveTexEvent(data) {
        site.track.evtLink({
          event_name: 'liveTex',
          event_category: 'Live Chat Interaction',
          event_action: data.event,
          event_label: window.location.pathname
        });
      }

      LiveTex.addEventListener(LiveTex.Event.WELCOME_WINDOW_SHOWN, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.EMPLOYEE_MESSAGE_SENT, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.OFFLINE_MESSAGE_SENT, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.CONVERSATION_STARTED, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.CALL_STARTED, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.X_WINDOW_SHOWN, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.INVITATION_WINDOW_SHOWN, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.INVITATION_WINDOW_CLOSE, trackLiveTexEvent);
      LiveTex.addEventListener(LiveTex.Event.CALLBACK_SENT, trackLiveTexEvent);
    });
    // END LiveTex Tracking

    // Teester loading and tracking
    window.onTeesterReady = window.onTeesterReady || [];
    window.TeesterSDK = false;
    window.onTeesterReady.push((SDK) => {
      window.TeesterSDK = SDK;
    });
    window.teesterPlayer = false;
    window.teesterTracker = false;

    function trackTeesterEvent(event, videoId, videoLengthSec, videoLengthPercent) {
      var trackingObj = {
        event_name: 'teester',
        event_category: 'teester',
        event_action: event,
        event_label: videoId,
        video_id: videoId,
        video_platform: 'teester',
      };
      if (videoLengthSec !== undefined) {
        trackingObj.video_playhead = videoLengthSec;
      }
      if (videoLengthPercent !== undefined) {
        trackingObj.video_milestone = videoLengthPercent;
      }
      site.track.evtLink(trackingObj);
    }

    window.testTeesterVideo = function(skuBaseId, playerClass, playerId) {
      window.resetTeester(playerId);
      var teesterPlayerKey = window.utag_data.teester_player_id;
      var teesterTrackingKey = window.utag_data.teester_tracking_key;
      var videoId = 'SKU' + skuBaseId;
      if (window.TeesterSDK !== false) {
        window.TeesterSDK.checkVideoAvailability(teesterPlayerKey, videoId, (value) => {
          if (value === false) {
            $(playerClass).addClass('hidden');
          } else {
            $(playerClass).removeClass('hidden');
            window.teesterTracker = window.TeesterSDK.init({
              type: 'tracking',
              args: {
                key: teesterTrackingKey,
                product: videoId,
                event: 'PRODUCT_PAGE_VIEW'
              }
            });
          }
        });
      }
    };

    window.resetTeester = function(playerId) {
      if (window.teesterPlayer !== false) {
        window.teesterPlayer.pause();
        $(playerId).removeClass('teester-parsed');
        $(playerId).empty();
      }
    };

    window.updateTeester = function(skuBaseId, playerId) {
      var teesterPlayerKey = window.utag_data.teester_player_id;
      var videoId = 'SKU' + skuBaseId;
      if (window.TeesterSDK !== false) {
        window.resetTeester(playerId);
        window.teesterPlayer = window.TeesterSDK.init({
          type: 'player',
          args: {
            key: teesterPlayerKey,
            product: videoId,
            width: '100%',
            height: 'auto'
          }
        }, document.querySelector (playerId));

        window.teesterPlayer.onPlay (() => {
          trackTeesterEvent ('video_start', videoId);
        });
        window.teesterPlayer.onPause (() => {
          trackTeesterEvent ('video_pause', videoId);
        });
        window.teesterPlayer.onEnded (() => {
          trackTeesterEvent ('video_stop', videoId);
        });
      }
    };
    // END Teester loading and tracking

    // To track module visibility in viewport
	  window.isInViewport = function(element) {
      if (element) {
       var specs = element.getBoundingClientRect();
        return (
          specs.top >= 0 &&
          specs.left >= 0 &&
          specs.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          specs.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      }
    };

    // Load data layer (and, subsequently, tealium)
    site.trackingDataLayer.load(window.utag_data);
  });
}(window.site || {}, jQuery));
