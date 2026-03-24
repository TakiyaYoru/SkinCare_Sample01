var Drupal = Drupal || {};
var settings = Drupal.settings || {};

(function ($) {
  Drupal.behaviors.vkLoginV1 = {
    attached: false,
    nodes: {},
    vkInitialized: false,
    codeParam: null,
    _getDOMNodes: function (context) {
      var self = this;

      self.nodes.$container = $(context).find('.js-vk-social-login--v1');
      self.nodes.$socialContainer = $(context).find('.js-social-login-combined--v1');
      self.nodes.$socialInfoContainer = $(context).find('.js-social-info__vk');
      self.nodes.$vkLoginButton = self.nodes.$socialInfoContainer.length
        ? self.nodes.$socialInfoContainer.find('.js-vkontakte-login')
        : self.nodes.$container.find('.js-vkontakte-login');
      self.nodes.$socialLoginTermsAgreement = self.nodes.$socialInfoContainer.length
        ? self.nodes.$socialInfoContainer.find('input[name=SOCIAL_LOGIN_TERMS_AGREEMENT]')
        : self.nodes.$container.find('input[name=SOCIAL_LOGIN_TERMS_AGREEMENT]');
    },
    showVkContainer: function () {
      this.nodes.$container.removeClass('hidden');
      this.nodes.$socialContainer.removeClass('hidden');
    },
    _getAppId: function () {
      if (settings.common.vk_login_app_id && settings.common.vk_login_app_id !== '') {
        return settings.common.vk_login_app_id;
      }
    },
    attachClicks: function () {
      if (this.nodes && this.nodes.$vkLoginButton) {
        var self = this;

        self.nodes.$vkLoginButton.on('click', function () {
          return self._login(self);
        });
      }
    },
    initVK: function () {
      var appId = this._getAppId();

      if (!appId) {
        return;
      }
      window.VK.init({
        apiId: appId
      });
      this.vkInitialized = true;
    },
    init: function (context) {
      this._getDOMNodes(context);
      this.showVkContainer();
      this.attachClicks();
    },
    _login: function (context) {
      var currentPath = window.location.href;
      var redirectUrl = 'https://' + window.location.host + '/account/vkontakte_signin.tmpl';
      var redirecTo = $(this).data('redirect');
      var params = [];

      if (typeof redirecTo !== 'undefined') {
        params.push('RETURN_URL=' + encodeURIComponent(redirecTo));
      } else if (currentPath.match('/checkout(?!/confirm)/')) {
        params.push('RETURN_URL=' + encodeURIComponent('/checkout/index.tmpl'));
      } else if (currentPath.search('RETURN_URL') > -1) {
        var url_to_parse = new URL(currentPath);

        redirecTo = url_to_parse.searchParams.get('RETURN_URL');
        params.push('RETURN_URL=' + encodeURIComponent(redirecTo));
      }
      if (context.nodes.$socialLoginTermsAgreement.length) {
        var $socialAgreementValue = Number(context.nodes.$socialLoginTermsAgreement.val()) || '';

        params.push('SOCIAL_LOGIN_TERMS_AGREEMENT=' + $socialAgreementValue);
      }
      if (params.length > 0) {
        var params_string = params.join('&');

        /* We should use double encoding because redirectUrl is a part of URL which is also a part of URL.
         * With single encode parts of redirectUrl will be decoded as parts of whole URL. */
        redirectUrl += '?' + encodeURIComponent(params_string);
      }
      if (!window.VK._domain.main.match('/$')) {
        window.VK._domain.main = window.VK._domain.main + '/';
      }
      var url =
        window.VK._domain.main +
        window.VK._path.login +
        '?client_id=' +
        window.VK._apiId +
        '&display=page&redirect_uri=' +
        redirectUrl +
        '&response_type=code&scope=email,offline';

      top.location.href = url;
    },
    /* Fallback function if URLSearchParams is not available
     * Returning get parameter value from the current URL. */
    getUrlParameter: function (name) {
      if (typeof URLSearchParams === 'function') {
        var queryString = new URLSearchParams(location.search);
        var codeParam = queryString.get('code');

        return codeParam;
      } else {
        name = name.replace(/\[/, '\\[').replace(/\]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
      }
    },
    attach: function (context) {
      if (!!this.attached || typeof VK !== 'undefined') {
        return;
      }
      if (document.getElementById('vkontakte-jssdki')) {
        return;
      }
      window.vkAsyncInit = function () {
        Drupal.behaviors.vkLoginV1.initVK();
      };
      this.init(context);
      this.attached = true;
    }
  };
})(jQuery);
