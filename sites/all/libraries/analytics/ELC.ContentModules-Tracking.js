// Track click event of content modules - Analytics.
(function (site, $) {
  Drupal.behaviors.analyticsContentBehavior = {
    attach: function (context) {
      function triggerEvent(eventName, eventAction, enhAction, promoName, promoType, promoId, promoDestination, eventInteraction) {
        var elemObj = {
          event_name: eventName,
          enh_action: enhAction,
          event_category: 'ecommerce',
          event_action: eventAction,
          event_label: 'banner click | ' + promoName,
          promo_pos: ['module'],
          promo_creative: promoType,
          promo_name: promoName,
          promo_id: promoId
        };

        if (promoDestination && promoDestination !== '') {
          elemObj.promo_destination = promoDestination;
        }

        if (eventInteraction) {
          elemObj.event_noninteraction = eventInteraction;
        }

        site.track.evtLink(elemObj);
      }

      $('.js-analytics-tag-content-module').once('js-contentmodule-analytics').on('click', function (event) {
        /* Exclude tagging while clicking on Non-Clickable Area
        Include content module tagging when user clicks anywhere on the clickable block including text click
        Include tagging when user clicks on Images and navigable text in a banner
        Include tagging on olapic Image clicks
        Include tagging on Video content clicks
        */
        var promoId = [];
        var promoName = [];
        var promoType = [];
        var promoDestination = [];
        var faqContent = Drupal.settings.analytics ? Drupal.settings.analytics.content_module_faq : false;
        var footerContent = Drupal.settings.analytics ? Drupal.settings.analytics.footer_content_module_tracking : false;
        var targetElem = event.target;
        var targetSelectorArray = [
          '[data-clickable]',
          '[data-href]',
          '[data-url]',
          '[data-click-url]',
          '[data-setup]',
          '[data-youtube-id]',
          '[data-lp-event]',
          '[data-video-provider]',
          '[data-video-element-controller]',
          '[href]'
        ];
        var selectedtargetElem = $(targetElem).closest(targetSelectorArray.join(', '));

        if (!$(targetElem).attr('href')
          && selectedtargetElem.length < 1
          && targetElem.tagName !== 'VIDEO'
          && targetElem.tagName !== 'svg'
          && targetElem.tagName !== 'use'
          && targetElem.tagName !== 'IMG'
          && targetElem.tagName !== 'P'
          && (!faqContent)) {
          return;
        }
        var $nodeElem = $(this);
        var contentName = $nodeElem.closest('.js-analytics-content-block').attr('trackname');

        $.each(targetSelectorArray, function (i, element) {
          var matchedElemHref = $(selectedtargetElem[0]).attr(element.replace(/\[|\]/g, ''));

          if (!!matchedElemHref) {
            promoDestination.push(matchedElemHref);

            return false;
          }
        });
        var processedElem = $nodeElem.find('[data-analytics-content="triggered"]');

        if (!contentName
          || processedElem.length > 0
          || $(targetElem).closest('.js-analytics-popover-signup-link').length > 0
          || (typeof contentName !== 'undefined' && (contentName.toLowerCase().startsWith('gnav')
          || contentName.toLowerCase().startsWith('navigation')))) {
          return;
        }
        var trackName = contentName.split('|');
        var clickedLinkText = targetElem.text || targetElem.innerText || ' ';
        // Updating clicked link text while user clicked on multilines text of a block
        var multiLineText = clickedLinkText.split('\n');

        $.each(multiLineText, function (i, val) {
          var currentText = val;

          if (!!currentText && currentText.trim() !== '' && currentText.trim() !== '&nbsp;') {
            currentText = currentText.trim();
            clickedLinkText = currentText.length > 50 ? currentText.split('\.')[0] : currentText;

            return false;
          }
        });
        if (!!trackName && trackName.length > 1) {
          var promotionName = trackName[0];

          if ((promotionName.includes('Footer') || promotionName.includes('Help Topics') || promotionName.includes('Sheer id section') || promotionName.includes('Site Logo') || promotionName.includes('Whats New')) && (!footerContent)) {
            return;
          }
          clickedLinkText = clickedLinkText.trim();
          if (!!clickedLinkText) {
            promotionName = promotionName + ' | ' + clickedLinkText;
          }
          var promotionType = trackName[1];

          promoName.push(promotionName);
          promoType.push(promotionType);
          promoId.push('module - ' + promotionType + ' - ' + promotionName);
          triggerEvent('content_module_click', 'promotion click', 'promo_click', promoName, promoType, promoId, promoDestination, false);
          $nodeElem.attr('data-analytics-content', 'triggered');
        }
      });

      // MTA-3309 Trigger event when welcome offer pop up displays. Custom event will be triggered when colorbox opens.
      $(document).on('welcome_overlay_displayed', function (event, data) {
        var promoId = [];
        var promoName = [];
        var promoType = [];
        var templateName;

        if (data && data.template_name) {
          templateName = data.template_name;
        } else {
          var trackName = $(event.target).find('#nav_overlay_1 .js-analytics-content-block:first, .site-header__nav .js-analytics-content-block:first, .utility-nav .js-analytics-content-block:first').attr('trackname').split('|');

          templateName = trackName.length > 1 ? trackName[1] : '';
        }
        if (templateName && templateName !== '') {
          promoName.push('welcome offer');
          promoType.push(templateName);
          promoId.push('module - ' + templateName + ' - welcome offer');
          triggerEvent('content_module_impression', 'promotion view', 'promo_impression', promoName, promoType, promoId, '', true);
        }
      });

      // MTA-3309  - Trigger event while Link click happens inside the welcome offer pop up
      $(document).on('click', '.js-analytics-popover-signup-link a', function (event) {
        var promoId = [];
        var promoName = [];
        var promoType = [];
        var targetElem = event.target;
        var clickedLinkText = targetElem.text || targetElem.innerText || '';

        if (clickedLinkText && clickedLinkText !== '') {
          promoName.push('welcome offer');
          promoType.push(clickedLinkText);
          promoId.push('module - ' + clickedLinkText + ' - welcome offer');
          triggerEvent('content_module_click', 'promotion click', 'promo_click', promoName, promoType, promoId, '', false);
        }
      });

      // MTA-9397 - HomePage module tracking.
      $('.js-tab-content .js-basic-tout-image img, .js-tab-content .js-basic-tout-text-inner a').once('js-contentmodule-analytics').on('click', function (event) {
        var promoId = [];
        var promoName = [];
        var promoType = [];
        var $nodeElem = $(this);
        var targetElem = event.target;
        var bannerClickedText = $nodeElem.closest('.js-basic-tout').find('.js-basic-tout-text-inner a').text().trim();
        var clickedLinkText = targetElem.text || targetElem.innerText || bannerClickedText || '';
        var contentName = $nodeElem.closest('.js-analytics-content-block').attr('trackname');
        var trackName = contentName.split('|');
        var promomationType = trackName[1];
        var promotionName = trackName[0];

        clickedLinkText = clickedLinkText.trim();
        if (!!clickedLinkText) {
          promotionName = promotionName + ' | ' + clickedLinkText;
        }

        if (promotionName && promotionName !== '') {
          promoName.push(promotionName);
          promoType.push(promomationType);
          promoId.push('module - ' + promomationType + promotionName);
          triggerEvent('content_module_click', 'promotion click', 'promo_click', promoName, promoType, promoId, '', false);
        }
      });
    }
  };
}(window.site || {}, jQuery));
