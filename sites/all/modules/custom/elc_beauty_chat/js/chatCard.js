/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
(function () {
  function createClickEvent(eventName, clickedElem, payload) {
    try {
      const lpCustomEvent = new CustomEvent(eventName, {
        bubbles: true,
        detail: payload
      });

      clickedElem.addEventListener('click', function () {
        document.dispatchEvent(lpCustomEvent);
      });
    } catch (error) {
      console.error('LIVECHAT ERROR: ' + error);
    }
  }

  function registerChatCardEvents() {
    try {
      const selectors = [
        {
          buttons: document.querySelectorAll(
            '.lp-json-pollock:has([title^="BrrFen-1"], .BrrFen-1) button[aria-label^="XrfY-1"]'
          ),
          eventName: 'details_product_card_button_clicked'
        },
        {
          buttons: document.querySelectorAll(
            '.lp-json-pollock:has([title^="BrrFen-1"], .BrrFen-1) button[aria-label^="XrfY-2"]'
          ),
          eventName: 'add_to_cart_product_card_button_clicked'
        }
      ];
      const product = {
        productId: '',
        skuId: '',
        skuBaseId: ''
      };
      // Check if the event was already registered for this element
      const processButton = (element, eventName) => {
        if (
          element.hasAttribute('data-event-registered') ||
          element.hasAttribute('data-error-logged')
        ) {
          return;
        }

        const data = element.getAttribute('aria-label');
        const dataArr = data.split(' ');
        let foundProductId = false;
        let foundSkuId = false;
        let foundSkuBaseId = false;

        dataArr.forEach((item) => {
          if (item.startsWith('productId-')) {
            product.productId = item.split('-')[1];
            foundProductId = true;
          } else if (item.startsWith('skuId-')) {
            product.skuId = item.split('-')[1];
            foundSkuId = true;
          } else if (item.startsWith('skuBaseId-')) {
            product.skuBaseId = item.split('-')[1];
            foundSkuBaseId = true;
          }
        });

        if (foundProductId && foundSkuId && foundSkuBaseId) {
          element.setAttribute('data-event-registered', 'true');
          createClickEvent(eventName, element, product);
        } else {
          // Mark the element to indicate the error has been logged
          element.setAttribute('data-error-logged', 'true');
          console.warn(`LIVECHAT WARN: NO PRODUCT DATA!`, element);
        }
      };

      selectors.forEach(({ buttons: buttons, eventName }) => {
        buttons.forEach((element) => processButton(element, eventName));
      });
    } catch (error) {
      console.error('LIVECHAT ERROR: ' + error);
    }
  }
  try {
    window.lpTag = window.lpTag || {};
    window.lpTag.hooks = window.lpTag.hooks || [];

    window.lpTag.hooks.push({
      name: 'AFTER_GET_LINES',
      callback: function () {
        try {
          const structuredMenuTitles =
            '.lp-json-pollock:not(:has([title^="BrrFen-1"], .BrrFen-1) > div.lp-json-pollock)>div>div.lpc_card__text:nth-of-type(1)';
          const titleElem = document.querySelectorAll(structuredMenuTitles);
          // Get inline styles of brand message bubble
          const agentMessageBubble =
            document.getElementById('lp_line_bubble_0');

          if (agentMessageBubble) {
            const agentMessageBubbleStyles =
              window.getComputedStyle(agentMessageBubble);
            const agentMessageBubbleChildStyles = window.getComputedStyle(
              agentMessageBubble.firstChild
            );
            const backgroundColor = agentMessageBubbleStyles.backgroundColor;
            const borderColor = agentMessageBubbleStyles.borderColor;
            const fontColor = agentMessageBubbleChildStyles.color;
            // Go through elems, apply styles & existing classes to make menu title as an agent msg

            titleElem.forEach((element) => {
              element.classList.add(
                'lp_new_chat_line',
                'lpc_message',
                'lpc_message_agent',
                'lpc_message_avatar-hidden'
              );
              element.style.backgroundColor = backgroundColor;
              element.style.borderColor = borderColor;
              element.style.color = fontColor;
            });
          }
          // Add shade indicator background color
          const shadeIndicators =
            '.lp-json-pollock .BrrFen-2, .lp-json-pollock [title^="BrrFen-2"]';
          const shadeElems = document.querySelectorAll(shadeIndicators);

          shadeElems.forEach((element) => {
            const shadeColor = element.innerHTML;

            element.style.background = shadeColor;
          });
          registerChatCardEvents();
        } catch (error) {
          console.error('LIVECHAT ERROR: ' + error);
        }
      }
    });
  } catch (error) {
    console.error('LIVECHAT ERROR: ' + error);
  }
})();
