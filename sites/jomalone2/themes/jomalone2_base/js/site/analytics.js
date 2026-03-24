(function (site, $) {
  /**
   * This file is only here to make ELC.AnalyticsConnector.js happy
   */

  Drupal.behaviors.analyticsBehavior = {
    attached: false,

    attach: function (context) {
      var self = this;
      var eventObj = {};

      if (self.attached) {
        return;
      }

      // Event track common function call start
      function trackEvent(eName, eCategory, eAction, elabel) {
        Object.assign(eventObj, {
          event_name: eName,
          event_category: eCategory,
          event_action: eAction,
          event_label: elabel
        });
        site.track.evtLink(eventObj);
        eventObj = {};
      }
      // Event track common function call end.

      // MTA-4024 - Emboss tagging and build a gift tagging - Starts
      if ($('body').hasClass('section-bespoke-gifting')) {
        $(document).on('bespoke:add_to_gift', function (event, data) {
          var productId;
          var skuBaseId = data.skuId;

          if (skuBaseId) {
            productId = $('.js-product-brief[data-sku-base-id="' + skuBaseId + '"]').attr('data-product-id');
          }
          eventObj.gift_id = data.collectionId;
          trackEvent('build a gift', 'build a gift', 'add to gift', (productId ? 'PROD' + productId.toString() : ''));
        });

        $(document).on('bespoke:remove_from_gift', function (event, data) {
          var productId;
          var skuBaseId = data.skuId;

          if (data.isEmbossingSku) {
            return;
          }

          if (skuBaseId) {
            productId = $('.js-product-brief[data-sku-base-id="' + skuBaseId + '"]').attr('data-product-id');
          }
          eventObj.gift_id = data.collectionId;
          trackEvent('build a gift', 'build a gift', 'remove from gift', (productId ? 'PROD' + productId.toString() : ''));
        });

        $(document).on('track:wrapReviewClick', function (event, data) {
          var productIds = [];
          var productImpressionList = [];
          var addProductIds = [];
          var addProductImpressionList = [];
          var giftId = data.collection.COLLECTION_ID;
          var skuBaseIds = data.skus;

          skuBaseIds.forEach(function (skuElem) {
            var productId = skuElem.PRODUCT_ID.toString();

            productIds.push(productId);
            productImpressionList.push(location.pathname + 'example');
          });
          eventObj.gift_id = giftId;
          trackEvent('build a gift', 'build a gift', 'wrap and review click', productIds);

          eventObj.product_impression_id = productIds;
          eventObj.product_impression_list = productImpressionList;
          eventObj.event_noninteraction = 'true';
          eventObj.gift_id = giftId;
          trackEvent('build a gift', 'build a gift', 'wrap and review', productIds.join(' | '));

          if ($('.js-bespoke-gifting-additional-products').is(':visible')) {
            var $targetElem = $('.js-bespoke-gifting-additional-products');
            var additionalProdElem = $targetElem.find('.js-product-brief');
            var carouselName = '';
            var carouselNodeElem = $targetElem.find('.js-analytics-content-block:first');

            if (carouselNodeElem) {
              var carouselTrackName = carouselNodeElem.attr('trackname');

              carouselName = carouselTrackName ? carouselTrackName.split('|')[0] : '';
            }

            additionalProdElem.each(function (index, prodElem) {
              var addProductId = $(prodElem).attr('data-product-id');

              addProductIds.push('PROD' + addProductId);
              addProductImpressionList.push(location.pathname);
            });
            eventObj.product_impression_id = addProductIds;
            eventObj.product_impression_list = addProductImpressionList;
            eventObj.event_noninteraction = 'true';
            eventObj.gift_id = giftId;
            trackEvent('build a gift', 'build a gift', 'wrap and review - ' + carouselName, addProductIds.join(' | '));
          }
        });

        $(document).on('click', '.js-slider-arrow-wrapper', function () {
          var carouselName = '';
          var carouselTrackName = $(this).closest('.js-analytics-content-block').attr('trackname');

          if (carouselTrackName) {
            carouselName = carouselTrackName.split('|')[0];
          }
          trackEvent('build a gift', 'build a gift', 'arrow click', carouselName);
        });

        $(document).on('track:addGiftToCart', function (event, data) {
          var productIds = [];
          var giftId = data.collectionId;
          var skuBaseIds = data.collectionInfo.skus;

          skuBaseIds.forEach(function (skuElem) {
            var productId = skuElem.PRODUCT_ID.toString();

            productIds.push(productId);
          });

          eventObj.gift_id = giftId;

          trackEvent('build a gift', 'build a gift', 'add gift to bag', productIds.join(' | '));
        });

        $(document).on('click', '.js-bespoke-gifting-add-more', function () {
          eventObj.gift_id = site.bespoke.collectionId;

          trackEvent('build a gift', 'build a gift', 'add more products', 'click');
        });

        $(document).on('track:embossWidgetOpen', function () {
          trackEvent('build a gift', 'build a gift', 'open embossing widget', site.bespoke.collectionId);
        });

        $(document).on('track:embossAddToOrder', function (event, data) {
          var giftId = site.bespoke.collectionId;
          var eventAction = 'add embossing - ' + giftId + ' - SKU' + data.embossingSku.sku_id;
          var eventLabel = data.message + ' - ' + data.foilColor + ' - ' + data.font;

          eventObj.gift_embossed = 'yes';

          trackEvent('embossing', 'build a gift', eventAction, eventLabel);
        });

        $(document).on('click', '.js-embossing-edit', function () {
          trackEvent('build a gift', 'build a gift', 'edit embossing', site.bespoke.collectionId);
        });

        $(document).on('click', '.js-embossing-remove', function () {
          trackEvent('build a gift', 'build a gift', 'remove embossing', site.bespoke.collectionId);
        });
      }
      // MTA-4024 - Emboss tagging and build a gift tagging - Ends

      // Blog page tagging start.
      if ($('body').hasClass('section-our-stories') || $('body').hasClass('section-our-house')) {
        $(document).on('click', '.js-blog-landing-page__menu ul li a', function () {
          var eventLabel = $(this).text().trim();

          trackEvent('blog', 'blog', 'blog category selection', eventLabel);
        });

        $(document).on('click', '.js-blog-post-tile', function () {
          var $blogImageElem = $(this);
          var eventLabel = $blogImageElem.find('.elc-link--caps').attr('href');
          var blogSubtitle = $blogImageElem.find('.blog-post-tile__content').text().trim();
          var blogDiscription = blogSubtitle.split(' ');

          eventObj.content_title = $blogImageElem.find('.blog-post-tile__title').text().trim();
          eventObj.content_author = 'null';
          eventObj.content_category = 'null';
          eventObj.content_subcategory = 'null';
          eventObj.content_word_count = blogDiscription.length;
          trackEvent('blog', 'blog', 'blog article selection', eventLabel);
        });

        window.onload = function () {
          if (($('body').hasClass('section-our-stories') || $('body').hasClass('section-our-house')) && $('div').hasClass('sd-product-grid')) {
            var $menuItems = $('.slick-slider');
            var productImpressionIds = [];
            var productPositions = [];
            var productImpressionList = [];
            var $elem;

            $menuItems.find('.slick-slider').each(function (index, elem) {
              if (!$(elem).length) {
                return;
              }
              $elem = $(elem);
              productImpressionIds.push('PROD' + $elem.find('.js-product-brief').attr('data-product-id'));
              productPositions.push(index + 1);
              productImpressionList.push('/blog list');
              $(this).attr('data-index', index + 1);
            });

            var objView = {
              event_name: 'blog',
              event_category: 'ecommerce',
              event_action: 'product carousel display',
              event_label: 'product carousel display',
              product_impression_list: productImpressionList,
              product_impression_position: productPositions,
              product_impression_id: productImpressionIds,
              location: window.location.href
            };

            site.track.evtLink(objView);
          }
        };

        $(document).on('click', '.slick-slider .slick-arrow', function () {
          var $slickElem = $('.slick-slider');
          var $elem;
          var prodArray = [];

          $slickElem.find('.slick-slide').each(function (index, elem) {
            if (!$(elem).length) {
              return;
            }
            $elem = $(elem);
            prodArray.push('PROD' + $elem.find('.js-product-brief').attr('data-product-id'));
          });
          var eventLabel = prodArray.join('|');

          trackEvent('blog', 'blog', 'blog product carousel - arrow click', eventLabel);
        });

        $(document).on('click', '.slick-slide .js-product-brief', function () {
          var $blogImageElem = $(this);
          var blogResultId = $blogImageElem.data('product-id');
          var blogProdPosition = $blogImageElem.closest('.slick-slide').attr('data-index');

          eventObj.enh_action = 'product_click';
          eventObj.product_position = [parseInt(blogProdPosition) + 1];
          eventObj.product_list = ['blog list'];
          eventObj.product_id = ['PROD' + blogResultId];
          trackEvent('blog', 'ecommerce', 'product click', 'product click');
        });

        $(document).on('click', '.js-complementary-benefit-formatter-carousel-item .complementary-benefit', function () {
          var eventLabel = $(this).data('clickable');

          trackEvent('blog', 'blog', 'blog - link click', eventLabel);
        });
      }
      // Blog page tagging end.

      // Blossoms landing page tagging start.
      if ($('body').hasClass('section-spring-blossoms')) {
        $('.js-content-block-overlay-cta a').on('click', function () {
          var ctaButtonLabel = $(this).text().trim();
          var ctaButtonHeader = $(this).closest('.content-block__link-wrapper').prev().find('.js-mantle-custom-text').text().trim();
          trackEvent('standard_event', 'spring_blossoms', 'click', ctaButtonLabel + ' - ' + ctaButtonHeader);
        })

        $('.js-content-block-overlay-close').on('click', function () {
          var overlayName = '';
          var overlayTrackName = $(this).closest('.js-content-block-overlay').find('.js-analytics-content-block').attr('trackname');
          overlayName = overlayTrackName.split('|')[0];
          trackEvent('standard_event', 'spring_blossoms', 'click', overlayName + ' - close overlay ');
        })

        $('.js-gallery-item-content-arrows--right, .js-gallery-item-content-arrows--left').on('click', function () {
          var direction = $(this).hasClass('js-gallery-item-content-arrows--right') ? 'right' : 'left';
          var overlayName = '';
          var overlayTrackName = $(this).closest('.js-analytics-content-block').attr('trackname');
          overlayName = overlayTrackName.split('|')[0];
          trackEvent('standard_event', 'spring_blossoms', 'click', overlayName + ' - ' + direction + ' arrow click');
        })
      }
      // Blossoms landing page tagging end.

      // Product click on Recommendation section
      recomProductSelectors = [
        '.cart_cross_sell_item a.product_image',
        '.cart_cross_sell_item .name a',
        '.recommended-item a.thumb',
        '.recommended-item .product_name a',
        '.recommended-item .recommended-item__thumb a',
        '.recommended-item .recommended-item__product-name a'
      ];
      $(document).on('click', recomProductSelectors.join(', '), function () {
        var $prodElem = $(this);
        var $prodHref = $prodElem.attr('href');
        var splitprod = $prodHref.split('/');
        var prodId = 'PROD' + splitprod[3];
        if (typeof prodId !== 'undefined' && prodId !== '') {
          site.track.productClick({
            targetElem: $prodElem,
            product_id: [prodId]
          });
        }
      });

      // Module open close clicks
      $(document).on('mousedown touchdown', '.js-samples-accordion, .samples__header-text', function () {
        var $currentElem = $(this);
        var $samplePanel = $currentElem.closest('#samples-panel');
        var $accordionContentElem = $samplePanel.find('.js-accordion-content');
        var clickSense = $accordionContentElem.length ? $accordionContentElem.is(':visible') : $samplePanel.find('.samples__content').is(':visible');
        var evtLabel = $currentElem.text().trim();

        if (clickSense) {
          trackEvent('sample_module_close', 'samples', 'module_close', evtLabel);
        } else {
          trackEvent('sample_module_open', 'samples', 'module_open', evtLabel);
        }
      });

      // Tracking arrow clicks
      $(document).on('mousedown touchdown', '.slick-prev, .slick-next, .samples__next, .samples__previous', function () {
        var $currentElem = $(this);
        var $samplePanel = $currentElem.closest('#samples-panel');
        var $samplesAccordionElem = $samplePanel.find('.js-samples-accordion');
        var $samplesHeaderElem = $samplePanel.find('.samples__header-text');
        var carouselName = '';

        if ($samplesAccordionElem.length === 1) {
          carouselName = $samplesAccordionElem.text().trim();
        } else if ($samplesHeaderElem.length === 1) {
          carouselName = $samplesHeaderElem.text().trim();
        } else {
          carouselName = $samplePanel.find('.title--h5').text().trim();
        }

        if (!($currentElem.hasClass('disabled') || $currentElem.hasClass('slick-disabled')) && carouselName) {
          trackEvent('sample_arrow_click', 'samples', 'arrow_click', carouselName);
        }
      });

      // Remove sample tracking
      $(document).on('click', '.sample-select-button, .js-samples-button, input.sample-input', function () {
        var $currentElem = $(this);
        var $prodContainerElem = $currentElem.closest('.product__description, .samples__details, .details, .product_info, .description');
        var $targetElem = $prodContainerElem.length > 0 ? $prodContainerElem.first() : $currentElem;
        var $skuSelected = $targetElem.find('.sample-select, .sample-input');
        var skuId = $skuSelected.length > 0 ? $skuSelected.first().val() : '';
        var $productNameElem = $targetElem.find('.product_name, .product-name, .sample-name, .name, .product-brief__title');
        var skuName = $productNameElem.length > 0 ? $productNameElem.first().text().trim() : '';
        var $samplePageElem = $('body').attr('id') || $('body').attr('class');
        var separateSamplePage = ($samplePageElem && $samplePageElem.indexOf('sample') > -1) ? true : false;

        skuId = (skuId && skuId.toUpperCase().includes('SKU')) ? skuId : 'SKU' + skuId;
        if (!$skuSelected.prop('checked')) {
          trackEvent('samples', 'samples', 'samples_remove', skuName + ' - ' + skuId);
        } else if (separateSamplePage) {
          trackEvent('samples', 'samples', 'samples_added', skuName + ' - ' + skuId);
        }
      });

      // English Pear collection landing page tagging start.
      if ($('body').hasClass('section-english-pear-collection')) {
        $(document).on('click', '.js-tabbed-block-tab', function () {
          var $navItemElem = $(this);
          var eventLabel = $navItemElem.text().trim();

          trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', 'Hero Tab Carousel - ' + eventLabel);
        });

        $(document).on('click', '.js-media-block-overlay-cta .js-elc-button', function () {
          var $overlayButtonElem = $(this);
          var eventLabel = $overlayButtonElem.text().trim();

          trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', eventLabel + ' - Overlay CTA');
        });

        $(document).on('click', '.js-filter-tab-panel-formatter .js-filter-tab-panel-formatter-tabs-item', function () {
          var $carouselFilterElem = $(this);
          var filterHeadrName = $carouselFilterElem.closest('.js-filter-tab-panel-formatter').find('.filter-tab-panel-formatter__headers .mantle-custom-text').text().trim();
          var eventLabel;

          if (filterHeadrName) {
            eventLabel = $carouselFilterElem.find('.mantle-custom-text').text().trim();
            trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', filterHeadrName + ' - Carousel Filter Tab - ' + eventLabel);
          } else {
            eventLabel = $carouselFilterElem.text().trim();
            trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', eventLabel + ' - Tasting Notes Filters Tab');
          }
        });

        $(document).on('click', '.js-filter-tab-panel-formatter-contents-item .js-elc-button', function () {
          var $ctaItemElem = $(this);
          var eventLabel = $ctaItemElem.text().trim();

          trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', eventLabel + ' - cta');
        });

        $(document).on('click', '.filter-tab-item__contents .js-tap-reveal-item .content-over-media__text', function () {
          var eventLabel = $(this).find('.mantle-custom-text').text().trim();

          trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', eventLabel);
        });

        $(document).on('click', '.js-horizontal-drag-formatter-container .hero-block__wrapper', function () {
          var $contentImageElem = $(this);
          var eventLabel = $contentImageElem.find('.mantle-custom-text').text().trim();

          if (eventLabel) {
            trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', eventLabel);
          } else {
            trackEvent('english-pear-collection', 'english-pear-collection', 'module clicks', 'Arrow Long Carousel Click');
          }
        });
      }
      // English Pear collection landing page tagging end.

      // Gingerbread landing page tagging start.
      if ($('body').hasClass('section-christmas-gifts')) {
        $(document).on('click', '.js-sticky-nav-formatter-navbar .js-sticky-nav-item', function () {
          var $navItemElem = $(this);
          var eventLabel = $navItemElem.find('.js-sticky-nav-item-anchor').data('link-ref');

          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'sub-nav | christmas fy25 | ' + eventLabel);
        });

        $(document).on('click', '.js-sticky-nav-formatter-cta .js-track-sticky-nav-item', function () {
          var $navItemElem = $(this);
          var eventLabel = $navItemElem.attr('href');

          if (eventLabel) {
            trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'sticky-CTA | christmas fy25 | ' + eventLabel.replace('#', ''));
          }
        });

        $(document).on('click', '.js-media-asset-analytics-tracking, .js-content-block-line-explore .js-mantle-custom-text', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');
          var $containerElem;
          var moduleTitle;

          if (trackname.indexOf('FY25 Christmas | Gifts By Price') > -1 || trackname.indexOf('FY25 Christmas | Services') > -1) {
            $containerElem = $currentElem.closest('.js-hero-block-wrapper');
            moduleTitle = $containerElem.find('.js-content-block-line-explore .js-mantle-custom-text').text().trim();
            eLabel = 'banner click | christmas fy25 | ' + moduleTitle;
          }

          if (eLabel !== '') {
            trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', eLabel);
          }
        });

        $(document).on('click', '.js-basic-carousel-formatter-cta a', function () {
          var $currentElem = $(this);
          var ctaButtonLabel = $currentElem.text().trim();
          var ctaButtonHeader = $currentElem.closest('.js-filter-tab-panel-formatter').find('.js-filter-tab-panel-formatter-tabs-item.active .js-mantle-custom-text').text().trim();

          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'Carousel CTA | christmas fy25 | ' + ctaButtonLabel + ' ' + ctaButtonHeader);
        });

        $(document).on('click', '.js-filter-tab-panel-formatter-contents-item .slick-prev-button, .js-filter-tab-panel-formatter-contents-item .slick-next-button', function () {
          var arrowSide = $(this).hasClass('slick-prev-button') ? 'left' : 'right';

          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'Carousel | christmas fy25 | ' + arrowSide);
        });

        $(document).on('click', '.js-filter-tab-panel-formatter-tabs-scroller .js-filter-tab-panel-formatter-tabs-item, .js-filter-tab-panel-formatter-tabs .js-filter-tab-panel-formatter-tabs-link', function () {
          var $carouselItemElem = $(this);
          var eventLabel = $carouselItemElem.text().trim();

          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'Carousel filter tabs | christmas fy25 | ' + eventLabel);
        });

        $(document).on('click', '.js-horizontal-drag-formatter-container-inner .js-horizontal-drag-formatter-container-inner--panel', function () {
          var $conCarouselItemElem = $(this);
          var eventLabel = $conCarouselItemElem.find('.mantle-custom-text').text().trim();

          if (eventLabel) {
            trackEvent('christmas-gifts', 'christmas-gifts', 'module clicks', 'Content Carousel - ' + eventLabel);
          }
        });

        $(document).on('click', '.js-basic-formatter-item .js-hero-block .js-hero-block-media', function () {
          var $conCarouselItemElem = $(this);
          var eventLabel = $conCarouselItemElem.closest('.js-hero-block').find('.mantle-custom-text').text().trim();

          trackEvent('christmas-gifts', 'christmas-gifts', 'module clicks', 'Send a Message Banner - ' + eventLabel);
        });

        $(document).on('click', '.js-header-offers-panel-copy-text .js-copy-code-btn', function () {
          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'banner click | christmas fy25 | copy code CTA');
        });

        $(document).on('click', '.js-header-offers-panel-copy-text .js-continue-cta a', function () {
          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'banner click | christmas fy25 | continue CTA');
        });

        $(document).on('click', '.js-content-block-cta a', function () {
          var $currentElem = $(this);
          var $containerElem = $currentElem.closest('.block-template-product-content-grid-v1');
          var contentTitle = $containerElem.find('.js-content-block-headline .js-mantle-custom-text').text().trim();
          var sectionName = contentTitle.toLowerCase().indexOf('her') > -1 ? 'her' : 'him';

          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'banner click | christmas fy25 | see more by ' + sectionName);
        });

        $(document).on('click', '.js-product-content-grid-modal-container .js-product-thumbnails-tracking', function () {
          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'overlay click | christmas fy25 | carousel product click');
        });

        $(document).on('click', '.js-product-content-controls-tracking .slick-prev-button, .js-product-content-controls-tracking .slick-next-button', function () {
          var arrowType = $(this).hasClass('slick-next-button') ? 'right' : 'left';

          trackEvent('christmas-gifts', 'fy25 christmas modules clicks', 'module clicks', 'overlay click | christmas fy25 | ' + arrowType);
        });
      }
      // Gingerbread landing page tagging end.

      $('.js-sticky-nav-item').on('click', '.mantle-custom-text', function () {
        var $currentElem = $(this);
        var promoName = $currentElem.text();

        if (typeof promoName !== 'undefined' && promoName !== '') {
          site.track.navigationClick({
            promo_name: [promoName]
          });
        }
      });

      if ($('body').hasClass('section-cologne-intense-collection')) {
        $(document).on('click', '.js-hero-block-wrapper .js-elc-button', function () {
          trackEvent('content-module-click', 'global', 'Module Clicks', 'Banner Clicks | Hinoki | Watch the film');
        });

        $(document).on('click', '.js-horizontal-drag-formatter .js-mantle-custom-text', function () {
          var $currentElem = $(this);
          var $containerElem = $currentElem.closest('.js-hero-block-wrapper');
          var $contentBlockHeaderElem = $currentElem.closest('.js-content-block-line-header');
          var blockTitle = $containerElem.find('.js-content-block-line-header .js-mantle-custom-text').text().trim();
          var eLabel = 'Banner Clicks | Carousel | Discover | ' + blockTitle;

          if ($contentBlockHeaderElem.length === 0) {
            trackEvent('content-module-click', 'global', 'Module Clicks', eLabel);
          }
        });
      }

      if ($('body').hasClass('section-paddington-limited-edition-collection')) {
        var eName = 'content-module-click';
        var eCategory = 'project-p modules clicks';
        var eAction = 'Module Clicks';

        $(document).on('click', '.js-carousel-controls-bg .slick-prev-button', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');

          if (trackname.indexOf('Project P - Product Overlay') > -1) {
            eLabel = 'Banner Clicks | Project P | Product Overlay Alt Imge Carousels';
          } else if (trackname.indexOf('Project P - Carousel Data') > -1) {
            eLabel = 'Banner Clicks | Project P | Product Carousel | left arrow';
          }

          trackEvent(eName, eCategory, eAction, eLabel);
        });

        $(document).on('click', '.js-carousel-controls-bg .slick-next-button', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');

          if (trackname.indexOf('Project P - Product Overlay') > -1) {
            eLabel = 'Banner Clicks | Project P | Product Overlay Alt Imge Carousels';
          } else if (trackname.indexOf('Project P - Carousel Data') > -1) {
            eLabel = 'Banner Clicks | Project P | Product Carousel | right arrow';
          }

          trackEvent(eName, eCategory, eAction, eLabel);
        });

        $(document).on('click', '.js-carousel-controls-bg .slick-dots li', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');

          if (trackname.indexOf('Project P - Product Overlay') > -1) {
            eLabel = 'Banner Clicks | Project P | Product Overlay Alt Imge Carousels';
          }

          trackEvent(eName, eCategory, eAction, eLabel);
        });

        $(document).on('click', '.js-product-content-card .js-elc-button', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var $productContentElem = $currentElem.closest('.js-product-content-card');
          var postcardTitle = $productContentElem.length > 0 ? $productContentElem.first().find('.js-mantle-custom-text p').text().trim() : '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');

          if (trackname.indexOf('Project P - Product Overlay') > -1) {
            eLabel = 'Banner Clicks | Project P | Product Overlay Shop Now CTA';
          } else if (trackname.indexOf('Project P - overlay - recipe') > -1) {
            eLabel = 'Banner Clicks | Project P | Recipe Dowload CTA';
          } else if (trackname.indexOf('Project P - Postcard') > -1) {
            eLabel = 'Banner Clicks | Project P | ' + postcardTitle;
          }

          trackEvent(eName, eCategory, eAction, eLabel);
        });
      }

      // MTA-9288 JM Brainslabs tagging.
      $(document).on('landingTemplateProdGrid', function () {
        var eventData = {
          event_name: 'product_impression',
          event_category: 'ecommerce',
          event_action: 'view_item_list',
          event_label: 'view_item_list',
          event_noninteraction: true,
          product_impression_base_id: [],
          product_impression_brand: [],
          product_impression_id: [],
          product_impression_list: [],
          product_impression_name: [],
          product_impression_position: [],
          product_impression_price: [],
          product_impression_product_code: [],
          product_impression_shade: [],
          product_impression_size: []
        };

        $('.js-product-content-grid-partial').each(function (index) {
          var $prodElem = $(this);
          var data = site.track.refreshData();
          var impressionbaseId = $prodElem.attr('data-product-id');
          var impressionprodId = $prodElem.attr('data-product-id');
          var impressionprodCode = $prodElem.attr('data-product-code');
          var impressionprodName = $prodElem.find('.js-product-content-grid__copy.name')?.text()?.trim();
          var impressionbrand = data.brand;
          var impressionList = location.pathname;
          var impressionprodPosition = index + 1;
          var impressionprodPrice = $prodElem.find('.js-product-content-grid__copy.price')?.text()?.trim();
          var impressionprodSize = $prodElem.find('.js-product-content-grid__copy.size')?.text()?.trim();
          var impressionprodShade = $prodElem.find('.js-product-content-grid__copy.shade')?.text()?.trim();

          if (impressionprodId) {
            eventData.product_impression_id.push(`PROD${impressionprodId}`);
            eventData.product_impression_product_code.push(`${impressionprodCode}`);
            eventData.product_impression_name.push(`${impressionprodName}`);
            eventData.product_impression_brand.push(`${impressionbrand}`);
            eventData.product_impression_base_id.push(`${impressionbaseId}`);
            eventData.product_impression_list.push(`${impressionList}`);
            eventData.product_impression_position.push(`${impressionprodPosition}`);
            eventData.product_impression_price.push(`${impressionprodPrice}`);
            eventData.product_impression_size.push(`${impressionprodSize}`);
            eventData.product_impression_shade.push(`${impressionprodShade}`);
          }
        });
        site.track.evtLink(eventData);
      });

      if ($('body').hasClass('section-mothers-day-gifting')) {
        $(document).on('click', '.js-product-content-grid-partial', function () {
          var prodDetails = $(this).closest('.js-product-content-grid-partial').attr('data-product-id');
          var prodId = 'PROD' + prodDetails;
          var prodName = $(this).find('.js-product-content-grid__copy.name')?.text()?.trim();
          var eLabel = prodName + ' - ' + prodId;

          $('.js-product-content-grid-partial').each(function (index) {
            $(this).attr('data-product-index', index + 1);
          });
          var prodPosition = $(this).closest('.js-product-content-grid-partial').attr('data-product-index');

          if (typeof prodId !== 'undefined' && prodId !== '') {
            eventObj.enh_action = 'product_click';
            eventObj.product_position = [prodPosition];
            eventObj.product_list = [location.pathname];
            eventObj.product_id = [prodId];
            eventObj.product_name = [prodName];
            trackEvent('select_item', 'ecommerce', 'product click', eLabel);
          }
        });
      }

      // Track guest user checkout
      $(document).on('click', '.js_analytics_guest_user_submit', function () {
        var userEmail = $('.js-new-user-email')?.val();

        if (userEmail) {
          site.track.evtAction('checkoutGuestUser', {});
        }
      });

      $(document).on('click', '.js_analytics_return_user_submit', function () {
        var userEmail = $('.js-signin-email-address')?.val();

        if (userEmail) {
          site.track.evtAction('checkoutReturnUser', {});
        }
      });

      if ($('body').hasClass('section-rose-fragrance-collection')) {
        var overlayTrackList = ['FY24 Roses Collection | Rose Amber Overlay', 'FY24 Roses Collection | Rose Blush Overlay', 'FY24 Roses Collection | Rose & Magnolia Overlay'];

        $(document).on('click', '.js-media-asset-analytics-tracking', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var $containerElem = '';
          var $contentOverlayCTA = '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');
          var moduleTitle = '';
          var isOverlayTrackName = false;

          overlayTrackList.forEach(function (currentTrack) {
            isOverlayTrackName = trackname.indexOf(currentTrack) > -1 ? true : isOverlayTrackName;
          });

          if (trackname.indexOf('FY24 Roses Collection | Hero Intro') > -1) {
            eLabel = 'Hero Top Image';
          } else if (trackname.indexOf('FY24 Roses Collection | Video') > -1) {
            eLabel = 'Rose & Magnolia Overlay - Discover The Scent CTA';
          } else if (trackname.indexOf('FY24 Roses | Product Module') > -1) {
            $containerElem = $currentElem.closest('.js-hero-block');
            $contentOverlayCTA = $containerElem.find('.js-content-block-overlay-cta');
            moduleTitle = $contentOverlayCTA.find('.js-content-block-line-header .js-mantle-custom-text').text().trim();
            eLabel = moduleTitle + ' Overlay - Discover The Scent CTA';
          } else if (trackname.indexOf('FY24 Roses Collection | Split Module') > -1 && !$currentElem.closest('.js-split-width').attr('data-clickable')) {
            $containerElem = $currentElem.closest('.js-split-width-wrapper');
            moduleTitle = $containerElem.find('.js-content-block-line-title .js-mantle-custom-text').text().trim();
            eLabel = moduleTitle + ' image';
          } else if (isOverlayTrackName) {
            eLabel = 'Video Module Play';
          }

          if (eLabel !== '') {
            trackEvent('content-module-click', 'rose-fragrance-collection modules clicks', 'Module Clicks', eLabel);
          }
        });

        $(document).on('click', '.js-content-block-line-header .js-mantle-custom-text, .js-content-block-line-explore .js-mantle-custom-text, .js-split-width-wrapper .js-content-block-line-title', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var moduleTitle = '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');
          var $heroBlock = $currentElem.closest('.js-hero-block');
          var $contentOverlayCTA = $heroBlock.find('.js-content-block-overlay-cta');
          var $containerElem = '';

          if (trackname.indexOf('FY24 Roses | Product Module') > -1) {
            moduleTitle = $contentOverlayCTA.find('.js-content-block-line-header .js-mantle-custom-text').text().trim();
            eLabel = moduleTitle + ' Overlay - Discover The Scent CTA';
          } else if (trackname.indexOf('FY24 Roses Collection | Split Module') > -1 && !$currentElem.closest('.js-split-width').attr('data-clickable')) {
            $containerElem = $currentElem.closest('.js-split-width-wrapper');
            moduleTitle = $containerElem.find('.js-content-block-line-title .js-mantle-custom-text').text().trim();
            eLabel = moduleTitle + ' Read More CTA';
          }

          if (eLabel !== '') {
            trackEvent('content-module-click', 'rose-fragrance-collection modules clicks', 'Module Clicks', eLabel);
          }
        });

        $(document).on('click', '.js-gallery-overlay-analytics-tracking .js-content-block-details a', function () {
          var $currentElem = $(this);
          var eLabel = '';
          var trackname = $currentElem.closest('.js-analytics-content-block').attr('trackname');
          var $galleryOverlayelem = $currentElem.closest('.js-gallery-overlay-analytics-tracking');
          var contentOverlayTitle = $galleryOverlayelem.find('.js-content-block-headline .js-mantle-custom-text').text().trim();
          var isOverlayTrackName = false;

          overlayTrackList.forEach(function (currentTrack) {
            isOverlayTrackName = trackname.indexOf(currentTrack) > -1 ? true : isOverlayTrackName;
          });

          if (isOverlayTrackName) {
            eLabel = contentOverlayTitle + ' Overlay - SHOP NOW';
          }

          if (eLabel !== '') {
            trackEvent('content-module-click', 'rose-fragrance-collection modules clicks', 'Module Clicks', eLabel);
          }
        });
      }

      self.attached = true;
    }
  };
}(window.site || {}, jQuery));
