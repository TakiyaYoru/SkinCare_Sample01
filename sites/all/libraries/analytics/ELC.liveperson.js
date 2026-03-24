var site = window.site || {};
var lpTag = window.lpTag || {};

(function ($, Drupal) {
  Drupal.behaviors.analyticsLivepersonBehavior = {

    attach: function (context, settings) {
      site.elcEvents.addListener('track:liveChatManualInitiated', function () {
        var self = this;
        var eventObj = {};
        var CARD_TYPES = {
          "image-only-card": "Image only card",
          "full-content-card": "Full content card",
          "double-button-image-card": "Double button image card",
          "product-card": "Product card"
        };

        var PRODUCT_CARD_BUTTONS_TYPES = {
          "XrfY-1": "first-btn",
          "XrfY-2": "second-btn"
        };

        var PRODUCT_CARD_DATA_TYPES = {
          "details": "details",
          "add-to-cart": "add-to-cart"
        };

        var EVENT_TYPES = {
          IMPRESSION: "IMPRESSION",
          CLICK: "CLICK"
        }

        var loaded = false;

        setTimeout(function () {
          if (lpTag && lpTag.hooks) {
            lpTag.hooks.push({
              name: "AFTER_GET_LINES",
              callback: function (data) {
                if (data.data.lines.length) {
                  data.data.lines.forEach(function (el) {
                    if (el.type === "richContent") {
                      let metadata;
                      if (el.metadata && el.metadata.length) {
                        metadata = el.metadata[0];
                      }

                      // Installing click handlers
                      setTimeout(function () {
                        if (el.hasOwnProperty('quickReplies')) setListener(el.localId, metadata);
                      }, 200);
                    }
                  });

                  if (loaded && data.data.lines[data.data.lines.length - 1].hasOwnProperty('quickReplies')) {
                    // New card acquisition
                    cardImpression([data.data.lines[data.data.lines.length - 1]]);
                  }
                }

                loaded = true;
              }
            })
          }
        })
        // Analytic logic
        // Installing click handlers to card
        function setListener(id, metadata) {
          var selector = "#lp_line_bubble_" + id + " .lp-json-pollock";

          var element = document.querySelector(selector);
          if (element) element.addEventListener("click", clickHandler.bind(null, metadata));
        }

        // Added addEventListener for Product card click section start.
        window.addEventListener('details_product_card_button_clicked', (event) => {
          var chatCardProdId = event?.detail?.product_id || event?.detail?.productId;
          eventObj.enh_action = 'product_click';
          eventObj.product_position = '1';
          eventObj.product_list = ['liveperson_livechat'];
          eventObj.product_id = ['PROD' + chatCardProdId];
          if (chatCardProdId) {
            trackEvent('liveperson', 'liveperson text chat', 'product click', 'product click', eventObj);
          }
        });

        window.addEventListener('add_to_cart_product_card_button_clicked', (event) => {
          document.cookie = 'liveChatAddToBagClick=1';
        });

        function trackEvent(eName, eCategory, eAction, elabel, eventObj) {
          eventObj = eventObj || {};
          Object.assign(eventObj, {
            event_name: eName,
            event_category: eCategory,
            event_action: eAction,
            event_label: elabel
          });
          site.track.evtLink(eventObj);
        }
        // Added addEventListener for Product card click section end.

        // Click event handling on card
        function clickHandler(metadata, e) {
          var target = e.target;
          var targetNodeName = target.nodeName;
          var data = JSON.parse(metadata)

          if (targetNodeName === 'BUTTON' && data.type === !CARD_TYPES['product-card']) {
            var analyticsData = getAnalyticTemplates(metadata, EVENT_TYPES.CLICK);
            if (analyticsData) sendAnalytic(analyticsData);
          }
        }

        // New card acquisition event handler.
        function cardImpression(dataList) {
          if (dataList[0] && dataList[0].type === "richContent" && dataList[0].metadata && dataList[0].metadata.length > 0) {
            var analyticsData = getAnalyticTemplates(
              dataList[0].metadata[0],
              EVENT_TYPES.IMPRESSION
            );
            if (analyticsData) sendAnalytic(analyticsData);
          }
        }

        // Defining templates based on metadata, eventType and dataType
        function getAnalyticTemplates(metadata, eventType, dataType) {
          var data = JSON.parse(metadata);
          var cardType = data.type;
          var promoId = cardType + ' - liveperson content card - ';
          var prodId;
          var image;

          if (data.productId) prodId = 'PROD' + data.productId;
          if (data.imageUrl) {
            image = data.imageUrl.split('/');
            image = image[image.length - 1]
          }

          if (cardType === CARD_TYPES['full-content-card']
            || cardType === CARD_TYPES['double-button-image-card']
            || cardType === CARD_TYPES['image-only-card']) {
            if (eventType === EVENT_TYPES.IMPRESSION) {
              site.track.evtView({
                imp_promo_pos: [cardType],
                imp_promo_creative: ['liveperson content card'],
                imp_promo_name: [image],
                imp_promo_id: [promoId + image]
              });
            }

            if (eventType === EVENT_TYPES.CLICK) {
              return {
                event_name: 'content_module_click',
                enh_action: 'promo_click',
                event_category: 'ecommerce',
                event_action: 'promotion click',
                event_label: "banner click | ['" + image + "']",
                imp_promo_pos: [cardType],
                imp_promo_creative: ['liveperson content card'],
                imp_promo_name: [image],
                imp_promo_id: [promoId + image]
              };
            }
          }

          if (cardType === CARD_TYPES["product-card"]) {
            if (eventType === EVENT_TYPES.CLICK) {
              if (dataType === PRODUCT_CARD_DATA_TYPES["details"]) {
                return {
                  event_name: 'liveperson',
                  event_category: 'liveperson text chat',
                  event_action: 'product click',
                  event_label: 'product click',
                  enh_action: 'product_click',
                  product_position: '1',
                  product_list: ['liveperson_livechat'],
                  product_id: [prodId]
                };
              }

              if (dataType === PRODUCT_CARD_DATA_TYPES["add-to-cart"]) {
                return {
                  event_name: 'liveperson',
                  event_category: 'liveperson text chat',
                  event_action: 'product detail',
                  event_label: 'view',
                  enh_action: 'detail',
                  product_id: [prodId]
                };
              }
            }

            if (eventType === EVENT_TYPES.IMPRESSION) {
              return analyticsData = {
                event_name: 'liveperson',
                event_category: 'liveperson text chat',
                event_action: 'product impression',
                event_label: prodId,
                product_impression_id: [prodId],
                liveperson_product_chat: ['liveperson_livechat'],
                product_impression_list: ['liveperson_livechat'],
                event_noninteraction: 'true'
              };
            }
          }
        }

        // Sending analytics data
        function sendAnalytic(analyticsData) {
          site.track.evtLink(analyticsData);
        }
      });
    },

  };
})(jQuery, Drupal);
