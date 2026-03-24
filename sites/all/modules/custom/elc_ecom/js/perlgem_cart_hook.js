(function($, ServiceBus, Topics) {
  const PerlgemCartHook = function(ServiceBus) {
    const getProductSkuMap = function(product) {
      return function(skuData, sku) {
        const { skus, ...productDetails } = product;
        const newSku = { ...productDetails, ...sku };

        return { ...skuData, [sku.skuId]: newSku };
      }
    };
    const mapProductSkusById = function(data, product) {
        const skusData = product.skus.reduce(getProductSkuMap(product), {});
    
        return { ...data, ...skusData };
    };
    const buildQueryOptions = function(skuIds) {
      return {
        filterBy: { skus: { skuIds } },
        query: `
            items {
                skus {
                    items {
                        perlgem { 
                          SKU_BASE_ID 
                        }
                    }
                }
            }
        `
      }
    }
    return {
      beforeQuery: function(queryName, payload, next) {
        switch (queryName) {
          case Topics.commands.CART_ADD_ITEM: {
            if (payload && payload.skuId) {
              if (ServiceBus.log) {
                ServiceBus.log({
                  message: 'pg_'.concat(Topics.commands.CART_ADD_ITEM),
                  payload: { context: payload }
                });
              }
              ServiceBus.query(Topics.queries.GET_PRODUCT_DATA, buildQueryOptions([payload.skuId])).then(function(products) {
                const skus = products.reduce(mapProductSkusById, {});
                const sku = skus[payload.skuId];
                if (sku && sku.perlgem && sku.perlgem.SKU_BASE_ID) {
                  if (ServiceBus.log) {
                    ServiceBus.log({
                      message: 'pg_'.concat(Topics.queries.GET_PRODUCT_DATA),
                      payload: { context: Object.assign(payload, { skus, sku }) }
                    });
                  }
                  $(document).trigger('perlgem.cart.addItem', [sku.perlgem.SKU_BASE_ID, payload]);
                }
              });
            }
            return;
          }
          case Topics.commands.CART_OVERLAY_SHOW: {
            return;
          }
          default: {
            return next(queryName, payload);
          }
        }
      },
      afterEmit: function(eventName, payload, next) {
        if (Topics && Topics.events && Topics.events.ADD_SKU_TO_COLLECTION_TRIGGERED) {
          switch (eventName) {
            case Topics.events.ADD_SKU_TO_COLLECTION_TRIGGERED: {
              if (payload && payload.skuId) {
                if (ServiceBus.log) {
                  ServiceBus.log({
                    message: 'pg_'.concat(Topics.events.ADD_SKU_TO_COLLECTION_TRIGGERED),
                    payload: { context: payload }
                  });
                }
                ServiceBus.query(Topics.queries.GET_PRODUCT_DATA, buildQueryOptions([payload.skuId])).then(function(products) {
                  const skus = products.reduce(mapProductSkusById, {});
                  const sku = skus[payload.skuId];
                  if (sku && sku.perlgem && sku.perlgem.SKU_BASE_ID) {
                    if (ServiceBus.log) {
                      ServiceBus.log({
                        message: 'pg_'.concat(Topics.queries.GET_PRODUCT_DATA),
                        payload: { context: Object.assign(payload, { skus, sku }) }
                      });
                    }
                    $(document).trigger('perlgem.addToCollection', [sku.perlgem.SKU_BASE_ID, payload]);
                  }
                });
              }
              return;
            }
            default: {
              if (next) {
                return next(eventName, payload);
              } else {
                break;
              }
            }
          }
        }
      }
    };
  };
  ServiceBus.applyHook(PerlgemCartHook);
})(jQuery, window.GlobalServiceBus || {}, window.ServiceBusTopics || {});
