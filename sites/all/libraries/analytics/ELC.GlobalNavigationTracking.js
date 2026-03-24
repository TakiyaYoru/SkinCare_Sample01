// Gobal Navigation Tracking - Analytics.
(function (site, $) {
  Drupal.behaviors.analyticsGlobalNavBehavior = {
    attach: function (context) {
      function triggerEvent(promoName) {
        if (site && site.track && typeof promoName !== 'undefined' && promoName !== '') {
          site.track.navigationClick({
            promo_name: [promoName]
          });
        }
      }

      function mainCategoryLinkClick(targetElem, event) {
        var hrefElement = targetElem.attr('href');

        if (event.isTrigger
          || (targetElem.attr('aria-expanded') && !hrefElement)
          || (targetElem.attr('aria-expanded') && hrefElement && hrefElement === '#')) {
          return;
        }

        if (hrefElement && hrefElement !== '#') {
          triggerEvent(targetElem.attr('title') || (targetElem.text() || '').trim());
        }
      }

      function triggerImageToutClick(targetElem) {
        var promoName = [];
        var navElemLast = targetElem.text();
        var imageSubLine = targetElem.find('.js-track-image-tout-subline');
        var activeNavCatName = targetElem.closest('.node').find('.active-links-group').find('.js-track-sub-category-name');
        var navTrackName = targetElem.closest('.node').attr('trackname');

        if (typeof navTrackName !== 'undefined' && navTrackName.length > 0) {
          navTrackName = navTrackName.split('|', 1);
          var promoTrackName = navTrackName[0].split(/[:|-]/g);

          if (navTrackName[0].startsWith('Site Header - Desktop') && promoTrackName.length > 0) {
            $.each(promoTrackName.splice(2), function (i, val) {
              promoName.push((val || '').trim());
            });
          } else if (promoTrackName.length > 0) {
            $.each(promoTrackName.splice(1), function (i, val) {
              promoName.push((val || '').trim());
            });
          }
        }

        if (activeNavCatName.length > 0 && activeNavCatName.text() && !targetElem.hasClass('js-track-sub-category-name')) {
          promoName.push((activeNavCatName.text() || '').trim());
        }

        if (imageSubLine.length > 0 && imageSubLine.text()) {
          promoName.push((imageSubLine.text() || '').trim());
        } else if (targetElem.attr('data-clickable')) {
          var clickedLink = targetElem.attr('data-clickable').split('/');

          promoName.push(clickedLink[clickedLink.length - 1]);
        } else if (typeof navElemLast !== 'undefined' && (navElemLast || '').trim() !== '') {
          promoName.push((navElemLast || '').trim());
        }

        triggerEvent(promoName.join('>'));
      }

      function triggerSubCategoryLink(targetElem) {
        var promoName = [];
        var hrefElement = targetElem.attr('href');

        if (targetElem.hasClass('js-track-sub-category-name') && (!hrefElement || (hrefElement && hrefElement === '#'))) {
          return;
        }

        var navElemLast = targetElem.text();
        var navTrackName = targetElem.closest('.node').attr('trackname');
        var subcategoryName = targetElem.closest('.js-track-gnav-content').find('.js-track-sub-category-name:first');
        var activeNavCatName = targetElem.closest('.node').find('.active-links-group').find('.js-track-sub-category-name');

        if (typeof navTrackName !== 'undefined' && navTrackName.length > 0) {
          navTrackName = navTrackName.split('|', 1);
          var promoTrackName = navTrackName[0].split(/[:|-]/g);

          if (navTrackName[0].startsWith('Site Header - Desktop') && promoTrackName.length > 0 && subcategoryName.length === 0) {
            $.each(promoTrackName.splice(2), function (i, val) {
              promoName.push((val || '').trim());
            });
          } else if (promoTrackName.length > 0 && subcategoryName.length === 0) {
            $.each(promoTrackName.splice(1), function (i, val) {
              promoName.push((val || '').trim());
            });
          } else if (promoTrackName.length > 1) {
            promoName.push(promoTrackName[1].trim());
          }
        }

        if (!targetElem.hasClass('js-track-sub-category-name')) {
          if (subcategoryName.length > 0 && subcategoryName.text()) {
            promoName.push((subcategoryName.text() || '').trim());
          } else if (activeNavCatName.length > 0 && activeNavCatName.text()) {
            promoName.push((activeNavCatName.text() || '').trim());
          }
        }

        navElemLast !== '' ? promoName.push((navElemLast || '').trim()) : '';

        triggerEvent(promoName.join('>'));
      }

      $(document).ready(function () {
        $('.js-track-main-category-link', context).on('click', function (event) {
          mainCategoryLinkClick($(this), event);
        });
      });

      // Trigger event for sub menu appears on hover - SBX architecture
      if ($('body').hasClass('device-pc')) {
        $(document).on('click', '.js-track-menu-item .js-track-sub-category-link', function () {
          triggerSubCategoryLink($(this));
        });

        $(document).on('click', '.js-track-menu-ref-title .js-track-sub-category-name', function () {
          triggerSubCategoryLink($(this));
        });
      }

      $('.js-track-sub-category-link, .js-track-sub-category-name').on('click', function () {
        if ($('body').hasClass('device-pc')
        && ($(this).closest('.js-track-menu-item').length > 0
        || $(this).closest('.js-track-menu-ref-title').length > 0)) {
          return;
        }
        triggerSubCategoryLink($(this));
      });

      $(document).on('click', '.js-track-image-tout.js-track-gnav-image-click', function () {
        triggerImageToutClick($(this));
      });

      $('.js-track-image-tout').on('click', function () {
        if ($(this).hasClass('js-track-gnav-image-click')) {
          return;
        }
        triggerImageToutClick($(this));
      });
    }
  };
}(window.site || {}, jQuery));
