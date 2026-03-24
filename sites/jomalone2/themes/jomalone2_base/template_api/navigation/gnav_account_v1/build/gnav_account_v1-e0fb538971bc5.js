var site = site || {};
var generic = generic || {};

site.userInfoCookie = site.userInfoCookie || {};
site.userInfoCookie.getValue =
  site.userInfoCookie.getValue ||
  function () {
    return '';
  };
(function ($) {
  Drupal.behaviors.gnavAccountV1 = {
    attach: function (context) {
      var $template = $('.js-gnav-account', context);
      var $accountContent = $('.js-gnav-account__content', $template);
      var $blocks = $('.js-gnav-account-content-container', context);
      var $body = $('body');
      var $headerMain = $('.site-header__content', context);
      var $formContainer = $('.gnav-account__content-container-forms', $blocks);
      var $gnavHeaderDarkOverlay = $('<div class="site-gnav-header-dark-overlay"></div>');
      var bps = Unison.fetch.all();
      var bp = Unison.fetch.now();
      var isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);
      var $cpf = $('.js-gnav-account__content--cpf', context);
      var $signinEmailAddressNode = $blocks.find('.js-login-email', context);
      var $passwordResetEmailNode = $('.js-password_reset_send__overlay_EMAIL_ADDRESS', context);
      var $forgotPasswordLink = $('.js-forgot-password', context);
      var $errors = $('.js-error-messages', context);
      var $passwordResetForm = $('.js-sign-in-page__overlay_password_reset_send form', context);
      var hash = generic.Hash();
      var param;
      var emailAddress;
      var hasIAM = Drupal.settings && Drupal.settings.iam_signin;
      var bindGnavAccountEvent = function () {
        $template.hover(
          function (e) {
            e.preventDefault();
            if ($accountContent.hasClass('hidden')) {
              if (!isMobile) {
                $(document).trigger('loadFacebookScript');
                $accountContent.removeClass('hidden');
                displayGnavHeaderDarkOverlay();
                setOverlayHeight();
              }
            }
          },
          function (e) {
            // Avoid mouseout on select input suggestion
            // Avoid mouseout on hover input field(Firefox)
            if (e.relatedTarget === null || e.relatedTarget.nodeName.toLowerCase() === 'input') {
              return;
            }
            if (!$accountContent.hasClass('hidden')) {
              $accountContent.addClass('hidden');
              removeGnavHeaderDarkOverlay();
            }
          }
        );
      };

      if (hasIAM) {
        generic.jsonrpc.fetch({
          method: 'vulcan.getConfig',
          params: [{ section: 'iam' }],
          onBoth: function (jsonRpcResponse) {
            var iamData = jsonRpcResponse.getValue();

            if (iamData?.enabled) {
              $template.removeClass('gnav-account');
              var redirect_url = iamData.redirect_url;
              $template.find('a').attr('href', redirect_url);
            } else {
              bindGnavAccountEvent();
            }
          }
        });
      } else {
        bindGnavAccountEvent();
      }

      if (parseInt(site.userInfoCookie.getValue('signed_in')) === 0) {
        $blocks.removeClass('is_signed_in');
      } else if (parseInt(site.userInfoCookie.getValue('signed_in')) === 1) {
        $blocks.addClass('is_signed_in');
      }

      $blocks.each(function () {
        var $block = $(this);
        var $toggleSigninTrigger = $('.js-gnav-account-content-container-toggle-signin', $block);
        var $toggleRegisterTrigger = $(
          '.js-gnav-account-content-container-toggle-register',
          $block
        );
        var $registerForm = $(
          '.js-gnav-account-content-container-forms-register-container-form',
          $block
        );
        var $signInForm = $(
          '.js-gnav-account-content-container-forms-signin-container-form',
          $block
        );
        var $regEmailAddressNode = $blocks.find('.js-register-email', $registerForm);

        $registerForm.once().on('submit', function () {
          var error = false;

          error = validateInputsRequired($(this));
          if (error) {
            event.preventDefault();
          }
        });

        $signInForm.once().on('submit', function () {
          var error = false;

          error = validateInputsRequired($(this));
          if (error) {
            event.preventDefault();
          }
        });

        $toggleSigninTrigger.once().on('click', function (event) {
          event.preventDefault();
          $block.removeClass('register-active');
          $block.addClass('signin-active');
          setOverlayHeight();
        });
        $toggleRegisterTrigger.once().on('click', function (event) {
          event.preventDefault();
          $block.removeClass('signin-active');
          $block.addClass('register-active');
          setOverlayHeight();
        });
      });

      function validateInputsRequired($element) {
        var error = false;
        var $errorsContainer;

        if ($element.length === 0) {
          return true;
        }

        $errorsContainer = $element.find('ul.js-error-messages');
        $errorsContainer.find('li').addClass('hidden');

        $element.find('input, select').each(function () {
          var $this = $(this);
          var $parent = $this.parent();
          var inputName;

          if ($this.hasClass('required')) {
            if (!$this.val() || ($this.attr('type') === 'checkbox' && !$this.prop('checked'))) {
              error = true;
              inputName = $this.attr('name').toLowerCase();
              $this.addClass('error');
              if ($parent && $parent.is('label')) {
                $parent.addClass('error');
              }
              $errorsContainer.find(`.js-${inputName}_required_message`).removeClass('hidden');
            } else {
              $this.removeClass('error');
              if ($parent && $parent.is('label')) {
                $parent.removeClass('error');
              }
            }
          }
        });

        return error;
      }

      function displayGnavHeaderDarkOverlay() {
        // Add gnav header overlay for DG pages
        if ($('.site-content', $body).length > 0 && !isMobile) {
          $gnavHeaderDarkOverlay.prependTo($('.site-content', $body));
        } else if ($('.pg_wrapper', $body).length > 0 && !isMobile) {
          // Add gnav header overlay for PG pages
          $gnavHeaderDarkOverlay.prependTo($('.pg_wrapper', $body));
        }
        $body.toggleClass('gnav-util-overlay-active', true);
      }

      function removeGnavHeaderDarkOverlay() {
        $body.toggleClass('gnav-util-overlay-active', false);
        $gnavHeaderDarkOverlay.remove();
      }

      function setOverlayHeight() {
        var siteHeaderHeight = $headerMain.outerHeight(true);
        var $siteHeaderSticky = $headerMain.find('.gnav-header-block--sticky');
        var accountHeaderHeight = $template
          .find('.gnav-account__content-container__toggle')
          .outerHeight(true);
        var overlayHeight;
        var formHeight;

        // If sticky nav is active then update the site header height
        if ($siteHeaderSticky.length > 0) {
          siteHeaderHeight = $headerMain.find('.gnav-header-block__inner').outerHeight(true);
        }
        overlayHeight = $(window).height() - siteHeaderHeight;
        formHeight = overlayHeight - accountHeaderHeight;
        // set height of entire overlay to window height, less gnav offset
        $accountContent.height('auto');
        $accountContent.css('max-height', overlayHeight);

        // set height and max-height for form content to scroll
        $formContainer.height('auto');
        $formContainer.css('max-height', formHeight);
      }

      Unison.on('change', function (bp) {
        isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);
      });

      $cpf.on('change', function (event) {
        event.preventDefault();
        $('.js-gnav-account__content .js-fed-doc-number').val($(this).val());
      });

      if ($passwordResetEmailNode.length === 1) {
        $signinEmailAddressNode.once().on('change', function () {
          $passwordResetEmailNode.val($(this).val());
        });
      }

      $forgotPasswordLink.on('click', function (e) {
        e.preventDefault();
        if ($passwordResetEmailNode.length === 1) {
          emailAddress = $signinEmailAddressNode.val();
          if (emailAddress.length < 1) {
            $errors.find('.js-password_error_message').removeClass('hidden');
            $errors.find('.js-password_reset_send_msg').addClass('hidden');

            return;
          }

          $passwordResetEmailNode.val(emailAddress);
          param = hash.queryToJson($passwordResetForm.serialize());
          Object.entries(param).forEach(([key, value]) => {
            param[key] = decodeURIComponent(value);
          });
          generic.jsonrpc.fetch({
            method: 'rpc.form',
            params: [param],
            onBoth: function (r) {
              var messages = r.getMessages();

              if (messages) {
                messages.forEach(function (message) {
                  if (message.key === 'request_sent') {
                    $errors.find('.js-password_reset_send_msg').removeClass('hidden');
                    $errors.find('.js-password_error_message').addClass('hidden');
                  } else {
                    $errors.find('.js-password_error_message').removeClass('hidden');
                    $errors.find('.js-password_reset_send_msg').addClass('hidden');
                  }
                });
              }
            }
          });
        }
      });
    }
  };
})(jQuery);
