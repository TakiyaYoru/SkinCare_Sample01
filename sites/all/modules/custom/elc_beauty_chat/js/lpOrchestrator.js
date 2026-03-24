/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
var lpTag = window.lpTag || {};
var site = window.site || {};

(function () {
  site.lpBeautyChatOrcData = {
    divId: 'beauty_global_drawer',
    engId: '',
    isLoopActive: false,
    isUserAwaitingChat: false,
    intentLoopTimeoutDefault: 15,
    intentLoopTimeoutCounter: 15,
    intentLoopFinishedEventName: 'beauty_global_drawer_intent_loop_complete',
    errorMessageEventName: 'beauty_chat_drawer_error',
    service: 'lp'
  };
  site.lpSupportChatOrcData = {
    divId: 'cs_global_drawer',
    engId: '',
    isLoopActive: false,
    isUserAwaitingChat: false,
    intentLoopTimeoutDefault: 15,
    intentLoopTimeoutCounter: 15,
    intentLoopFinishedEventName: 'cs_global_drawer_intent_loop_complete',
    errorMessageEventName: 'support_chat_drawer_error',
    service: 'lp'
  };
  site.lpChatOrcData = {
    divId: '',
    engId: '',
    isLoopActive: false,
    isUserAwaitingChat: false,
    intentLoopTimeoutDefault: 15,
    intentLoopTimeoutCounter: 15,
    intentLoopFinishedEventName: 'global_chat_intent_loop_complete',
    errorMessageEventName: 'chat_button_error',
    service: 'lp'
  };

  function initEngagement(divId, engId) {
    switch (divId) {
      case site.lpBeautyChatOrcData.divId:
        site.lpBeautyChatOrcData.engId = engId;

        return true;
      case site.lpSupportChatOrcData.divId:
        site.lpSupportChatOrcData.engId = engId;

        return true;
      case site.lpChatOrcData.divId:
        site.lpChatOrcData.engId = engId;

        return true;
      default:
        console.error(
          'lpOrchestrator.initEngagement(): The div id used in this script is not recognized:  ' +
            divId +
            ' - The chat module for this site is misconfigured. Notify a Global Chat Team member immediately.'
        );

        return false;
    }
  }

  function verifyEngagementIsReady(divId) {
    var engId = '';
    var success = false;
    var lpEngagementDiv = document.getElementById(divId);

    if (!lpEngagementDiv) {
      console.error(
        'lpOrchestrator.initEngagement(): The LivePerson HTMLEngagement div was not found: ' +
          divId +
          ' - The chat module for this site is misconfigured. Notify a Global Chat Team member immediately.'
      );

      return false;
    }

    if (
      lpEngagementDiv.children.length === 0 ||
      lpEngagementDiv.children[0].children.length === 0
    ) {
      return false;
    }

    engId = lpEngagementDiv.children[0].children[0].getAttribute('data-lp-engagement-id');

    if (!engId) {
      return false;
    }

    success = initEngagement(divId, engId);

    return success;
  }

  function verifyLivePersonIsReady() {
    if (lpTag && lpTag.taglets && lpTag.taglets.rendererStub) {
      return true;
    }

    return false;
  }

  function verifyServiceIsReady(divId) {
    var isLivePersonReady = verifyLivePersonIsReady();
    var isEngagementReady = false;

    if (!isLivePersonReady) {
      return false;
    }
    isEngagementReady = verifyEngagementIsReady(divId);
    if (!isEngagementReady) {
      return false;
    }

    return true;
  }

  function performEngagementClick(engId) {
    var success = false;

    if (engId) {
      success = lpTag.taglets.rendererStub.click(engId);
    }

    return success;
  }

  function verifyOpenSalesforceChatIsReady() {
    if (typeof openSalesforceChat === 'function') {
      return true;
    }

    return false;
  }

  function verifyButtonDisabledIsReady() {
    if (window.embedded_svc && !window.embedded_svc.isButtonDisabled) {
      return true;
    }

    return false;
  }

  function handleServiceError(divId, engId, lpErrorMessageEvent) {
    document.dispatchEvent(lpErrorMessageEvent);
    if (divId !== 'sf') {
      throw new Error(
        `lpOrchestrator: The attempt to initiate a LivePerson chat session was unsuccessful. The div id is: ${divId}. The engagement id is: ${
          engId || 'EMPTY'
        }. Notify a Global Chat Team member immediately.`
      );
    }
  }

  function handleIntervalFail(chatOrcData, lpErrorMessageEvent, intentLoop) {
    chatOrcData.intentLoopTimeoutCounter--;
    if (chatOrcData.intentLoopTimeoutCounter === 0) {
      clearInterval(intentLoop);
      chatOrcData.isLoopActive = false;
      document.dispatchEvent(lpErrorMessageEvent);
    }
  }

  function verifySalesforceChat(chatOrcData, lpErrorMessageEvent, intentLoop) {
    const chatIsReady = verifyOpenSalesforceChatIsReady();

    if (!chatIsReady) {
      handleIntervalFail(chatOrcData, lpErrorMessageEvent, intentLoop);

      return;
    }
    const buttonIsReady = verifyButtonDisabledIsReady();

    if (!buttonIsReady) {
      handleIntervalFail(chatOrcData, lpErrorMessageEvent, intentLoop);

      return;
    }

    return buttonIsReady;
  }

  async function startIntentLoop(divId) {
    var chatOrcData = {};
    var eventName;
    var errorEventName;
    var lpIntentLoopCompleteEvent;
    var lpErrorMessageEvent;
    var intentLoop;

    switch (divId) {
      case site.lpBeautyChatOrcData.divId:
        chatOrcData = site.lpBeautyChatOrcData;
        break;
      case site.lpSupportChatOrcData.divId:
        chatOrcData = site.lpSupportChatOrcData;
        break;
      case site.lpChatOrcData.divId:
        chatOrcData = site.lpChatOrcData;
        break;
      default:
        console.error(
          'lpOrchestrator: The div id used in the function startIntentLoop() is not recognized:  ' +
            divId +
            ' - The chat module for this site is misconfigured. Notify a Global Chat Team member immediately.'
        );

        return;
    }

    if (Object.keys(chatOrcData).length === 0) {
      throw new Error(
        'lpOrchestrator: The lp__ChatOrcData object is empty. Something is wrong. Notify a Global Chat Team member immediately.'
      );
    }

    chatOrcData.isLoopActive = true;
    chatOrcData.isUserAwaitingChat = true;

    eventName = chatOrcData.intentLoopFinishedEventName;
    errorEventName = chatOrcData.errorMessageEventName;
    lpIntentLoopCompleteEvent = new Event(eventName, { bubbles: true });
    lpErrorMessageEvent = new Event(errorEventName, { bubbles: true });
    intentLoop = setInterval(function () {
      if (divId === 'sf') {
        chatOrcData.service = 'sf';
        const buttonIsReady = verifySalesforceChat(chatOrcData, lpErrorMessageEvent, intentLoop);

        if (buttonIsReady) {
          window.openSalesforceChat();
          window.embedded_svc.addEventHandler('onChatRequestSuccess', function () {
            clearInterval(intentLoop);
            chatOrcData.isLoopActive = false;
            document.dispatchEvent(lpIntentLoopCompleteEvent);
          });
          handleIntervalFail(chatOrcData, lpErrorMessageEvent, intentLoop);
        } else {
          handleServiceError(divId, chatOrcData.engId, lpErrorMessageEvent, intentLoop);
        }
      } else {
        let success = false;
        const isReady = verifyServiceIsReady(divId);

        if (!isReady) {
          handleIntervalFail(chatOrcData, lpErrorMessageEvent);

          return;
        }
        success = performEngagementClick(chatOrcData.engId);
        if (success) {
          chatOrcData.isLoopActive = false;
          document.dispatchEvent(lpIntentLoopCompleteEvent);
        } else {
          handleServiceError(divId, chatOrcData.engId, lpErrorMessageEvent);
        }
      }
    }, 1000);

    document.addEventListener(eventName, function () {
      clearInterval(intentLoop);
      chatOrcData.intentLoopTimeoutCounter = chatOrcData.intentLoopTimeoutDefault;
      chatOrcData.isUserAwaitingChat = false;
    });
  }

  // Fires when the user clicks the Beauty Chat button in the drawer
  site.onBeautyChatButtonClick = function (chatProvider) {
    if (chatProvider === 'sf') {
      site.lpBeautyChatOrcData.divId = chatProvider;
    }
    if (site.lpBeautyChatOrcData.isLoopActive) {
      return;
    }
    startIntentLoop(site.lpBeautyChatOrcData.divId);
  };

  // Fires when the user clicks the Support Chat button in the drawer
  site.onSupportChatButtonClick = function (chatProvider) {
    if (chatProvider === 'sf') {
      site.lpSupportChatOrcData.divId = chatProvider;
    }
    if (site.lpSupportChatOrcData.isLoopActive) {
      return;
    }
    startIntentLoop(site.lpSupportChatOrcData.divId);
  };

  // Fires when the user clicks the Chat button
  site.onChatButtonClick = function (divId) {
    site.lpChatOrcData.divId = divId;
    if (site.lpChatOrcData.isLoopActive) {
      return;
    }
    startIntentLoop(site.lpChatOrcData.divId);
  };
})();
