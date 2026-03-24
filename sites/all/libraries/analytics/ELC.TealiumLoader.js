<!-- TEALIUM Loading script asynchronously -->
(function(site, Drupal, ServiceRegistry, ServiceBus, Topics) {
  window.loadTealium = function(a, b, c, d) {
    ServiceRegistry = ServiceRegistry || window.ServiceRegistry || {};
    ServiceBus = ServiceBus || window.GlobalServiceBus || {};
    Topics = Topics || window.ServiceBusTopics || {};
    Drupal = Drupal || window.Drupal || { settings: null };
    window.utag_cfg_ovrd = window.utag_cfg_ovrd || {};

    var tealium_settings = Drupal.settings.analytics || window.utag_cfg_ovrd.settings || {};
    var tealium_profile_by_locale = tealium_settings.tealium_profile_by_locale;
    var currentProfile = tealium_settings.tealium_profile;
    var tealiumEnv = tealium_settings.tealium_env;
    var tealiumUrl = tealium_settings.tealium_url || 'tags.tiqcdn.com';
    if (tealium_profile_by_locale) {
      var localeMatch = document.cookie.match(new RegExp('(?:^|; )LOCALE=([^;]*)'));
      if (localeMatch && localeMatch.length !== 0) {
        var locale = localeMatch[1];
        if (tealium_profile_by_locale[locale] !== undefined) {
          currentProfile = tealium_profile_by_locale[locale];
        } else {
          currentProfile = tealium_settings.tealium_profile;
        }
      } else {
        currentProfile = tealium_settings.tealium_profile;
      }
    }

    var hostUrl = window.location.hostname.split('.')[0];
    var data = site.track.refreshData();
    var dataLayerLangCode = data.language_code;
    var multiLangCode = {
      'cn':['zh', 'cn'],
      'fr':['en', 'fr']
    };
    var isMultiLang = multiLangCode[hostUrl] && (multiLangCode[hostUrl]).indexOf(dataLayerLangCode)>-1;
    if (hostUrl === 'www' || hostUrl === 'm' || (hostUrl === dataLayerLangCode || isMultiLang)) {
      tealiumEnv = 'prod';
    } else {
      tealiumEnv = 'qa';
    }
    window.utag_cfg_ovrd.path = '//' + tealiumUrl + '/utag/esteelauder/' + currentProfile + '/' + tealiumEnv + '/';

    var triggerStardustAnalyticsLoaded = function() {};

    if (Drupal.settings.common && Drupal.settings.common.stardust && ServiceRegistry && ServiceRegistry['elc-service-analytics']) {
      window.utag_stardust = 1;

      triggerStardustAnalyticsLoaded = function() {
        function onError(error) {
          ServiceBus.log({
            message: error.message,
            payload: error,
            type: window.LogTypes && window.LogTypes.error
          });
        }

        function setAnalyticsLoaded() {
          try {
            var analyticsService = ServiceRegistry['elc-service-analytics'];

            window[analyticsService.name].get('./diContainer').then(
              function(diContainer) {
                diContainer().serviceStarter().then(
                  function() {
                    ServiceBus.emit(Topics.events.ANALYTICS_LOADED);
                  }
                ).catch(onError);
              }
            ).catch(onError);
          } catch (error) {
            onError(error);
          }
        }

        ServiceBus.on(Topics.events.ECOMM_STARTED, setAnalyticsLoaded, { replay: true });
      }
    }

    a = window.utag_cfg_ovrd.path + 'utag.js';
    b = document; c = 'script'; d = b.createElement(c); d.src = a; d.type = 'text/java' + c; d.async = true;
    a = b.getElementsByTagName(c)[0]; a.parentNode.insertBefore(d, a);
    d.handlerFlag = 0; d.onreadystatechange = function() {
      if ((this.readyState === 'complete' || this.readyState === 'loaded') && !d.handlerFlag) {
        d.handlerFlag = 1;
        site.elcEvents.dispatch('tealium:loaded');
        if (window.utag_stardust) {
          triggerStardustAnalyticsLoaded();
        }
      }
    }; d.onload = function() {
      if (!d.handlerFlag) {
        d.handlerFlag = 1;
        site.elcEvents.dispatch('tealium:loaded');
        if (window.utag_stardust) {
          triggerStardustAnalyticsLoaded();
        }
      }
    };
  };
})(
  window.site || {},
  window.Drupal,
  window.ServiceRegistry,
  window.GlobalServiceBus,
  window.ServiceBusTopics
);
