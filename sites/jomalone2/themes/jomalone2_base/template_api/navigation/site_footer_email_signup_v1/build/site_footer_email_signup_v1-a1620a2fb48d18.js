var generic = generic || {};

(function ($) {
  Drupal.behaviors.siteFooterEmailSignupV1 = {
    attach: function (context) {
      var $emailContainerNodes = $('.js-site-footer-email-signup', context);
      var $gdprLink = $('.site-footer-email-signup__gdpr-link', context);

      if (!$emailContainerNodes.length) {
        return null;
      }

      $(document)
        .not($gdprLink)
        .off('touchstart')
        .on('touchstart', function () {
          $gdprLink.trigger('blur');
        });

      $emailContainerNodes.each(function () {
        var $emailContainerNode = $(this);
        var $emailForm = $emailContainerNode.is('form') ? $emailContainerNode : $('form', $emailContainerNode);
        var $emailContent = $('.site-footer-email-signup__email-content', $emailContainerNode);
        var $termsCheckbox = $('.site-footer-email-signup__terms-conditions', $emailContainerNode);
        var $smsTermsCheckbox = $('.site-footer-email-signup__smsterms-conditions', $emailContainerNode);
        var $smsContent = $('.site-footer-email-signup__sms-content', $emailContainerNode);
        var $emailSuccess = $('.site-footer-email-signup__success', $emailContainerNode);
        var $emailSuccessMessage = $('.site-footer-email-signup__success-message', $emailContainerNode);
        var $emailError = $('.js-email-signup__error', $emailContainerNode);
        var $emailInput = $('input[name="PC_EMAIL_ADDRESS"]', $emailContainerNode);
        var $mobileNumberInput = $('input[name="MOBILE_PHONE"]', $emailContainerNode);
        var $termsAndConditions = $('.js-terms-conditions', $emailContainerNode);
        var $pcEmailPromotion = $('.js-email-terms-conditions', $emailContainerNode);
        var $smsPromotion = $('.js-sms-terms-conditions', $emailContainerNode);
        var $errorEmailSignupWrapper = $('.js-site-footer-email-signup__error--email', $emailContainerNode);
        var $errorEmailSignupTermsWrapper = $('.js-email-signup__error--terms', $emailContainerNode);
        var $errorSmsSignupTermsWrapper = $('.js-email-signup__error--smsterms', $emailContainerNode);
        var $errorMessagesEmailSignup = $('ul.js-email-signup-errors', $emailContainerNode);
        var $errorMessagesTerms = $('ul.js-email-terms-errors', $emailContainerNode);
        var $errorMessagesSmsTerms = $('ul.js-sms-terms-errors', $emailContainerNode);
        var $errorSmsWrapper = $('.js-email-signup__error--sms', $emailContainerNode);
        var $errorMessagesSms = $('ul.js-email-sms-errors', $emailContainerNode);
        var $footerSignUp = $emailContainerNode.parents('.js-sitewide-footer-formatter-signup');
        var $footerSignUpText = $footerSignUp.find('.js-site-footer-signup-text');

        // Show terms + conditions
        $emailInput.on('focus', function () {
          $termsAndConditions.slideDown(300);
        });

        // hide terms + conditions when clicked outside
        $(document).once('click', function (hideEvt) {
          if (!$(hideEvt.target).closest($emailForm).length && !$(hideEvt.target).is($emailForm)) {
            if ($termsAndConditions.is(':visible')) {
              $termsAndConditions.slideUp(300);
            }
          }
        });

        $emailForm.once('js-site-footer-email-signup').submit(function (submitEvt) {
          submitEvt.preventDefault();
          $emailSuccess.addClass('hidden');
          $emailError.addClass('hidden');
          $emailInput.removeClass('error');
          $mobileNumberInput.removeClass('error');

          // Transform string into array of form elements
          var params = {};

          $.each($emailForm.serializeArray(), function (index, kv) {
            params[kv.name] = kv.value.replace('undefined', '').replace('%40', '@');
          });

          // handle the sms_promotions checkbox - if its checked its being read as 'on' when serialized
          // we need a boolean value
          if ($smsContent.find('input[name="SMS_PROMOTIONS"]').prop('checked')) {
            params.SMS_PROMOTIONS = 1;
          }

          // Send the data via a json rpc call
          generic.jsonrpc.fetch({
            method: 'rpc.form',
            params: [params],
            onSuccess: function () {
              $emailContent.addClass('hidden');
              $gdprLink.addClass('hidden');
              $smsContent.addClass('hidden');
              $emailSuccess.html($emailSuccessMessage.val());
              $emailSuccess.removeClass('hidden');
              $termsAndConditions.addClass('hidden');
              $pcEmailPromotion.addClass('hidden');
              $smsPromotion.addClass('hidden');
              $footerSignUpText.addClass('hidden');
            },
            onFailure: function (result) {
              var errorObjectsArray = result.getMessages();

              $emailContent.removeClass('error');
              $smsContent.removeClass('error');
              $termsCheckbox.removeClass('site-footer-email-signup__error');
              $smsTermsCheckbox.removeClass('site-footer-email-signup__error');
              $errorEmailSignupWrapper.addClass('hidden');
              $errorEmailSignupTermsWrapper.addClass('hidden');
              $errorSmsSignupTermsWrapper.addClass('hidden');
              $errorSmsWrapper.addClass('hidden');
              $errorMessagesEmailSignup.html('');
              $errorMessagesTerms.html('');
              $errorMessagesSmsTerms.html('');
              for (var i = 0; i < errorObjectsArray.length; i++) {
                var myErr = errorObjectsArray[i];

                if (myErr && myErr.key) {
                  if (
                    myErr.key === 'required.pc_email_address.email_signup' ||
                    myErr.key === 'invalid.pc_email_address.email_signup' ||
                    myErr.key === 'required_or.pc_email_promotions.sms_promotions.required_or.email_signup'
                  ) {
                    $emailContent.addClass('error');
                    $errorEmailSignupWrapper.removeClass('hidden');
                    $errorMessagesEmailSignup.append('<li>' + myErr.text + '</li>');
                  }
                  if (
                    myErr.key === 'required.pc_email_promotions.email_signup'
                  ) {
                    $termsCheckbox.addClass('site-footer-email-signup__error');
                    $errorEmailSignupTermsWrapper.removeClass('hidden');
                    $errorMessagesTerms.append('<li>' + myErr.text + '</li>');
                  }
                  if (
                    myErr.key === 'required_dependency.sms_promotions.mobile_phone.dependency.sms' ||
                    myErr.key === 'required_dependency.sms_promotions.mobile_number.dependency.sms' ||
                    myErr.key === 'invalid.mobile_phone.sms' ||
                    myErr.key === 'format.mobile_phone.email_signup'
                  ) {
                    $smsContent.addClass('error');
                    $errorSmsWrapper.removeClass('hidden');
                    $errorMessagesSms.html(myErr.text);
                  }
                  if (
                    myErr.key === 'required_dependency.mobile_number.sms_promotions.dependency.sms' ||
                    myErr.key === 'required_dependency.mobile_phone.sms_promotions.dependency.sms'
                  ) {
                    $smsTermsCheckbox.addClass('site-footer-email-signup__error');
                    $errorSmsSignupTermsWrapper.removeClass('hidden');
                    $errorMessagesSmsTerms.append('<li>' + myErr.text + '</li>');
                  }
                }
              }
            }
          });
        });
      });
    }
  };
})(jQuery);
