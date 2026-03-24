var site = site || {};

(function ($) {
  Drupal.behaviors.socialLoginCombinedV1 = {
    attached: false,
    nodes: {},

    _getDOMNodes: function (context) {
      var self = this;

      self.nodes.$socialLoginCombined = $(context).find('.js-social-login__container');
      self.nodes.$triggersContainer = $(context).find('.js-legal-block');
      self.nodes.$emailPromoTrigger = self.nodes.$triggersContainer.find('.js-social-login__email-promotions--trigger');
      self.nodes.$socialTermsAgreementTrigger = self.nodes.$triggersContainer.find(
        '.js-social-login__terms-agreement--trigger'
      );
      (self.nodes.$socialTermsAgreementContainer = self.nodes.$socialTermsAgreementTrigger.parent(
        '.js-legal-acceptance-block'
      )),
      (self.nodes.$emailPromoInputs = self.nodes.$socialLoginCombined.find('input[name=PC_EMAIL_PROMOTIONS]'));
      self.nodes.$termsInputs = self.nodes.$socialLoginCombined.find(
        'input[name=ACCEPTED_PRIVACY_POLICY], input[name=SOCIAL_LOGIN_TERMS_AGREEMENT]'
      );
    },
    attachTriggers: function () {
      var self = this;

      self.nodes.$emailPromoTrigger.change(function () {
        var $emailPromoTriggerChange = $(this);
        var $emailPromoChecked = Number($emailPromoTriggerChange.prop('checked'));

        self.nodes.$emailPromoInputs.each(function () {
          $emailPromoTriggerChange.val($emailPromoChecked);
        });
      });
      if (self.nodes.$socialTermsAgreementTrigger.length > 0) {
        var $socialLoginBlocker = self.nodes.$socialLoginCombined.find('.social-network__blocker');

        if (self.nodes.$socialTermsAgreementTrigger.prop('checked', false)) {
          $socialLoginBlocker.removeClass('social-network__blocker-hidden');
        }
        self.nodes.$socialTermsAgreementTrigger.change(function () {
          var $socialTermsChange = $(this);
          var $socialTermsChecked = $socialTermsChange.prop('checked');

          self.nodes.$termsInputs.each(function () {
            $socialTermsChange.val(Number($socialTermsChecked));
            $socialLoginBlocker.toggleClass('social-network__blocker-hidden', $socialTermsChecked);
          });
        });
      }
      if (self.nodes.$socialTermsAgreementContainer.length > 0) {
        self.nodes.$socialLoginCombined.find('.social-network__blocker').click(function () {
          var $socialLoginCombinedNetwork = $(this);
          var $backToTopHeight =
            parseInt(self.nodes.$triggersContainer.offset().top) - parseInt(window.innerHeight) / 3;
          var $animateTime = 500;

          $socialLoginCombinedNetwork
            .closest('.js-social-login__container')
            .find('.js-legal-acceptance-block')
            .addClass('legal-container__acceptance-error');
          if ($socialLoginCombinedNetwork.closest('.js-gnav-account').length > 0) {
            $('.js-gnav-account').animate(
              {
                scrollTop: $backToTopHeight + 'px'
              },
              $animateTime
            );
          } else {
            $('html, body').animate(
              {
                scrollTop: $backToTopHeight + 'px'
              },
              $animateTime
            );
          }
        });
      }
    },

    init: function (context) {
      this._getDOMNodes(context);
      this.attachTriggers();
      if (site.facebook) {
        site.facebook.init(); // Redisplay FB button
      }
    },

    attach: function (context) {
      if (!!this.attached) {
        return;
      }

      this.init(context);
      this.attached = true;
      this.nodes.$socialLoginCombined.addClass('attached');
    }
  };
})(jQuery);
