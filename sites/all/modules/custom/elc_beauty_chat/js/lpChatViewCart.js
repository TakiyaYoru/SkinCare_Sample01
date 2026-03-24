var site = window.site || {};
var generic = window.generic || {};
var lpTag = window.lpTag || {};

(function ($) {
  function lc_loyalty_points() {
    site.userInfoCookie = site.userInfoCookie || {};
    site.userInfoCookie.getValue =
      site.userInfoCookie.getValue ||
      function () {
        return '';
      };

    var signedIn = parseInt(site.userInfoCookie.getValue('signed_in'));
    var isLoyaltyMember = parseInt(site.userInfoCookie.getValue('is_loyalty_member'));

    if (signedIn && isLoyaltyMember) {
      var paramObj = {
        offer_code: 'lyl_livechat',
        do_not_defer_messages: 1
      };

      generic.jsonrpc.fetch({
        method: 'offers.apply',
        params: [paramObj],
        onSuccess: function (jsonRpcResponse) {
          var results = jsonRpcResponse.getValue();

          if (results) {
            // Display the success overlay
            generic.overlay.launch({
              content: $("script.inline-template[path='live_chatinfo_popup']").html(),
              width: 535,
              height: 310,
              cssClass: 'live_chatinfo_popup_overlay',
              onOpen: function () { }
            });
          }
        }
      });
    }
  }

  if (lpTag && lpTag.events && lpTag.events.bind) {
    lpTag.events.bind({
      eventName: 'state',
      appName: 'lpUnifiedWindow',
      func: function (chat) {
        const { state } = chat;

        switch (state) {
          case 'init':
            $('.sticky-chat').hide();
            break;
          case 'chatting':
            $('.sticky-chat').hide();
            break;
          case 'ended':
            lc_loyalty_points();
            $('.sticky-chat').removeClass('expanded');
            $('.sticky-chat').show();
            break;
          default:
            break;
        }
      }
    });
  }

  $('.chat-now-btn').on('click', function () {
    $('.sticky-chat').hide();
  });

  $(document).on('click', '.lp_close', function () {
    $('.sticky-chat').removeClass('expanded');
    $('.sticky-chat').show();
  });

  $(document).on('addToCart.success', function (event, data) {

    var enablePgRestApiAtb = false;
    var cartInformation = {};
    var wrappedResponse = '';
    var cartItems = '';
    var cartResults = '';
    var cartTrans = '';

    enablePgRestApiAtb = Drupal?.settings?.pg_rest_api?.cart?.enabled;

    if (enablePgRestApiAtb) {
      wrappedResponse = generic.checkout.cart.wrapAjaxResponse(data);
      cartItems = wrappedResponse.getOrderItems();
      cartResults = wrappedResponse.getCartResults();
      cartTrans = cartResults.trans;
    } else {
      cartItems = data.trans_data?.order?.items;
      cartTrans = data.trans_data;
    }

    if (!cartItems && typeof data.getAllItems === 'function') {
      cartItems = data.getAllItems();
    }

    if (cartTrans === undefined || cartTrans === '') {
      /* Added due to trans_data not being present on the call from the POA quik shop page */
      return 1;
    }

    cartInformation['type'] = 'cart';
    cartInformation['total'] = 0;
    cartInformation['numItems'] = enablePgRestApiAtb ? cartResults.trans_items_count : cartItems.length;
    cartInformation['products'] = [];

    cartItems.forEach((item) => {
      const product = {
        product: {
          name: enablePgRestApiAtb ? item?.product['PROD_RGN_NAME'] : item['prod.PROD_RGN_NAME'],
          category: enablePgRestApiAtb ? item?.product['FAMILY_CODE'] : item['prod.FAMILY_CODE'],
          sku: enablePgRestApiAtb ? item?.product?.sku['SKU_ID'] : item['sku.SKU_ID'],
          price: item['UNIT_PRICE']
        },
        quantity: item['ITEM_QUANTITY']
      };

      cartInformation.total += item['APPLIED_PRICE'];
      cartInformation.products.push(product);
    });

    lpTag.sdes = lpTag.sdes || [];
    lpTag.sdes.push(cartInformation);
  });
  /* END LivePerson View cart Monitor. */

  /* Visitor Error Track */
  function lpTrackVisitorError(message, code) {
    lpTag.sdes = lpTag.sdes || [];
    lpTag.sdes.push({
      type: 'error',
      error: {
        message: message,
        code: code
      }
    });
  }

  $(document).one('endeca.search.results.loaded', function (event, data) {
    var errorTag = {
      no_search_result: {
        message: 'No items found matching',
        code: 'er100004'
      }
    };
    var productData = data.results.products.resultData || {};

    if (productData.length === 0) {
      if (lpTag) {
        lpTrackVisitorError(
          errorTag['no_search_result']['message'],
          errorTag['no_search_result']['code']
        );
      }
    }
  });
})(jQuery);
