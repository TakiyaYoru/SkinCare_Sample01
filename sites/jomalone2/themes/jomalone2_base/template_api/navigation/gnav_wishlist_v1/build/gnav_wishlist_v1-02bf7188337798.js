Drupal.behaviors.gnavWishlist = (function ($, _, site, generic, Mustache) {
  site.userInfoCookie.init();
  ('use strict');
  // Private variables:
  var $container = $();
  var $wishlistContent = $();
  var $wishlistCounters = $();
  var $wishlistTrigger = $();
  var $wishlistLinkAddtoBag = $();
  var $wishlistNotification = $();
  var $wishlistNotificationClose = $();
  var $wishlistNotificationContent = $();
  var $wishlistProducts = $();
  var $productRow = $();
  var $elementCloned;
  var $headerMain;
  var $body;
  var $gnavHeaderDarkOverlay = $('<div class="site-gnav-header-dark-overlay"></div>');
  var data = {
    wishlist_item_count: parseInt(site.userInfoCookie.getValue('fav_item_count')),
    wishlist_items: []
  };
  var state = 'empty';
  var loaded = false;
  var itemAddedMessage;
  var emptyWishlistMessage;
  var bps = Unison.fetch.all();
  var bp = Unison.fetch.now();
  var isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);

  // Replace dots in the top-level key names the server is giving us.
  // 'prod.PROD_RGN_NAME' --> 'prod_PROD_RGN_NAME'
  function _normalizeResponseKeys(items) {
    var replaceKey = function (key) {
      return key.replace(/\./, '_');
    };
    var out = [];

    for (var i = 0, len = items.length; i < len; i++) {
      out[i] = {};
      for (var key in items[i]) {
        if (Object.prototype.hasOwnProperty.call(items[i], key)) {
          out[i][replaceKey(key)] = items[i][key];
        }
      }
    }

    return out;
  }

  // Public methods:
  var behavior = {
    attach: function (context) {
      $container = $container.add($('.js-gnav-util-wishlist', context)).first();
      $wishlistContent = $wishlistContent.add($('.js-gnav-util-wishlist-content', context)).first();
      $wishlistCounters = $wishlistCounters.add($('.js-gnav-util-icon-wishlist-count', context));
      $wishlistTrigger = $wishlistTrigger.add($('.js-gnav-util-trigger-wishlist', context));
      $wishlistLinkAddtoBag = $wishlistLinkAddtoBag.add($('.js-product-row-info-remove', context));
      $headerMain = $('.site-header__content', context);
      $wishlistProducts = $('.js-wishlist-products', context);
      $wishlistNotification = $wishlistNotification.add($('.js-gnav-util-wishlist-notification', context));
      $wishlistNotificationClose = $wishlistNotificationClose.add(
        $('.js-gnav-util-wishlist-notification-close', context)
      );
      $wishlistNotificationContent = $wishlistNotificationContent.add(
        $('.js-gnav-util-wishlist-notification-content', context)
      );
      itemAddedMessage = $('.js-wishlist_confirm_success_msg', context).data('message');
      emptyWishlistMessage = $('.js-wishlist_confirm_empty_wishlist', context).data('message');
      $productRow = $('script.inline-template[path="wishlist/product_row"]', context).remove();
      $body = $('body');

      $container.hover(
        function () {
          if ($wishlistContent.hasClass('hidden')) {
            behavior.load(true);
            behavior.openWishlistOverlay();
          }
        },
        function () {
          if (!$wishlistContent.hasClass('hidden')) {
            behavior.closeWishlistOverlay();
          }
        }
      );

      // Load wishlist counter first time
      behavior.updateWishlistCounter(data.wishlist_item_count);

      // Document listeners:
      $(document).on('addToWishlist.success', function (event, result) {
        event.preventDefault();
        var value = result.collection_items;
        var skuItems = value.skus;

        $container.removeClass('wishlist-loading');
        if (_.isUndefined(value) || !value) {
          return;
        }
        behavior.setData({
          wishlist_item_count: value.fav_item_count,
          wishlist_items: _normalizeResponseKeys(skuItems)
        });
        if (isMobile) {
          behavior.displayNotificationMobile(itemAddedMessage);
        } else {
          behavior.setOverlayHeight();
          behavior.openWishlistOverlay();
        }
      });

      // Override preventDefault on gnav overlay logic if wishlist is empty:
      $(document).on('showWishlistConfirm.success', function (event, el) {
        event.preventDefault();
        var $el = $(el);

        if (isMobile && state === 'empty') {
          behavior.displayNotificationMobile(emptyWishlistMessage);
        } else {
          $wishlistContent.addClass('hidden');
          if (!$el.attr('href')) {
            window.location = $el.attr('href');
          }
        }
      });

      $wishlistNotificationClose.once().on('click', function () {
        $elementCloned.remove();
      });

      $(document).on('click', '.js-wishlist-add-to-bag', function () {
        behavior.addItemToCart($(this));
      });

      $(document).on('click', '.site-gnav-header-dark-overlay', function () {
        behavior.closeWishlistOverlay();
      });
    },

    render: function () {
      var itemsLength = data.wishlist_items.length;
      var rowsLength;

      if (itemsLength > 0) {
        $wishlistProducts.empty();
      }
      // If $productRow does not exist then return
      if ($productRow.length === 0) {
        return;
      }
      for (var i = 0, len = itemsLength; i < len; i += 1) {
        var productRow = $productRow.html();
        var rendered = Mustache.render(productRow, data.wishlist_items[i]);

        $wishlistProducts.append(rendered);
      }

      // Update the counters that are outside of the template
      if (data.wishlist_item_count > 0) {
        behavior.updateWishlistCounter(data.wishlist_item_count);
      }

      rowsLength = $wishlistProducts.find('.js-wishlist-product-row').length;
      rowsLength === 1 ? $wishlistProducts.addClass('unique-product') : $wishlistProducts.removeClass('unique-product');

      return this;
    },

    load: function (force) {
      if (loaded && (!_.isBoolean(force) || !force)) {
        return this;
      }

      $container.addClass('wishlist-loading');

      generic.jsonrpc.fetch({
        method: 'user.getFavorites',
        params: [],
        onSuccess: function (response) {
          var value = response.getValue();
          var skuItems = value.skus;

          $container.removeClass('wishlist-loading');

          if (_.isUndefined(value) || !value) {
            return;
          }
          behavior.setData({
            wishlist_item_count: value.fav_item_count,
            wishlist_items: _normalizeResponseKeys(skuItems)
          });
          if (!isMobile) {
            behavior.setOverlayHeight();
          }
        },
        onFailure: function () {
          $container.removeClass('wishlist-loading');
          loaded = false;
        }
      });

      // Don't put loaded in success function! That allows the user to fire
      // additonal requests while the first is still loading.
      loaded = true;

      return this;
    },

    setOverlayHeight: function () {
      var siteHeaderHeight = $headerMain.outerHeight(true);
      var $siteHeaderSticky = $headerMain.find('.gnav-header-block--sticky');
      var wishlistHeaderHeight = $wishlistContent.find('.js-wishlist-confirm-header').outerHeight(true);
      var wishlistContentBottomHeight = $wishlistContent.find('.js-wishlist-confirm-content-bottom').outerHeight(true);
      var $wishlistProductsContainer = $wishlistContent.find('.js-wishlist-products');
      var $wishlistProductsRow = $wishlistProducts.find('.js-wishlist-product-row');
      var overlayHeight;
      var productsHeight;

      // If sticky nav is active then update the site header height
      if ($siteHeaderSticky.length > 0) {
        siteHeaderHeight = $headerMain.find('.gnav-header-block__inner').outerHeight(true);
      }

      overlayHeight = $(window).height() - siteHeaderHeight;
      productsHeight = overlayHeight - wishlistHeaderHeight - wishlistContentBottomHeight;
      // set height of entire overlay to window height, less gnav offset
      $wishlistContent.height('auto');
      $wishlistContent.css('max-height', overlayHeight);
      // set height of product list to available space
      $wishlistProductsContainer.height('auto');
      $wishlistProductsContainer.css('max-height', productsHeight);
      $wishlistProductsRow.each(function () {
        var $whishlistProduct = $(this);
        var $whishlistProductAddToProduct = $whishlistProduct.find('.js-wishlist-add-to-bag');
        var $whishlistProductSoldOut = $whishlistProduct.find('.js-wishlist-sold-out');
        var $whishlistProductCommingSoon = $whishlistProduct.find('.js-wishlist-comming-soon');
        var productInventryStatus = parseInt($whishlistProductAddToProduct.data('inventoryStatus'), 10);

        if(productInventryStatus === 3) {
          $whishlistProductCommingSoon.removeClass('hidden');
          $whishlistProductAddToProduct.addClass('hidden');
        } else if(productInventryStatus !== 1 && productInventryStatus !== 6) {
          $whishlistProductSoldOut.removeClass('hidden');
          $whishlistProductAddToProduct.addClass('hidden');
        }
      });
    },

    // Setters:
    setState: function (newState) {
      var states = ['empty', 'nonempty', 'added'];
      var classPrefix = 'wishlist-block--';
      var stateClasses = classPrefix + states.join(' ' + classPrefix);

      // If state is undefined, figure it out:
      if (_.isUndefined(newState)) {
        state = data.wishlist_item_count > 0 ? 'nonempty' : 'empty';
        // Sanity check:
      } else if (!_.includes(states, newState)) {
        throw new Error('"' + newState + '" is not a valid wishlist state.');
      } else {
        state = newState;
      }

      $container.removeClass(stateClasses).addClass(classPrefix + state);

      return this;
    },

    setData: function (newData) {
      _.extend(data, newData);
      this.setState().render();

      return this;
    },

    displayNotificationMobile: function (message) {
      var $utilitiesContainer = $container.closest('.gnav-header-block__utilities');

      behavior.updateWishlistCounter(data.wishlist_item_count);
      $wishlistContent.addClass('hidden');
      $wishlistNotificationContent.html(message);
      // Here I clone content with events because the main div is hidden
      if ($utilitiesContainer.length > 0) {
        $elementCloned = $wishlistNotification.removeClass('hidden').clone(true);
        $elementCloned.appendTo($utilitiesContainer);
      }

      // Close notification after 3 seconds
      setTimeout(function () {
        $elementCloned.remove();
      }, 3000);
    },

    displayGnavHeaderDarkOverlay: function () {
      // Add gnav header overlay for DG pages
      if ($('.site-content', $body).length > 0 && !isMobile) {
        $gnavHeaderDarkOverlay.prependTo($('.site-content', $body));
      } else if ($('.pg_wrapper', $body).length > 0 && !isMobile) {
        // Add gnav header overlay for PG pages
        $gnavHeaderDarkOverlay.prependTo($('.pg_wrapper', $body));
      }
      $body.toggleClass('gnav-util-overlay-active', true);
    },

    removeGnavHeaderDarkOverlay: function () {
      $body.toggleClass('gnav-util-overlay-active', false);
      $gnavHeaderDarkOverlay.remove();
    },

    updateWishlistCounter: function (item_count) {
      if (item_count > 0) {
        // Update gnav header wishlist counter mobile
        setTimeout(function () {
          $(document).trigger('update_gnav_header_wishlist_counter', item_count);
        }, 2000);
        // Update wishlist counter PC
        $wishlistCounters.text(item_count);
      }
    },

    addItemToCart: function ($item) {
      var params = {
        _SUBMIT: 'cart',
        SKU_BASE_ID: $item.data('sku-base-id'),
        INCREMENT: 1,
        QTY: 1
      };

      generic.jsonrpc.fetch({
        method: 'rpc.form',
        params: [params],
        onSuccess: function (response) {
          var resultData = response.getData();

          behavior.closeWishlistOverlay();

          // Display gnav cart after add product from wishlist
          $(document).trigger('addToCart.success', [resultData]);
        },
        onFailure: function (jsonRpcResponse) {
          behavior.closeWishlistOverlay();
          var errors = jsonRpcResponse.getMessages();
          var resultData = jsonRpcResponse.getData();

          $(document).trigger('addToCart.failure', [errors, resultData]);
        }
      });
    },

    openWishlistOverlay: function () {
      $wishlistContent.removeClass('hidden');
      behavior.displayGnavHeaderDarkOverlay();
      if (!isMobile) {
        behavior.setOverlayHeight();
      }
    },

    closeWishlistOverlay: function () {
      $wishlistContent.addClass('hidden');
      behavior.removeGnavHeaderDarkOverlay();
    }
  };

  Unison.on('change', function (bp) {
    isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);
  });

  return behavior;
})(
  (window.jQuery = window.jQuery || function () {}),
  (window._ = window._ || {}),
  (window.site = window.site || {}),
  (window.generic = window.generic || {}),
  (window.Mustache = window.Mustache || {})
);
