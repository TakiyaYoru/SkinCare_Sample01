var generic = generic || {},
    site = site || {},
    Drupal = Drupal || {},
    FB = FB || '',
    settings = Drupal.settings || {};

(function($) {
  var attachedFBScript = false;
  var $pgPageWithFacebookButton = $('.pg_wrapper .js-facebook-button', document);
  function loadFBScript(d, s, id) {
    if (attachedFBScript) {
      return false;
    }
    attachedFBScript = true;
    var js, fjs = d.getElementsByTagName(s)[0];
    var locale = settings.common.fb_sdk_locale || 'en_US';
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s); js.id = id;
    js.src = '//connect.facebook.net/' + locale + '/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
  }
  $(document).on('loadFacebookScript', function() {
    loadFBScript(document, 'script', 'facebook-jssdk');
  });
  if ($pgPageWithFacebookButton.length) {
    $(document).trigger('loadFacebookScript');
  }

  site.facebook = (function() {
    var nodes = {};
    var fbbtn = $('.js-fb-login-button');

    var _getDOMNodes = function() {
      nodes.container = $('.social-login__container');
      nodes.form = $('#facebook_signin');
      nodes.appIdInput = nodes.form.find('input[name="appId"]');
      nodes.tokenInput = nodes.form.find('input[name="token"]');
      nodes.newAccountContainer = $('.js-new-account');
      nodes.errorContainer = nodes.newAccountContainer.find('.error_messages');
      nodes.divider = nodes.container.find('.social-login__divider');
      nodes.optInInput = $('.js-facebook_email_opt_in');
      nodes.fbDisconnect = $('#facebook_disconnect');
      fbbtn.attr('onlogin', 'site.facebook.continueWithFacebook();');
    };

    var _initFB = function(appId) {
      FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v2.10'
      });
      if (!settings.fb_logpage_excluded) {
        FB.AppEvents.logPageView();
      }

      FB.Event.subscribe('xfbml.render', _showFbContainer);
    };

    var _showFbContainer = function() {
      nodes.container.removeClass('hidden');
    };

    var _getAppId = function() {
      if (settings.common.fb_login_app_id) {
        return settings.common.fb_login_app_id;
      }
    };

    $('body').on('click', '.js-facebook_disclaimer', function() {
      if ($(this).is(':checked')) {
        $('.js-fb-overlay, .js-fb-disclaimer-error').hide();
      } else {
        $('.js-fb-overlay, .js-fb-disclaimer-error').show();
      }
    });

    $('body').on('click', '.js-fb-overlay', function() {
      $('.js-fb-disclaimer-error').removeClass('hidden');
    });

    var _handleLoginStatusResponse = function(response) {
      //console.log("Facebook status in _handleLoginStatusResponse: " + response.status);
      // If we're on the signout page (for any reason - timeout or logout),
      // log the user out according to Facebook
      if (location.pathname.match('/account/signin.tmpl') && location.search.match('_SUBMIT=signout') && (response.status === 'connected')) {
        // FB.logout likes to not work. So, we call this recursively until it
        // does.
        FB.logout(_handleLogoutSessionResponse);
      }
    };

    var _handleLogoutSessionResponse = function(response) {
      //console.log("Facebook status in _handleLogoutSessionResponse: " + response.status);
      // If we're connected, disconnect, again recursively because Facebook is
      // clingy.
      if (response.status === 'connected') {
        FB.logout(_handleLogoutSessionResponse);
      }
    };

    var _init = function() {
      $(function() {
        _getDOMNodes();

        // Make sure that the form action points to the SSL version otherwise it fails to log in
        var action_url = '/account/signin.tmpl';
        if (location.pathname.match('/checkout/index.tmpl')) {
          action_url = '/checkout/index.tmpl';
        }

        // Non-single page checkout setting
        if (location.pathname.match('/checkout/checkout.tmpl') || location.pathname.match('/checkout/signin.tmpl')) {
          action_url = '/checkout/checkout.tmpl';
        }

        nodes.form.attr('action', action_url);
        // Set the RETURN_URL to the currently viewed page
        //BB NA redirects to account/checkout index page
        //ACAC-2004 redirect to profile preferences page when clicked on order confirmation
        var returnUrlInput = $('<input>').attr({
          type: 'hidden',
          name: 'RETURN_URL'
        });
        var returnUrl = null;
        if (location.pathname.match('/checkout/confirm.tmpl')) {
          //var returnUrl = [location.protocol, '//', location.host, location.pathname].join('');
          returnUrl = '/account/signin.tmpl';
          returnUrlInput.val(returnUrl);
          returnUrlInput.appendTo(nodes.form);
        }
        if (location.pathname.match('/checkout/checkout.tmpl') || location.pathname.match('/checkout/index.tmpl')) {
          returnUrl = location.pathname;
          returnUrlInput.val(returnUrl);
          returnUrlInput.appendTo(nodes.form);
        }
        var return_url = null;
        // If URL contains RETURN_URL in query
        if (location.search.match('RETURN_URL')) {
          if (typeof URLSearchParams === 'function') {
            var query_string = new URLSearchParams(location.search);
            return_url = query_string.get('RETURN_URL');
            returnUrlInput.val(return_url);
          } else {
            return_url = getUrlParameter('RETURN_URL');
            returnUrlInput.val(return_url);
          }
          returnUrlInput.appendTo(nodes.form);
        }

        // Hook up any additional "opt in" input field on the page to the main
        // // facebook_signin form's fields.
        if (nodes.optInInput !== 'undefined') {
          nodes.optInInput.on('click', function() {
            // Find the field used to opt the user into email promotions
            var optInFormInput = $('#form--facebook_signin--field--PC_EMAIL_PROMOTIONS');
            // match the checkbox state
            optInFormInput.prop('checked', $(this).is(':checked'));
            // and fill in the LAST_SOURCE field
            var source = 'Facebook_gnav';
            // (Note that /checkout/confirm.tmpl must come before /checkout/)
            if (location.pathname.match('/checkout/confirm.tmpl')) {
              source = 'Facebook_order_confirmation';
            } else if (location.pathname.match('/account/signin.tmpl') || location.pathname.match('/account/index.tmpl')) {
              source = 'Facebook_account_signup';
            } else if (location.pathname.match('/checkout/')) {
              source = 'Facebook_checkout_signin';
            }
            $('#form--facebook_signin--field--LAST_SOURCE').val(source);
          });
        }

        // When the user clicks "Disconnect" in her account, "disconnect"
        // her Facebook account (which, in Facebook terms, means "logout"),
        // *then* submit the facebook_disconnect form so that the back end can
        // clear her Facebook data from USER_LOGINS_TBL and USER_SOCIAL_INFO_TBL.
        if (nodes.fbDisconnect !== 'undefined') {
          // FB method will load only if 'FB disconnect' button available.
          $(document).trigger('loadFacebookScript');
          nodes.fbDisconnect.on('click', function(event) {
            event.preventDefault(); // We'll post the form when we're done
            FB.logout(function(response) {
              // Make sure FB logged us out
              _handleLogoutSessionResponse(response);
              // Tell the back end to clear their account link
              nodes.fbDisconnect.submit();
            });
          });
        }

        var appId = _getAppId();

        if (appId) {
          if (typeof FB === 'object') {
            _initFB(appId);
          }
        }

        if (typeof FB === 'object') {
          FB.getLoginStatus(function(response) {
            _handleLoginStatusResponse(response);
          });
        }

        $('.js-facebook-button').on('click', function(e) {
          e.preventDefault();
          FB.login(function(response) {
            if (response.status === 'connected') {
              site.facebook.continueWithFacebook();
            }
          });
        });
      });
    };

    var _handleContinueWithFacebook = function(response) {
      if (response.status === 'connected') {
        // Extract authResponse.accessToken
        var token = response.authResponse.accessToken;
        nodes.tokenInput.val(token);
        nodes.form.submit();
      } else if (response.status === 'not_authorized') {
        // display error that app hasnt been authorized
        generic.showErrors([{text: site.facebook.not_authorized}], nodes.errorContainer);
      } else if (response.status === 'unknown') {
        // Do nothing - login didn't happen (usually means they clicked Cancel)
        // If we were tightly coupled with the site's login state, we'd log
        // the user out. But we interpret this more as "disconnected from
        // Facebook", so we do nothing.
        //console.log("_handleContinueWithFacebook called with response.status === 'unknown'");
      } else {
        generic.showErrors([{text: site.facebook.login_error}], nodes.errorContainer);
      }
    };

    /* Fallback function if URLSearchParams is not available
     * Returning get parameter value from the current URL
     */
    function getUrlParameter(name) {
      name = name.replace(/\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    return {
      init: function() {
        _init();
      },
      continueWithFacebook: function() {
        var facebookDisclaimer = $('input.js-facebook_disclaimer');
        if (facebookDisclaimer.hasClass('js-facebook_disclaimer') && facebookDisclaimer.is(':checked') === false) {
          $('.js-fb-disclaimer-error').removeClass('hidden');
          return false;
        }
        FB.getLoginStatus(function(response) {
          _handleContinueWithFacebook(response);
        });
      }
    };
  }());

  window.fbAsyncInit = function() {
    site.facebook.init();
  };
})(jQuery);
