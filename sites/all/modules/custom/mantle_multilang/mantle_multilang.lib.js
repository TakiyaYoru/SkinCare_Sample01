/* eslint-disable complexity */
/* globals JSBoot */
var MantleGeo = (function(MantleGeo, JSBoot) {
  /*
   * Util to process cookies in the akamai edgescape format
   */
  MantleGeo.process_cookie = function(cookie) {
    var cookie_hash = {};
    if (!cookie) {
      return cookie_hash;
    }
    var parts = cookie.split(',');
    for (var i=0; i < parts.length; i++) {
      var item = parts[i];
      var bits = item.split('=');
      var item_key = bits[0];
      var item_value = bits[1];
      cookie_hash[item_key] = item_value;
    }
    return cookie_hash;
  };

  MantleGeo._get_country_cookie = function() {
    var country_cookie = JSBoot.cookie.get('aka_edgescape_country');
    return country_cookie;
  };

  MantleGeo.get_country = function() {
    // For dev purposes and env with no edgescape. Allow us to define the country
    // NOTE: this is to simulate the geo cookie. It is not a substitude for LOCALE.
    var country_override = JSBoot.cookie.get('ELC_GEO_REGION');
    if (country_override) {
      return country_override;
    }
    var country_cookie = MantleGeo._get_country_cookie();
    var cookie_hash = MantleGeo.process_cookie(country_cookie);
    // TODO should there be a default here?
    var country = cookie_hash['cn'];
    return country;
  };

  return MantleGeo;
})(MantleGeo || {}, JSBoot);

var MantleMultiLang = (function(MantleMultiLang, __mantle_multilang, JSBoot) {

  MantleMultiLang.default_locale = null;
  MantleMultiLang.localeMap = {};
  MantleMultiLang.switchValidators = {};

  MantleMultiLang.currentDomain = null;
  MantleMultiLang.defaultLocaleCheckEnabled = false;

  MantleMultiLang.process_settings = function(__mantle_multilang) {
    if (typeof __mantle_multilang === 'undefined') {
      return;
    }

    var default_locale = __mantle_multilang.default_locale;
    if (typeof default_locale !== 'undefined' && !!default_locale) {
      this.default_locale = default_locale;
    }

    if (!!__mantle_multilang.current_domain) {
      this.currentDomain = __mantle_multilang.current_domain;
    }

    this.current_domain = __mantle_multilang.current_domain;
    this.lang_redirect_enabled = !!__mantle_multilang.lang_redirect_enabled;
    this.treat_unknown_locale_as_empty = !!__mantle_multilang.treat_unknown_locale_as_empty;

    this.defaultLocaleCheckEnabled = !!__mantle_multilang.default_locale_check_enabled;

    var language_locale_mapping = __mantle_multilang.language_locale_mapping;

    // rekey language_locale_mapping to LOCALE
    for (var key in language_locale_mapping) {
      if (!language_locale_mapping.hasOwnProperty(key)) {
        continue;
      }
      var item = language_locale_mapping[key];
      var item_locale = item['LOCALE'];
      var item_prefix = item['domain_prefix'];
      if (item['bare_domain']) {
        item_prefix = "";
      }
      this.localeMap[item_locale] = item;
    }
  };

  /*
   * Do we check for default locale?
   */
  MantleMultiLang.isDefaultLocaleCheckEnabled = function() {
    return this.defaultLocaleCheckEnabled;
  };

  /*
   * Get current *Drupal* dmain machine_name.
   */
  MantleMultiLang.getCurrentDomain = function() {
    return this.currentDomain;
  };

  // fix any paths that start with multiple preceding slashes
  // usually happens via a bad link/js
  MantleMultiLang.ensure_one_leading_slash = function(path) {
    path = path.replace(/^\/+/,"");
    path = '/' + path;
    return path;
  }


  /*
   * Given an URL, give back the file extension if it exists.
   */
  MantleMultiLang.getFileExt = function(url) {
    if (!url) {
      return '';
    }

    // Remove everything to the last slash in URL
    url = url.substr(1 + url.lastIndexOf("/"));

    // Break URL at ? and take first part (file name, extension)
    url = url.split('?')[0];

    // Sometimes URL doesn't have ? but #, so we should aslo do the same for #
    url = url.split('#')[0];

    var ext = url.split('.').pop();
    // Now we have only extension
    return ext;
  }

  /*
   * Basic util to see if an url is a perlgem page. For now all we have to
   * determine this is the .tmpl extension.
   */
  MantleMultiLang.isPerlgemPage = function(url) {
    // default to current window path.
    if (!url) {
      url = window.location.href;
    }

    var ext = this.getFileExt(url);

    if (!ext) {
      return false;
    }

    if (ext === 'tmpl') {
      return true;
    }

    return false;;
  };

  /*
   * Util to check if a LOCALE or language item matches the current domain.
   *
   * If the item is missing a domain attribute, it is considered to match no
   * domains.
   */
  MantleMultiLang.localeSettingsMatchDomain = function(localeSettings, currentDomain) {
    if (!localeSettings || !localeSettings.domain) {
      return false;
    }

    if (!currentDomain) {
      currentDomain = this.getCurrentDomain();
    }

    var matchesCurrentDomain = localeSettings.domain === currentDomain;
    return matchesCurrentDomain;
  };

  /*
   * Try to set a default locale.
   *
   * Either match on prefix or use default_locale setting.
   */
  MantleMultiLang.check_default_locale = function() {
    var current_locale = JSBoot.cookie.get('LOCALE');

    var defaultLocaleLog = [];
    var current_locale_unknown = null;
    if (!!current_locale) {
      // Try to get locale settings and check if it matches current domain.
      var localeSettings = MantleMultiLang.getLocaleSettings(current_locale);
      var localeMatchesCurrentDomain = MantleMultiLang.localeSettingsMatchDomain(localeSettings);
      if (!localeSettings || !localeMatchesCurrentDomain) {
        current_locale_unknown = true;
      }

      // Log that we started with a cookie LOCALE
      defaultLocaleLog.push('CL=' + current_locale);
      // Do we recognize this LOCALE cookie?
      defaultLocaleLog.push('CLU=' + (current_locale_unknown | 0));
      // If we had localeSettings, did it match current domain?
      if (localeSettings) {
        defaultLocaleLog.push('CLMD=' + (localeMatchesCurrentDomain | 0));
      }
    }

    // Unset unknown LOCALE
    if (current_locale_unknown === true && this.treat_unknown_locale_as_empty) {
      console.warn("Unkonwn Locale: " + current_locale + ". Resetting");
      current_locale = null;
      // Did we unset and treat as empty?
      defaultLocaleLog.push("CLEMPTY=1");
    }

    // Already have LOCALE
    if (current_locale) {
      return;
    }

    // TODO: so this is where the real default LOCALE checking happens. At some
    // point this should be pluggable for instances where we'd want to flip on
    // a country selection modal.

    // First default is the default_locale setting
    if (!!this.default_locale) {
      current_locale = this.default_locale;
      defaultLocaleLog.push("MATCH_DEFAULT=1");
    }

    // Try to match to current prefix.
    // so if we're on ca/en/bob it'll default us to en_CA. Provided it's a
    // valid LOCALE.
    var href = window.location.href;
    var path_item = this.match_href_to_locale(href);

    if (path_item) {
      current_locale = path_item['LOCALE'];
      defaultLocaleLog.push("MATCH_PATH=1");
    }

    if (!!current_locale) {
      MantleMultiLang.setLocaleCookie(current_locale);

      // Check the LOCALE cookie we set
      var localeCookies = MantleMultiLang._getAllLocaleCookies();
      defaultLocaleLog.push("POST=" + localeCookies.join(','));

      // Check if we think we're on PG and log.
      var isPerlgemPage = this.isPerlgemPage();
      defaultLocaleLog.push("ISPG=" + (isPerlgemPage | 0));

      // If we are setting the LOCALE cookie. We want to keep a record around
      // for debugging purposes. This will show up in the apache logs.
      // example output: MATCH_DEFAULT=1|MATCH_PATH=1|POST=en_US|ISPG=0
      var defaultLocaleLogString = defaultLocaleLog.join("|");

      // Just some protection against long cookies. Really should ever me at 50
      // char max.
      if (defaultLocaleLogString.length < 200) {
        JSBoot.cookie.set('MM_DEFAULT_LOG', defaultLocaleLogString);
      } else {
        JSBoot.cookie.set('MM_DEFAULT_LOG', 'TOO_LONG');
      }

      if (isPerlgemPage) {
        // We refresh when first setting LOCALE because we might have DOM on
        // screen for the wrong LOCALE.
        window.location.reload();
      }
    }
  };

  /*
   * This will expire cookies matching a non-host cookie.
   *
   * This normally happens when using a browser extension like EditThisCookie.
   * It will default to setting a wildcard for the domain. This messes up
   * cookie processing as JSBoot.cookie.set and PG don't set LOCALE without
   * domain.
   */
  MantleMultiLang.expireExtraLocaleCookies = function() {
    var cookieDomain = MantleMultiLang.getHost(window.location.href);
    MantleMultiLang.expireCookieWithDomain(cookieDomain);
  };

  /*
   * Ripped from EditThisCookie.
   *
   * Get the host (cookie.domain).
   */
  MantleMultiLang.getHost = function(url) {
    return (url.match(/:\/\/(.[^:/]+)/)[1]).replace('www.', '');
  };

  /*
   * Expire LOCALE cookie with domain.
   *
   * TODO: Expand JSBoot.cookie.set to handle domain option.
   */
  MantleMultiLang.expireCookieWithDomain = function(domain) {
    if (!domain) {
      return;
    }

    var name = 'LOCALE';
    var value = '';
    var date = new Date();
    date.setTime(date.getTime() - 600);
    var expires = '; expires=' + date.toUTCString();
    var domainString = '; domain=' + domain;
    document.cookie = name + '=' + value + expires + domainString + '; path=/';
  };

  /*
   * Util to set LOCALE cookie. Expires any non-"Host-only" cookies that might
   * get set by EditThisCookie.
   */
  MantleMultiLang.setLocaleCookie = function(locale) {
    MantleMultiLang.expireExtraLocaleCookies();
    JSBoot.cookie.set('LOCALE', locale);
  };

  /*
   * An util func to get all LOCALE cookies. This can happen if cookies are set
   * for different paths. This is for sanity.
   */
  MantleMultiLang._getAllLocaleCookies = function() {
    var nameEQ = "LOCALE=";
    var cookies = [];

    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      // remove any whitespace.
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        cookies.push(c.substring(nameEQ.length,c.length));
      }
    }
    return cookies;
  };

  MantleMultiLang._switchLocale = function(locale, url) {
    MantleMultiLang.setLocaleCookie(locale);
    // If we've been passed an url. Go to that url. We allow the LOCALE prefix
    // redirect to redirect us to the proper prefix.
    // This is special behavior because lang_redirect won't change the url if
    // we're already on the correct prefix. Which is incorrect behavior when we
    // have a specific url we want to get to and not just fixing the url we're
    // currently on.
    if (!!url) {
      window.location.href = url;
      return;
    }
    MantleMultiLang.lang_redirect(window.location.href);
  };


  /*
   * Requests a locale switch. This will run through validators that can deny
   * the locale switch. An example of this is a warning that switching locales
   * will recompute taxes and prices.
   */
  MantleMultiLang.requestLocaleSwitch = function(locale, context, target_url) {
    var current_locale = JSBoot.cookie.get('LOCALE');

    // Same locale
    if (current_locale == locale) {
      return false;
    }

    var locale_settings = MantleMultiLang.getLocaleSettings(locale);
    if (!locale_settings) {
      return false;
    }

    var _validation_callback = function(is_valid) {
      if (is_valid) {
        MantleMultiLang._switchLocale(locale, target_url);
      }
    };

    this.validateLocaleSwitch(locale, context, _validation_callback);
  };

  MantleMultiLang.getLocaleSettings = function(locale) {
    if (!MantleMultiLang.localeMap[locale]) {
      console.warn(locale + " does not exist in localeMap.");
      return false;
    }
    return MantleMultiLang.localeMap[locale];
  }

  /*
   * Run validation on a request to switch locales. This is for checking things
   * like cart contents.
   */
  MantleMultiLang.validateLocaleSwitch = function(locale, context, validation_callback) {
    var promises = [];
    var completedPromises = 0;
    var failed = false;

    for (var func_ns in this.switchValidators) {
      if (!this.switchValidators.hasOwnProperty(func_ns)) {
        continue;
      }
      var func = this.switchValidators[func_ns];
      if (typeof func !== 'function') {
        continue;
      }

      var validator_value = func(locale, context);

      // validator explicitly failed. FAIL
      if (validator_value === false) {
        JSBoot.log('mantlemultilang', [func_ns, "failed validation"]);
        validation_callback(false);
        return;
      }

      // no validator value. consider this an opt out
      if (typeof validator_value === 'undefined') {
        continue;
      }
      // test for promise 
      if (typeof validator_value === 'object'
        && typeof validator_value.then == 'function')
      {
        promises.push({'ns': func_ns, 'promise': validator_value});
      }
    }

    // no promises and no explicit rejections. PASS
    if (promises.length === 0) {
      JSBoot.log('mantlemultilang', ['No validators, autopass']);
      validation_callback(true);
      return;
    }

    for (var i = 0; i < promises.length ; i++) {
      var item = promises[0];
      var promise = item['promise'];
      var ns = item['ns'];
      promise.then(function(is_valid) {
        completedPromises += 1;

        // fail fast.
        if (is_valid === false) {
          failed = true;
          JSBoot.log('mantlemultilang', [ns, 'return failure from promise']);
          validation_callback(false);
        }
        // if we haven't already failed and resolved all promises
        // then we PASS
        if (!failed && completedPromises === promises.length) {
          JSBoot.log('mantlemultilang', ['no promises failed, pass validation']);
          validation_callback(true);
        }
      });
    }
  }


  MantleMultiLang.registerSwitchValidator = function(ns, callback) {
    this.switchValidators[ns] = callback;
  };

  /*
   * This will reset the admin bar value which can be stale due to caching.
   */
  MantleMultiLang.refresh_current_locale = function($) {
    var current_locale = this.getCurrentLocale();
    if (!!current_locale) {
      $('.js-mantle-current-locale').html(current_locale);
    }
  };

  MantleMultiLang.getCurrentLocale = function() {
    var current_locale = JSBoot.cookie.get('LOCALE');
    return current_locale;
  };

  MantleMultiLang.match_href_to_locale = function(href, domain) {
    var url_parts = JSBoot.URL.urlToParts(href);
    var path = url_parts['pathname'];

    // since we're doing string compares. normalize to one / preceding slash
    path = this.ensure_one_leading_slash(path);
    return this.match_path_to_locale(path, domain);
  };

  /*
   * Matches a given path to a LOCALE.
   *
   * This is so users landing on a valid prefix can be defaulted to that
   * LOCALE. Because prefixes are only valid within a domain, we also check
   * against currentDomain.
   */
  MantleMultiLang.match_path_to_locale = function(pathname, domain) {
    var bare_domain_item = null;

    var localeMap = this.localeMap;

    if (!domain) {
      domain = this.getCurrentDomain();
    }

    for (var locale in localeMap) {
      if (!localeMap.hasOwnProperty(locale)) {
        continue;
      }
      var item = localeMap[locale];
      // We don't support path matching outside of a domain.
      if (item.domain !== domain) {
        continue;
      }
      // We skip checking bare domains on this loop
      // store since we'll use it later if we don't match
      if (!!item['bare_domain']) {
        bare_domain_item = item;
        continue;
      }
      var prefix = item['domain_prefix'];
      if (!prefix) {
        continue;
      }
      if (JSBoot.startsWith(pathname, prefix)) {
        return item;
      }
    }
    // If we got here it means we didnt match any domain prefix and we have a
    // bare domain language. Assume we're on the bare domain.
    if (!!bare_domain_item) {
      return bare_domain_item;
    }
    return null;
  };

  MantleMultiLang.lang_redirect = function(href) {
    var url_parts = JSBoot.URL.urlToParts(href);
    var path = url_parts['pathname'];

    // since we're doing string compares. normalize to one / preceding slash
    path = this.ensure_one_leading_slash(path);

    var pathArray = path.split('/');
    var locale_cookie = JSBoot.cookie.get('LOCALE');

    var locale_item = this.localeMap[locale_cookie];
    var path_item = this.match_path_to_locale(path);

    // either we're missing the LOCALE cookie or we don't have a config for it.
    // For now we are opting out.
    if (!locale_cookie || !locale_item) {
      return;
    }

    // If the path item matches our locale cookie. No need to redirect.
    // TODO: so we strip duplicate leading slashes. But we also don't redirect
    // to a single slashed url if we match.
    // So something like: /////uk/en/products/123 will remain like that.
    if (!!path_item && path_item['LOCALE'] == locale_cookie) {
      return;
    }

    // We need to add the prefix. If we already have a locale prefix. Remove
    // it so we do not double up.
    if (!!path_item) {
      var path_prefix = path_item['domain_prefix'];
      // In reality, the path_prefix won't match only when the domain is bare.
      if (!!path_prefix && JSBoot.startsWith(path, path_prefix)) {
        path = path.substr(path_prefix.length);
      }
    }

    // Lets redirect now.
    var locale_prefix = locale_item['domain_prefix'];

    // Set correct host for locale.
    var base_url_parts = JSBoot.URL.urlToParts(locale_item['base_url']);
    url_parts['hostname'] = base_url_parts['hostname'];

    // if this is a baredomain language. don't set a locale_prefix
    // TODO: we make this optional so that bare_domains can target their
    // prefix?
    if (!!locale_item['bare_domain']) {
      locale_prefix = '';
    }
    var target_path = locale_prefix + path;

    url_parts['pathname'] = target_path;
    var target_url = JSBoot.URL.partsToUrl(url_parts);

    // good to redirect
    window.location.href = target_url;
  };

  /*
   * Return browsers preferred languages. Supports backward compat with
   * browsers that only have one language.
   */
  MantleMultiLang.gatherLanguages = function() {
    if(!window.navigator.languages) {
      return [window.navigator.language];
    }
    return window.navigator.languages;
  };

  /*
   * Using GEO, try to match country against available locales.
   *
   * Returns just the LOCALE key to have parity with getting currentLocale
   */
  MantleMultiLang.getGeoLocale = function() {
    var country = MantleGeo.get_country();
    var geo_locale = this.matchCountryToLocale(country);
    if (!geo_locale) {
      console.warn(country + " does not exists for this domain");
    }
    return geo_locale;
  };

  /*
   * Cookie utils to keep track of geo check.
   */
  MantleMultiLang.setGeoLock = function() {
    JSBoot.cookie.set('ELC_GEO_CHECK', 1);
  };

  MantleMultiLang.unsetGeoLock = function() {
    JSBoot.cookie.remove('ELC_GEO_CHECK');
  };

  MantleMultiLang.isGeoLocked = function() {
    var geo_lock = JSBoot.cookie.get('ELC_GEO_CHECK');
    return !!geo_lock;
  };

  /*
   * Add ability to explicitly trigger geo overlay for debug purposes.
   */
  MantleMultiLang.isDebugTriggerOverriden = function() {
    var debugCookie = !!JSBoot.cookie.get('ELC_GEO_DEBUG');
    var debugQuery = JSBoot.URL.getParam('trigger_geo_overlay') !== null;
    return debugCookie || debugQuery;
  };

  MantleMultiLang.matchCountryToLocale = function(country) {
    var localeMap = this.localeMap;

    for (var locale in localeMap) {
      if (!localeMap.hasOwnProperty(locale)) {
        continue;
      }
      var item = localeMap[locale];
      if (item['region'] === country) {
        return item['LOCALE'];
      }
    }
    return null;
  };

  /*
   * AJAX call to get translated content. Will pass along hints to the backend
   * in the form of accept-language, geo, and locale cookie.
   */
  MantleMultiLang.getTranslatedContent = function(content_key, options) {
    if (!options) {
      options = {};
    }

    var successCallback = 'success' in options ? options.success : null;
    var errorCallback = 'error' in options ? options.error : null;
    var type = 'type' in options ? options.type : 'content';

    var pathPrefix = JSBoot.getPathPrefix();
    var url = '/' + pathPrefix + '_mantlemultilang/' + content_key + '/' + type;
    var languages = MantleMultiLang.gatherLanguages();

    if (!!languages) {
      url = url + '/lang/' + languages[0];
    }

    var region = MantleGeo.get_country();
    if (!!region) {
      url = url + '/region/' + region;
    }

    var current_locale = MantleMultiLang.getCurrentLocale();
    if (!!current_locale) {
      url = url + '/locale/' + current_locale;
    }

    var ajaxOptions = {
      success: function(data, responseText, req) {
        if (!successCallback) {
          return;
        }
        // this should always return json.
        var json = JSON.parse(data);
        successCallback(json, responseText, req);
      },
      error: function(data, responseText, req) {
        if (!errorCallback) {
          return;
        }
        // this should always return json.
        var json = JSON.parse(data);
        errorCallback(json, responseText, req);
      },
    };
    JSBoot.ajax.request(url, ajaxOptions);
  };

  /*
   * This encapsulates the current GEO Drawer Logic.
   */
  MantleMultiLang.runGeoDrawerLogic = function(options, content_key) {
    var render = 'render' in options ? options.render : null;
    if (!content_key) {
      content_key = 'geo_drawer';
    }

    var current_locale = MantleMultiLang.getCurrentLocale();
    var geo_locale = MantleMultiLang.getGeoLocale();
    var geo_settings = MantleMultiLang.getLocaleSettings(geo_locale);
    var isGeoLocked = MantleMultiLang.isGeoLocked();
    var forceDisplay = MantleMultiLang.isDebugTriggerOverriden();

    // Currently no point in making ajax call without a way to render it.
    if (!render) {
      return;
    }

    // If we do not have a geo_locale cookie. We can't do any geo targetting
    // logic anyways. Currently geo cookies are provided by Akamai so it won't
    // work on locals.
    if (geo_locale === null) {
      return;
    }

    // Already ran GEO logic.
    if (isGeoLocked && !forceDisplay) {
      return;
    }

    // On same locale
    if ((geo_locale === current_locale) && !forceDisplay) {
      return;
    }

    /*
     * Go grab geo_drawer and then render.
     */
    var content_options = {};
    content_options['success'] = function(data, responseText, req) {
      render(data, geo_settings);
    };
    if ('type' in options) {
      content_options['type'] = options['type'];
    }
    MantleMultiLang.getTranslatedContent(content_key, content_options);
  };

  /*
   * Init Section
   */
  MantleMultiLang.init = function() {
    MantleMultiLang.process_settings(__mantle_multilang);
    // Default locale checking is gated per domain.
    if (MantleMultiLang.isDefaultLocaleCheckEnabled()) {
      MantleMultiLang.check_default_locale();
    }
    // Redirect to proper prefix. This redirect happens in <head> and should
    // occur as early as possible.
    if (MantleMultiLang.lang_redirect_enabled) {
      MantleMultiLang.lang_redirect(window.location.href);
    }

    // This to update admin bar menu link for LOCALE is page is cached.
    document.addEventListener('DOMContentLoaded', function(event) {
      MantleMultiLang.refresh_current_locale(jQuery);
    });
  };

  // NOTE: this is meant to be callable inline in head. So no jquery deps.
  MantleMultiLang.init();

  return MantleMultiLang;
})(MantleMultiLang || {}, window.__mantle_multilang, JSBoot);
