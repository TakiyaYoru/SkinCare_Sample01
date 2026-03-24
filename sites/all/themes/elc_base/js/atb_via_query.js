(function() {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);
  const submitMethod = searchParams.get('_SUBMIT');
  const settings = Drupal.settings.atb;

  if (submitMethod && submitMethod === 'cart') {
    const productCodes = searchParams.getAll('PRODUCT_CODE');
    const skuBaseIds = searchParams.getAll('SKU_BASE_ID');
    const requestKey = productCodes.length ? 'PRODUCT_CODE' : (skuBaseIds.length ? 'SKU_BASE_ID' : null);
    const requestIds = productCodes.length ? productCodes : skuBaseIds;

    if (!!requestKey) {
      const requests = [];

      requestIds.forEach((item) => {
        const splitItem = item.split(':');
        const qtyItem = searchParams.get('QTY');
        const requestId = requestKey === 'SKU_BASE_ID' ? parseInt(splitItem[0]) : splitItem[0];

        if (requestId) {
          const params = {
            _SUBMIT: 'cart',
            [requestKey]: [requestId],
            QTY: parseInt(splitItem[1] ? splitItem[1] : qtyItem ? qtyItem : 1),
            INCREMENT: parseInt(1)
          };

          requests.push(params);
        }
      });

      window.addEventListener('DOMContentLoaded', () => {
        // The global jsonrpc has an internal method for getting the token. We'll
        // check if that method exists as a cheap way to detect csrf support
        const supportsCsrf = !!generic.jsonrpc.hasOwnProperty('getCsrfToken');
        const hasGlobalCart = generic && generic.checkout && generic.checkout.cart && generic.checkout.cart.updateCart;

        const addToBag = function(request) {
          if (hasGlobalCart) {
            generic.checkout.cart.updateCart({
              params: {
                itemType: 'cart',
                skus: request.SKU_BASE_ID,
                QTY: request.QTY,
                INCREMENT: request.INCREMENT
              },
              onSuccess: function(r) {
                var data;
                switch (settings.brand) {
                  case 'esteelauder':
                    data = r.getCartResults();
                    break;
                  default:
                    data = r.getData();
                }
                $(document).trigger('addToCart.success', [data]);
              },
              onFailure: function(r) {
                console.log('Item not added to cart', { messages: r.getMessages() });
              }
            });
          } else {
            generic.jsonrpc.fetch({
              method: 'rpc.form',
              params: [request],
            });
          }
        };

        const resolveQueue = function(requests) {
          requests.forEach((request) => {
            addToBag(request);
          });
        };

        if (supportsCsrf) {
          resolveQueue(requests);
        }
        else {
          generic.jsonrpc.fetch({
            method: 'csrf.getToken',
            onSuccess: () => {
              const token = $.cookie('csrftoken');
              resolveQueue(
                !!token ? requests.map(r => Object.assign(r, { _TOKEN: token })) : requests
              );
            }
          });
        }
      });
    }
  }
})();
