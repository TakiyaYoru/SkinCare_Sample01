Drupal.behaviors.gnavHeaderBlockV1 = (function ($) {
  var $html = $();
  var $body = $();
  var $template = $();
  var $overlay = $();
  var $gnavHamburger = $();
  var $gnavMainSectionWrapper = $();
  var $gnavMobileSectionsMenu = $();
  var $gnavMainSection = $();
  var $gnavMainSectionContent = $();
  var $gnavMainSectionTrigger = $();
  var $searchOverlay = $();
  var $allSectionGroups = $();
  var $allSectionGroupContent = $();
  var $gnavHeaderBagCounter = $();
  var $gnavHeaderWishlistCounter = $();
  var $allGroupSections = $();
  var $gnavAccountSignin = $();
  var $headerOfferBanner = $();
  var aiTooltipStorageKey = 'aiScentAdvisorTooltipDismissed';
  // Calculate desktop for mobile menu stuff.
  var bps = Unison.fetch.all();
  var bp = Unison.fetch.now();
  var isDesktop = parseInt(bp.width, 10) >= parseInt(bps.landscape, 10);
  var position = $(window).scrollTop();
  var overlayDismissTimeout;
  var behavior = {
    attached: false,
    attach: function (context) {
      var hasIAM = Drupal?.settings?.iam_signin;
      if (this.attached) {
        return;
      }
      this.attached = true;
      $html = $('html');
      $body = $('body');
      $template = $('.js-gnav-header-block-v1', context);
      $overlay = $('.js-gnav-header-overlay', context);
      $gnavHamburger = $('.js-gnav-header-block__menu-icon', $template);
      $gnavMainSectionWrapper = $('.js-gnav-header-sections', $template);
      $gnavMobileSectionsMenu = $(
        '.js-gnav-header-sections__mobile-menu-header',
        $gnavMainSectionWrapper
      );
      $gnavMainSection = $('.js-gnav-header-sections__section', $gnavMainSectionWrapper);
      $gnavMainSectionContent = $(
        '.js-gnav-header-sections__section-content',
        $gnavMainSectionWrapper
      );
      $gnavMainSectionTrigger = $body.find(
        '.js-gnav-header-sections__section-label',
        $gnavMainSectionWrapper
      );
      // @todo SDSEARCH-2965 - replace with event triggered from React side for Search GNAV manipulation instead of accessing component directly (such as auto-close)
      $searchOverlay = $('.js-sd-search-gnav-input-field', context);
      // These elements are in gnav_section_formatter_v1, we collapse them too when gnav is closed.
      $allSectionGroups = $body.find('.js-gnav-section-formatter');
      $allSectionGroupContent = $body.find('.js-gnav-section-formatter__content-wrapper');
      $allGroupSections = $body.find('.gnav-section-group__section');
      $gnavHeaderBagCounter = $('.js-gnav-header-sections__links-link-bag-counter', $template);
      $gnavHeaderWishlistCounter = $(
        '.js-gnav-header-sections__links-link-wishlist-counter',
        $template
      );
      $gnavAccountSignin = $('.js-gnav-header-sections__links-link-account', $template);
      $headerOfferBanner = $('.js-header-offers-banner-formatter-v1', $template);
      if ($.cookie('hide_header_offer_banner')) {
        $template.toggleClass('header-offers-banner-hidden', true);
      }

      // Unset the offer banner styles
      if ($headerOfferBanner.length === 0 || !$headerOfferBanner.is(':visible')) {
        $body.addClass('gnav-offers-hidden');
      }

      // Subnav updates using js only.
      if (isDesktop) {
        $gnavMainSectionWrapper.attr('aria-expanded', 'true');
      }
      /* global generic */
      if (hasIAM) {
        generic.jsonrpc.fetch({
          method: 'vulcan.getConfig',
          params: [{ section: 'iam' }],
          onBoth: function (jsonRpcResponse) {
            var iamData = jsonRpcResponse.getValue();

            if (iamData?.enabled) {
              var redirectUrl = iamData.redirect_url;

              $gnavAccountSignin.attr('href', redirectUrl);
            }
          }
        });
      }

      // close the nav.
      function closeGnav(keepActive) {
        $gnavMainSection.attr('aria-expanded', 'false').removeClass('gnav-mobile-group-active');
        $gnavMainSectionContent.attr('aria-hidden', 'true');
        $allSectionGroups.attr('aria-expanded', 'false');
        $allSectionGroupContent.attr('aria-hidden', 'true');
        if (!keepActive) {
          $html.removeClass('active-gnav');
        }
        $gnavMainSectionWrapper.attr('aria-expanded', 'true').removeClass('section-expanded');
        $gnavMainSectionTrigger.removeClass('gnav-mobile-group-label-active').blur();
        if (!isDesktop) {
          $gnavMainSectionWrapper
            .attr('aria-expanded', 'false')
            .addClass('gnav-header-sections__section--mobile-hidden');
          $allGroupSections.removeClass('mobile-expanded--true mobile-expanded--false');
        }
      }

      $overlay.on('touchend mouseover', function (e) {
        e.preventDefault();
        clearTimeout(overlayDismissTimeout);
        overlayDismissTimeout = setTimeout(function () {
          closeGnav();
        }, 200);
      });

      $overlay.on('mouseout', function () {
        clearTimeout(overlayDismissTimeout);
      });

      $html.off('keydown').on(
        'keydown',
        _.throttle(function (e) {
          if (e.key === 'Escape') {
            closeGnav();
          }
        }, 300)
      );

      var _updateNavStatus = function () {
        var scroll = $(window).scrollTop();

        // If the user scroll down, hide the Nav
        if (scroll <= position) {
          $body.not('.search-overlay-displayed').toggleClass('gnav-header-block--hidden', false);
        } else {
          $body.not('.search-overlay-displayed').toggleClass('gnav-header-block--hidden', true);
          $template.toggleClass('gnav-header-block--sticky', true);
          $body.toggleClass('gnav-header-block--sticky', true);
        }

        if (scroll === 0) {
          $template.toggleClass('gnav-header-block--sticky', false);
          $body.toggleClass('gnav-header-block--sticky', false);
        }

        position = scroll;
      };

      $(window)
        .off('scroll.gnavHeaderBlock')
        .on('scroll.gnavHeaderBlock', _.throttle(_updateNavStatus, 300));
      _updateNavStatus();

      gnavHeaderTrigger();

      Unison.on('change', function () {
        bp = Unison.fetch.now();
        isDesktop = parseInt(bp.width, 10) >= parseInt(bps.landscape, 10);
        closeGnav();
        gnavHeaderTrigger();
      });

      function gnavHeaderTrigger() {
        var timeout;
        // Calculate desktop for mobile menu stuff.
        if (isDesktop) {
          $gnavMainSectionTrigger
            .off('click touchstart focus')
            .on('click touchstart focus', function (e) {
              var $self = $(this);

              gnavPcTrigger($self, e);
            })
            .off('mouseover')
            .on('mouseover', function (e) {
              var $self = $(this);

              // Delay the opening of the Gnav menu.
              timeout = setTimeout(function () {
                gnavPcTrigger($self, e);
              }, 200);
            });
        } else {
          $gnavMainSectionTrigger.off('mouseover click touchstart').on('click', function (e) {
            var $self = $(this);

            gnavMobileTrigger($self, e);
          });
        }
        $gnavMainSectionTrigger.off('mouseleave').on('mouseleave', function () {
          clearTimeout(timeout);
        });
      }

      function gnavPcTrigger($self, e) {
        var $parent = $self.parent();
        var $content = $parent.find('.js-gnav-header-sections__section-content');
        var $subNav = $content.find('.js-gnav-section-formatter__link--trigger').first();
        var $subNavParent = $subNav.parent();
        var $subNavcontent = $subNav.next('.js-gnav-section-formatter__content-wrapper');
        if (e.type === 'focus') {
          e.preventDefault();
        }
        closeGnav(true);
        $html.addClass('active-gnav');

        if ($parent.attr('aria-expanded') === 'true') {
          return;
        }

        $parent.attr('aria-expanded', 'true');
        $content.attr('aria-hidden', 'false');
        $gnavMainSectionWrapper
          .attr('aria-expanded', 'true')
          .addClass('section-expanded')
          .removeClass('gnav-header-sections__section--mobile-hidden');
        $subNavParent.attr('aria-expanded', true);
        $subNavcontent.attr('aria-hidden', false);
      }

      function gnavMobileTrigger($self, e) {
        var $parent = $self.parent();
        var $content = $parent.find('.js-gnav-header-sections__section-content');
        var $groupSection = $parent.find('.gnav-section-group__section'); // one per group under $group
        var $section = $parent.closest('.js-gnav-header-sections__section');
        var $subParent = $parent.find('.js-gnav-section-formatter');
        var $subContent = $subParent.find('.js-gnav-section-formatter__content-wrapper');
        var $subGroup = $self.closest('.js-gnav-header-sections__section');
        var $subGgroupSection = $self.closest('.gnav-section-group__section');
        var $subGroupLabel = $('.js-gnav-header-sections__section-label', $subGroup);
        var expanded = $parent.attr('aria-expanded') === 'false' ? false : true;
        var subExpanded = $section.attr('aria-expanded') === 'false' ? false : true;

        e.preventDefault();
        closeGnav();
        $html.addClass('active-gnav');
        $gnavMainSectionWrapper
          .attr('aria-expanded', 'true')
          .addClass('section-expanded')
          .removeClass('gnav-header-sections__section--mobile-hidden');
        // When a group only has one section we process the triggers here
        // When multi-group we add a class and process in gnav_section_formatter_v1.js
        if ($groupSection.length === 1) {
          $section.addClass('gnav-sections-mobile-single');
          $parent.attr('aria-expanded', !expanded);
          $content.attr('aria-hidden', expanded);
          // expand single section
          $subParent.attr('aria-expanded', !subExpanded);
          $subContent.attr('aria-hidden', subExpanded);
          $subGroup.addClass('gnav-mobile-group-active');
          $subGgroupSection.addClass('mobile-expanded--' + subExpanded);
          $subGroupLabel.addClass('gnav-mobile-group-label-active');
        } else {
          $section.addClass('gnav-sections-mobile-multi');
          $parent.attr('aria-expanded', 'true');
          $content.attr('aria-hidden', 'false');
        }
      }

      $gnavHamburger.once().on('click', function (e) {
        e.preventDefault();
        $html.addClass('active-gnav');
        $gnavMainSectionWrapper
          .attr('aria-expanded', 'true')
          .removeClass('gnav-header-sections__section--mobile-hidden');
      });

      // Mobile only icon takes user back to main gnav sections display and collapses all open sections
      $gnavMobileSectionsMenu.once().on('click', function (e) {
        e.preventDefault();
        $gnavMainSectionWrapper.removeClass('section-expanded');
        $gnavMainSection
          .attr('aria-expanded', 'false')
          .removeClass('gnav-mobile-group-active')
          .find('.js-gnav-header-sections__section-label')
          .removeClass('gnav-mobile-group-label-active');
        $gnavMainSectionContent.attr('aria-hidden', 'true');
        $allSectionGroups.attr('aria-expanded', 'false');
        $allSectionGroupContent.attr('aria-hidden', 'true');
      });

      // Close gnav to prevent navigation overlapping
      $searchOverlay.on('click mouseenter', '.js-gnav-search-button', function () {
        var $activeGnav = $('.active-gnav', context);

        if ($activeGnav.length) {
          closeGnav(true);
        }
      });

      $template.on('click', '.js-gnav-search-button', function () {
        // Return if already Gnav active or Desktop
        if (
          $gnavMainSectionWrapper.hasClass('section-expanded') ||
          $body.hasClass('gnav-header-block--sticky')
        ) {
          return;
        }
        // Active Gnav
        if (isDesktop) {
          $html.toggleClass('active-gnav');
        }
      });

      $template.on('click', '.js-search-close-icon-wrapper', function () {
        if (!$gnavMainSectionWrapper.hasClass('section-expanded')) {
          $html.removeClass('active-gnav');
        }
      });

      // Close Nav dropdown when moving the mouse out or clicking outside of it:
      $html.on('click mouseout mouseover focusout', function (event) {
        if (
          isDesktop &&
          $html.hasClass('active-gnav') &&
          ((event.type === 'mouseout' && !event.relatedTarget) ||
            (event.type === 'focusout' && !event.relatedTarget) ||
            !$(event.target).parents('.gnav-header-block__header').length)
        ) {
          closeGnav();
        }
      });

      $html.off('keydown').on(
        'keydown',
        _.throttle(function (event) {
          if (event.key === 'Escape') {
            closeGnav();
          }
        }, 300)
      );

      $(document).on('hide_header_offer_banner', function () {
        $template.toggleClass('header-offers-banner-hidden', true);
      });

      $(document).on('update_gnav_header_wishlist_counter', function (e, item_count) {
        $gnavHeaderWishlistCounter.text(item_count);
      });

      $(document).on('update_gnav_header_cart_counter', function (e, item_count) {
        $gnavHeaderBagCounter.text(item_count);
      });

      const headerLogo = $('.js-gnav-header-block__logo');
      const urlPathParts = window.location.pathname.split('/');

      if (urlPathParts.includes('fr')) {
        headerLogo.attr('href', '/fr');
      }

      // AI Scent Advisor Tooltip Logic
      if (Drupal.settings.common.ai_scent_advisor_show_header_tooltip) {
        initAiScentAdvisorTooltip();
      }

      function initAiScentAdvisorTooltip() {
        var $aiTooltips = $template.find('.js-ai-scent-advisor-tooltip');
        var wasDismissed = getAiTooltipSessionFlag();
        var shouldShowTooltip = window.location.pathname !== '/ai-scent-advisor';

        if ($aiTooltips.length && !wasDismissed && shouldShowTooltip) {
          $aiTooltips.removeClass('hidden');
          bindAiTooltipDismissal($aiTooltips);
        }

        setAiTooltipSessionFlag();
      }

      function bindAiTooltipDismissal($aiTooltips) {
        var namespace = '.aiScentAdvisorTooltip';
        var docEvents = `click${namespace} focusin${namespace}`;
        var keyEvent = `keyup${namespace}`;

        var handleDocumentInteraction = function (e) {
          var $target = $(e.target);
          var isTooltip = $target.closest('.js-ai-scent-advisor-tooltip').length;
          var isTrigger = $target.closest('.gnav-header-block__ai-scent-advisor a').length;
          var isCookieOverlay = $target.closest(
            '.onetrust-consent-sdk, #onetrust-consent-sdk, #onetrust-banner-sdk, #onetrust-pc-sdk, .ot-pc-dark-filter, .onetrust-pc-dark-filter'
          ).length;
          var isEmailOverlay = $target.closest('.ab-iam-root').length;

          if (isTooltip || isTrigger || isCookieOverlay || isEmailOverlay) {
            return;
          }

          hideTooltip();
        };

        var handleKeyUp = function (e) {
          if (e.key === 'Escape' || e.key === 'Esc') {
            hideTooltip();
          }
        };

        var hideTooltip = function () {
          $aiTooltips.addClass('hidden');
          $(document).off(docEvents, handleDocumentInteraction);
          $html.off(keyEvent, handleKeyUp);
        };

        $(document).on(docEvents, handleDocumentInteraction);
        $html.on(keyEvent, handleKeyUp);
      }

      function getAiTooltipSessionFlag() {
        try {
          return (
            window.sessionStorage && window.sessionStorage.getItem(aiTooltipStorageKey) === 'true'
          );
        } catch (error) {
          return false;
        }
      }

      function setAiTooltipSessionFlag() {
        try {
          if (window.sessionStorage) {
            window.sessionStorage.setItem(aiTooltipStorageKey, 'true');
          }
        } catch (error) {
          // sessionStorage unavailable; fail silently.
        }
      }
    }
  };

  return behavior;
})(jQuery);
