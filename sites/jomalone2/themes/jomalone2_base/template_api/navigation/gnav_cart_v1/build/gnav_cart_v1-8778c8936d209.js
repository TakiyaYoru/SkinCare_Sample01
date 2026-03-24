Drupal.behaviors.gnavCart = (function ($, _, site, generic, Mustache) {
  'use strict';

  // Private variables:
  var $container = $();
  var $cartContent = $();
  var $counterInIcon = $();
  var $trigger = $();
  var $cartViewBagCounter = $();
  var $cartSubtotal = $();
  var $carContentItems = $();
  var $carContentNoItems = $();
  var $cartProducts = $();
  var $productRow = $();
  var $cartLinkRemove = $();
  var $cartNotification = $();
  var $cartNotificationContent = $();
  var itemAddedMessage;
  var emptyBagMessage;
  var $headerMain;
  var $body;
  var $gnavHeaderDarkOverlay = $('<div class="site-gnav-header-dark-overlay"></div>');
  var state = 'empty';
  var loaded = false;
  var closeCart = false;
  var isGnavCartHovered = false;
  var data = {
    itemCount: parseInt(site.userInfoCookie.getValue('item_count'), 10),
    subtotal: '',
    points: 0,
    orderWithin: '',
    shipSoonerDate: '',
    items: [],
    newItems: []
  };
  // The following vars are for engrave.
  var engravedLidType = 1; // Same value used for 30ml, 50ml, 100mg
  var engravedBottleType = [2, 5, 4]; // 30ml(2), 50mg(5), 100mg(4)
  var engravedCandleType = 3; // Same value used for 200g and 600g
  var bps = Unison.fetch.all();
  var bp = Unison.fetch.now();
  var isMobile = parseInt(bp.width, 10) < parseInt(bps.landscape, 10);

  // Replace dots in the top-level key names the server is giving us.
  // 'prod.PROD_RGN_NAME' --> 'prod_PROD_RGN_NAME'
  function _normalizeResponseKeys(items) {
    var replaceKey = function (key) {
      return key.replace(/\./, '_');
    };
    // Remove GiftWrap skus in cart overlay
    var items = items.filter(function (item) {
      return item['sku.isGiftwrapItem'] !== 1;
    });
    var out = [];

    for (var i = 0, len = items.length; i < len; i++) {
      out[i] = {};
      for (var key in items[i]) {
        if (Object.prototype.hasOwnProperty.call(items[i], key)) {
          out[i][replaceKey(key)] = items[i][key];
        }
        // Logic for engraved products - new keys created to display in cart overlay
        if (key === 'hasEngraving' && items[i][key] === 1) {
          if (
            items[i]['ENGRAVING_TYPE'] === engravedLidType ||
            $.inArray(items[i]['ENGRAVING_TYPE'], engravedBottleType) !== -1 ||
            items[i]['ENGRAVING_TYPE'] === engravedCandleType
          ) {
            out[i]['ENGRAVE_LID'] = items[i]['ENGRAVING_TYPE'] === engravedLidType ? 1 : 0;
            out[i]['ENGRAVE_BOTTLE'] =
              $.inArray(items[i]['ENGRAVING_TYPE'], engravedBottleType) !== -1 ? 1 : 0;
            out[i]['ENGRAVE_CANDLE'] = items[i]['ENGRAVING_TYPE'] === engravedCandleType ? 1 : 0;
            for (var engravedKey in items[i]['items']) {
              var auxCollectionName =
                items[i]['items'][engravedKey]['sku.SKU_BASE_ID'] +
                ':' +
                items[i]['ENGRAVING_TYPE'];

              // Create new keys for engraved products.
              if (items[i]['COLLECTION_NAME'] === auxCollectionName.toString()) {
                out[i]['ENGRAVED_prod_PROD_RGN_NAME'] =
                  items[i]['items'][engravedKey]['prod.PROD_RGN_NAME'];
                out[i]['ENGRAVED_sku_IMAGE_SMALL'] =
                  items[i]['items'][engravedKey]['sku.IMAGE_SMALL'];
                out[i]['ENGRAVED_PRICE'] = items[i]['items'][engravedKey]['prod.PROD_RGN_NAME'];
                out[i]['ENGRAVED_sku_PRODUCT_SIZE'] =
                  items[i]['items'][engravedKey]['sku.PRODUCT_SIZE'];
              }
            }
          }
        }
      }
    }

    return out;
  }

  function _setCloseTimeout() {
    if (state !== 'added') {
      return;
    }

    setTimeout(function () {
      if (closeCart && !isGnavCartHovered) {
        behavior.closeCartOverlay();
      }
      behavior.setState();
    }, 5000);
  }

  // Public methods:
  var behavior = {
    attach: function (context) {
      $container = $container.add($('.js-gnav-util-cart', context)).first();
      $cartContent = $cartContent.add($('.js-gnav-util-cart-content', context)).first();
      $counterInIcon = $counterInIcon.add($('.gnav-util__icon__cart-count', context));
      $trigger = $trigger.add($('.js-gnav-util-trigger--cart', context));
      $cartViewBagCounter = $cartViewBagCounter.add(
        $('.js-gnav-util-cart-content-products-bottom-view-bag-counter', context)
      );
      $cartSubtotal = $cartSubtotal.add(
        $('.js-gnav-util-cart-content-products-bottom-subtotal-details-value', context)
      );
      $cartProducts = $cartProducts.add($('.js-gnav-util-cart-content-products-details', context));
      $carContentItems = $carContentItems.add($('.js-gnav-util-cart-content-products', context));
      $carContentNoItems = $carContentNoItems.add(
        $('.js-gnav-util-cart-content-products-no-items', context)
      );
      $cartLinkRemove = $cartLinkRemove.add($('.js-product-row-info-remove', context));
      $cartNotification = $cartNotification.add($('.js-gnav-util-cart-notification', context));
      $cartNotificationContent = $cartNotificationContent.add(
        $('.js-gnav-util-cart-notification-content', context)
      );
      itemAddedMessage = $('.js-gnav-util-cart-success_msg', context).data('message');
      emptyBagMessage = $('.js-gnav-util-cart-empty-bag', context).data('message');
      $('script.inline-template[path="cart/product_row"]', context).length && ($productRow = $('script.inline-template[path="cart/product_row"]', context).remove());
      $headerMain = $('.site-header__content', context);
      $body = $('body');

      $container.hover(
        function () {
          if ($cartContent.hasClass('hidden') && !isMobile) {
            $container.addClass('cart-loading');
            behavior.load(true);
            behavior.openCartOverlay();
          }
          isGnavCartHovered = true;
        },
        function () {
          if (!$cartContent.hasClass('hidden')) {
            behavior.closeCartOverlay();
          }
          isGnavCartHovered = false;
        }
      );
      // Load cart counter first time
      behavior.updateCartCounter(data.itemCount);
    },

    render: function () {
      var itemsLength = data.items.length;

      $cartProducts.html('');
      if ($productRow.length === 0) {
        return;
      }
      for (var i = 0, len = itemsLength; i < len; i += 1) {
        var productRow = $productRow.html();
        var rendered = Mustache.render(productRow, data.items[i]);

        $cartProducts.append(rendered);
      }

      // Update the Subtotal
      $cartSubtotal.text(data.subtotal);
      // Update View Bag
      $cartViewBagCounter.text(data.itemCount);
      behavior.updateCartCounter(data.itemCount);

      return this;
    },

    load: function (force) {
      if (loaded && (!_.isBoolean(force) || !force)) {
        return this;
      }

      generic.jsonrpc.fetch({
        method: 'trans.get',
        params: [
          {
            trans_fields: ['TRANS_ID', 'totals'],
            payment_fields: [],
            order_fields: ['items', 'samples', 'offerCodes']
          }
        ],
        onSuccess: function (response) {
          // Init variables for the case if '$TRANS_DEFERRAL' is set
          var subtotal = 0;
          var points = 0;
          var itemCount = 0;
          var cartItems = [];
          var value = response.getValue();

          $container.removeClass('cart-loading');

          if (!_.isUndefined(value) && value) {
            subtotal = value.formattedSubtotal;
            points = value.points;
            itemCount = value.items_count;
            cartItems = _normalizeResponseKeys(value.order.items.concat(value.order.samples));
          }

          behavior.setData({
            subtotal: subtotal,
            points: points,
            orderWithin: '',
            shipSoonerDate: '',
            itemCount: itemCount,
            items: cartItems
          });
          if (!isMobile) {
            behavior.setOverlayHeight();
          }
        },
        onFailure: function (jsonRpcResponse) {
          var errors = jsonRpcResponse.getMessages();
          var resultData = jsonRpcResponse.getValue();

          $(document).trigger('getItemsCart.failure', [errors, resultData]);
        }
      });

      // Don't put loaded in success function! That allows the user to fire
      // additonal requests while the first is still loading.
      loaded = true;

      return this;
    },

    addItem: function (result) {
      if (
        _.isUndefined(result) ||
        !result ||
        _.isUndefined(result.trans_data) ||
        _.isUndefined(result.ac_results)
      ) {
        return this;
      }

      var addedItems = [];
      var foundItems = [];

      foundItems = result.ac_results.filter(function (item) {
        return (
          item.result && item.result.CARTITEM && Object.keys(item.result.CARTITEM).length !== 0
        );
      });

      addedItems = foundItems.map(function (value) {
        var res = value.result;
        var item = res.CARTITEM;

        // Seems very dumb to calculate this on the front end.
        return Math.max(1, item.ITEM_QUANTITY - res.PREVIOUS_ITEM_QUANTITY);
      });

      behavior.setData({
        subtotal: result.trans_data.formattedSubtotal,
        points: result.trans_data.points === 0 ? 0 : result.trans_data.points || data.points,
        items: _normalizeResponseKeys(result.trans_data.order.items),
        itemCount: result.trans_data.items_count,
        newItems: _normalizeResponseKeys(addedItems)
      });

      // Temporarily set the added state:
      this.setState('added');
      state = 'added';
      closeCart = true;
      loaded = true;

      if (isMobile) {
        behavior.displayNotificationMobile(itemAddedMessage);
      } else {
        behavior.openCartOverlay();
      }
      _setCloseTimeout();

      return this;
    },

    removeItem: function ($item) {
      var params = {
        _SUBMIT: 'cart',
        SKU_BASE_ID: $item.data('sku-base-id'),
        CART_ID: $item.data('cart-id'),
        QTY: 0
      };

      generic.jsonrpc.fetch({
        method: 'rpc.form',
        params: [params],
        onSuccess: function (response) {
          $container.removeClass('cart-loading');
          var value = response.getData().trans_data;

          if (_.isUndefined(value) || !value) {
            return;
          }
          var cartItems = value.order.items.concat(value.order.samples);

          behavior.setData({
            subtotal: value.formattedSubtotal,
            points: value.points,
            itemCount: value.items_count,
            items: _normalizeResponseKeys(cartItems)
          });
          behavior.setOverlayHeight();
        },
        onFailure: function (jsonRpcResponse) {
          var errors = jsonRpcResponse.getMessages();
          var resultData = jsonRpcResponse.getData();

          $(document).trigger('removeToCart.failure', [errors, resultData]);
        }
      });
    },

    removeItemCollection: function ($item) {
      var params = {
        _SUBMIT: 'cart',
        COLLECTION_ID: $item.data('collection-id'),
        COLLECTION_NAME: $item.data('collection-name'),
        COLLECTION_TYPE: $item.data('collection-type'),
        CART_ID: $item.data('cart-id'),
        QTY: 0,
        cmode: 'del'
      };

      generic.jsonrpc.fetch({
        method: 'rpc.form',
        params: [params],
        onSuccess: function () {
          // behavior.load(true) is called again and execute a new rpc call. The main rpc call needs to be adjusted and return trans_data(items cart) to improve performance.
          behavior.load(true);
          behavior.openCartOverlay();
        },
        onFailure: function (jsonRpcResponse) {
          var errors = jsonRpcResponse.getMessages();
          var resultData = jsonRpcResponse.getData();

          $(document).trigger('removeToCart.failure', [errors, resultData]);
        }
      });
    },

    addOffer: function (result) {
      if (
        _.isUndefined(result) ||
        !result ||
        _.isUndefined(result.trans) ||
        _.isUndefined(result.items)
      ) {
        return this;
      }
      // var resultType = this.getResultType(result.ac_results);

      // var addedItems = '';
      // addedItems = _.map(result.ac_results, function(value) {
      //   var item = result.items;

      //   // Seems very dumb to calculate this on the front end.
      //   item.new_qty = Math.max(1, item.ITEM_QUANTITY - res.PREVIOUS_ITEM_QUANTITY);

      //   return item;
      // });

      this.setData({
        subtotal: result.trans.formattedSubtotal,
        points: result.trans.points === 0 ? 0 : result.trans.points || data.points,
        items: _normalizeResponseKeys(result.trans.order.items),
        itemCount: result.trans.items_count,
        newItems: _normalizeResponseKeys(result.trans.order.samples)
      });

      // Temporarily set the added state:
      this.setState('added');
      state = 'added';
      closeCart = true;
      loaded = true;
      _setCloseTimeout();

      return this;
    },

    // Setters:
    setState: function (newState) {
      var states = ['empty', 'nonempty', 'added'];
      var classPrefix = 'cart-block--';
      var stateClasses = classPrefix + states.join(' ' + classPrefix);

      // If state is undefined, figure it out:
      if (_.isUndefined(newState)) {
        state = data.itemCount > 0 ? 'nonempty' : 'empty';
        // Sanity check:
      } else if (!_.includes(states, newState)) {
        throw new Error('"' + newState + '" is not a valid cart state.');
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

    // Getters:
    getState: function () {
      return state;
    },

    getData: function (key) {
      return _.isUndefined(key) ? data : data[key];
    },

    getResultType: function (results) {
      var type = 'sku';
      var isReplenishment = _.filter(results, function (result) {
        return result.instance === 'alter_replenishment' && result.type === 'REPL';
      });

      if (isReplenishment.length > 0) {
        type = 'replenishment';
      }

      return type;
    },

    displayNotificationMobile: function (message) {
      $cartContent.addClass('hidden');
      $cartNotificationContent.html(message);
      $cartNotification.removeClass('hidden');
      // Close notification after 3 seconds
      setTimeout(function () {
        $cartNotification.addClass('hidden');
      }, 3000);
    },

    displayNotificationPc: function (message) {
      var $msg = $(message);
      var $cartHeader = $cartContent.find('.js-gnav-util-cart-content-header');

      $msg.insertAfter($cartHeader);
      behavior.setOverlayHeight();
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

    setOverlayHeight: function () {
      var siteHeaderHeight = $headerMain.outerHeight(true);
      var $siteHeaderSticky = $headerMain.find('.gnav-header-block--sticky');
      var cartHeaderHeight = $cartContent
        .find('.js-gnav-util-cart-content-header')
        .outerHeight(true);
      var cartContentBottomHeight = $cartContent
        .find('.js-gnav-util-cart-content-products-bottom')
        .outerHeight(true);
      var $cartProductsContainer = $cartContent.find('.js-gnav-util-cart-content-products-details');
      var overlayHeight;
      var productsHeight;
      var $errorContainer = $();
      var errorContainerHeight = 0;

      // If sticky nav is active then update the site header height
      if ($siteHeaderSticky.length > 0) {
        siteHeaderHeight = $headerMain.find('.gnav-header-block__inner').outerHeight(true);
      }

      $errorContainer = $('.gnav-util-cart__content-errors', $cartContent);
      errorContainerHeight = $errorContainer.length > 0 ? $errorContainer.height() : 0;

      overlayHeight = $(window).height() - siteHeaderHeight + errorContainerHeight;
      productsHeight = overlayHeight - cartHeaderHeight - cartContentBottomHeight - errorContainerHeight;

      // Set height of entire overlay to window height, less gnav offset
      $cartContent.height('auto');
      $cartContent.css('max-height', overlayHeight);
      // Set height of product list to available space
      $cartProductsContainer.height('auto');
      $cartProductsContainer.css('max-height', productsHeight);
    },

    updateCartCounter: function updateCartCounter(itemCount) {
      if (itemCount > 0) {
        // Update gnav header bag counter mobile
        setTimeout(function timeOut() {
          $(document).trigger('update_gnav_header_cart_counter', itemCount);
        }, 2000);
        // Update cart counter PC
        $counterInIcon.text(itemCount);
      }
    },

    openCartOverlay: function () {
      $cartContent.removeClass('hidden');
      behavior.displayGnavHeaderDarkOverlay();
      if (!isMobile) {
        behavior.setOverlayHeight();
      }
    },

    closeCartOverlay: function () {
      var $msg = $('.gnav-util-cart__content-errors', $cartContent);

      $cartContent.addClass('hidden');
      behavior.removeGnavHeaderDarkOverlay();
      if ($msg.length > 0) {
        $msg.remove();
      }
    }
  };

  // Document listeners:
  $(document).on('offerToCart.success', function (event, result) {
    $cartContent.removeClass('hidden');
    behavior.addOffer(result);
  });

  $(document).on('addToCart.success', function (event, result) {
    /**
     * If there is error message stored in 'result.messages[0].text',
     * treated it as error return and handled by that routine to
     * process to show out that error message in the cart overlay
     */
    if (typeof (result.messages) !== 'undefined' &&
      typeof (result.messages[0]) !== 'undefined' &&
      result.messages[0].text) {
      $(document).trigger('addToCart.failure', [result.messages, result]);
    } else {
      behavior.addItem(result);
    }
  });

  $(document).on(
    'addToCart.failure removeToCart.failure getItemsCart.failure',
    function (event, errors, result) {
      if (!isMobile) {
        if (typeof result.ac_results === 'undefined') {
          $container.removeClass('cart-loading');
        } else {
          behavior.addItem(result);
        }
      }
      // Prepare the errors messages to be displayed
      var message = '<div class="gnav-util-cart__content-errors"><ul>';

      $.each(errors, function (key, value) {
        message += '<li>' + value['text'] + '</li>';
      });
      message += '</ul></div>';

      // Display the error for PC and Mobile.
      if (isMobile) {
        behavior.displayNotificationMobile(message);
      } else {
        behavior.displayNotificationPc(message);
      }
    }
  );

  $(document).on('click', '.js-gnav-util-cart', function (event) {
    // In mobile if cart is empty then display notification
    if (isMobile && data.itemCount === 0) {
      behavior.displayNotificationMobile(emptyBagMessage);
    } else {
      // If click in trigger then redirect to checkout page
      $cartContent.addClass('hidden');
      window.location = $(this).find('.js-gnav-util-trigger--cart').attr('href');
    }
  });

  $(document).on('click', '.js-gnav-util-cart-notification-close', function () {
    $cartNotification.addClass('hidden');
  });

  $(document).on('click', '.js-product-row-info-remove', function () {
    // Check if the product to remove is collection
    if ($(this).data('collection-id')) {
      behavior.removeItemCollection($(this));
    } else {
      behavior.removeItem($(this));
    }
  });

  $(document).on('click', '.site-gnav-header-dark-overlay', function () {
    behavior.closeCartOverlay();
  });

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
