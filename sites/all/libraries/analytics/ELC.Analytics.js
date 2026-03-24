/*global utag*/
(function(site, utag_data) {
  var serviceBusCartOverlayEvt = false;
  var tealium = {
    evtAction: function(action, obj, callback) {
      tealiumAPI(
        actionMethodLookup[action],
        Object.assign({}, tealiumBaseObjs[action], obj),
        callback
      );
    },

    evtLink: function(obj, callback) {
      tealiumAPI('link', obj, callback);
    },

    evtView: function(obj, callback) {
      tealiumAPI('view', obj, callback);
    },

    refreshData: function() {
      utag_data = window.utag_data;
      return utag_data;
    },

    disableDefaultPageView: function() {
      window.utag_cfg_ovrd = window.utag_cfg_ovrd || {};
      window.utag_cfg_ovrd.noview = true;
    },

    addToCart: addToCart,
    addToFavorites: addToFavorites,
    checkoutOPC: checkoutOPC,
    checkoutSampleAdded: checkoutSampleAdded,
    checkoutPaymentSelected: checkoutPaymentSelected,
    emailSignup: emailSignup,
    getRecAIProdData: getRecAIProdData,
    liveChatManualInitiated: liveChatManualInitiated,
    liveChatManualPreSurvey: liveChatManualPreSurvey,
    liveChatManualWaiting: liveChatManualWaiting,
    liveChatManualChatInitialize: liveChatManualChatInitialize,
    liveChatManualChatended: liveChatManualChatended,
    liveChatManualChatting: liveChatManualChatting,
    liveChatProactiveDisplayed: liveChatProactiveDisplayed,
    liveChatProactiveInitiated: liveChatProactiveInitiated,
    liveChatProactivePreSurvey: liveChatProactivePreSurvey,
    liveChatProactiveWaiting: liveChatProactiveWaiting,
    liveChatProactiveChatting: liveChatProactiveChatting,
    loyaltyTag: loyaltyTag,
    navigationClick: navigationClick,
    offerFailed: offerFailed,
    offerSuccessful: offerSuccessful,
    productClick: productClick,
    profileUpdate: profileUpdate,
    questionAnswer: questionAnswer,
    questionAsk: questionAsk,
    questionAskSearch: questionAskSearch,
    quickView: quickView,
    removeFromCart: removeFromCart,
    registration: registration,
    reviewRead: reviewRead,
    reviewWriteStart: reviewWriteStart,
    reviewWriteEnd: reviewWriteEnd,
    sortReviews: sortReviews,
    rateReviews: rateReviews,
    searchReviews: searchReviews,
    filterReviews: filterReviews,
    sortAnswers: sortAnswers,
    rateAnswers: rateAnswers,
    addAnswerStart: addAnswerStart,
    addAnswerEnd: addAnswerEnd,
    showMoreAnswers: showMoreAnswers,
    searchPageLoaded: searchPageLoaded,
    searchPredicted: searchPredicted,
    searchRedirect: searchRedirect,
    signin: signin,
    signinFailed: signinFailed,
    emailWishlist: emailWishlist,
    skuChange: skuChange,
    productThumbnailClick: productThumbnailClick,
    trackBopisEvent: trackBopisEvent,
    cartOverlay: cartOverlay,
    cancelOrder: cancelOrder,
    oneClickcheckout: oneClickcheckout,
    altImageZoomSelected: altImageZoomSelected,
    giftWrapEnable: giftWrapEnable,
    applePayButtonClick: applePayButtonClick,
    searchOverlayOpen: searchOverlayOpen,
    applePayOverlay: applePayOverlay,
    payPalButtonActions: payPalButtonActions,
    addPaymentInfo: addPaymentInfo,
    joinFormLoyalty: joinFormLoyalty
  };

  var actionMethodLookup = {
    addToCart: 'link',
    addToFavorites: 'link',
    checkoutGuestUser: 'link',
    checkoutSampleAdded: 'link',
    checkoutPaymentSelected: 'link',
    checkoutOPC: 'view',
    checkoutReturnUser: 'link',
    emailSignup: 'link',
    filterProducts: 'link',
    getRecAIProdData: 'link',
    liveChatManualInitiated: 'link',
    liveChatManualPreSurvey: 'link',
    liveChatManualWaiting: 'link',
    liveChatManualChatInitialize: 'link',
    liveChatManualChatended: 'link',
    liveChatManualChatting: 'link',
    liveChatProactiveDisplayed: 'link',
    liveChatProactiveInitiated: 'link',
    liveChatProactivePreSurvey: 'link',
    liveChatProactiveWaiting: 'link',
    liveChatProactiveChatting: 'link',
    loyaltyTag: 'link',
    navigationClick: 'link',
    offerFailed: 'link',
    offerSuccessful: 'link',
    productClick: 'link',
    profileUpdate: 'link',
    questionAnswer: 'link',
    questionAsk: 'link',
    questionAskSearch: 'link',
    quickView: 'link',
    removeFromCart: 'link',
    registration: 'link',
    reviewRead: 'link',
    reviewWriteStart: 'link',
    reviewWriteEnd: 'link',
    sortReviews: 'link',
    rateReviews: 'link',
    searchReviews: 'link',
    filterReviews: 'link',
    sortAnswers: 'link',
    rateAnswers: 'link',
    addAnswerStart: 'link',
    addAnswerEnd: 'link',
    showMoreAnswers: 'link',
    searchAllResultsSelected: 'link',
    searchOneResultSelected: 'link',
    searchIRBannerDisplayed: 'link',
    searchIRBannerClicked: 'link',
    searchIRTryAgainClicked: 'link',
    searchResultsRedirect: 'link',
    searchPageLoaded: 'link',
    searchPredicted: 'link',
    searchRedirect: 'link',
    signin: 'link',
    signinFailed: 'link',
    emailWishlist: 'link',
    skuChange: 'link',
    socialLink: 'link',
    productThumbnailClick: 'link',
    cartOverlay: 'link',
    oneClickcheckout: 'link',
    // BOPIS
    sppOpenPostmatesOverlay: 'link',
    sppOpenBopisOverlay: 'link',
    bopisStoreClick: 'link',
    bopisSearch: 'link',
    bopisSearchCurrentLocation: 'link',
    bopisSelectStore: 'link',
    bopisSelectDeliveryOption: 'link',
    bopisSearchResults: 'link',
    bopisEditBagAction: 'link',
    bopisRemoveUnavailableItems: 'link',
    bopisEditBagClick: 'link',
    bopisEditDeliveryType: 'link',
    cartPostamatesStatus: 'link',
    cancelOrder: 'link',
    altImageZoomSelected: 'link',
    giftWrapEnable: 'link',
    applePayButtonClick: 'link',
    searchOverlayOpen: 'link',
    applePayOverlay: 'link',
    payPalButtonActions: 'link',
    addPaymentInfo: 'link',
    joinFormLoyalty: 'link'
  };

  var tealiumBaseObjs = {
    addToCart: {
      'enh_action': 'add',
      'event_name': 'add_to_bag',
      'event_category': 'ecommerce',
      'event_action': 'add to bag',
      'event_label': null, // '<product name> - <product ID>'
      'product_id': null, // '<product id>'
      'product_shade': null, // '<product shade>'
      'product_size': null, // '<product size>'
      'product_sku': null // '<sku id>'
    },

    addToFavorites: {
      'event_name': 'add_to_favorites',
      'event_category': 'ecommerce',
      'event_action': 'add to favorites',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': null // '<product name> - <product ID>'
    },

    checkoutSampleAdded: {
      'event_name': 'samples',
      'event_category': 'samples',
      'event_action': 'samples added',
      'event_value': '0',
      'event_label': null // <sample name - SKU ID - sample category>
    },

    checkoutPaymentSelected: {
      'event_name': 'payment_selected',
      'enh_action': 'checkout',
      'event_category': 'ecommerce',
      'event_action': 'checkout option',
      'event_label': null, // 'creditcard of paypal'
      'event_value': '0'
    },

    checkoutGuestUser: {
      'enh_action': 'checkout_option',
      'event_name': 'guest_checkout',
      'event_category': 'ecommerce',
      'event_action': 'checkout option',
      'event_value': '0',
      'event_label': 'guest checkout'
    },

    checkoutOPC: {
      'enh_action': 'checkout',
      'event_label': null, // <panel name>
      'page_type': null // <page_type>
    },

    checkoutReturnUser: {
      'enh_action': 'checkout_option',
      'event_name': 'return_user_checkout',
      'event_category': 'ecommerce',
      'event_action': 'checkout option',
      'event_value': '0',
      'event_label': 'return checkout'
    },

    filterProducts: {
      'event_category': 'filter & sort selection',
      'event_action': 'filter',
      'event_name': 'filters_and_sort_selection'
    },

    emailSignup: {
      'event_name': 'email_signup',
      'event_category': 'signup',
      'event_action': null, // signups: email,sms
      'event_label': null, // location of email signup
      'event_value': '0',
      'event_noninteraction': 'false'
    },

    getRecAIProdData: {
      'site_type': 'event_based',
      'event_name': 'product_impression',
      'event_category': 'ecommerce',
      'event_action':'view_item_list',
      'event_label':'google_recs',
      'product_impression_list': null, //'<impression list name>'
      'product_impression_position': null, //'<product position>'
      'rec_ai_placement_id': null //'<placement_id of recommendation carousel>'
    },

    liveChatManualInitiated: {
      'event_name': 'live_chat_user_initiated',
      'event_category': 'live chat interaction',
      'event_action': 'user initiated',
      'event_label': null, // <page_type>
      'event_value': '0',
      'event_noninteraction': 'false',
      'live_chat_initiation_type': 'user initiated'
    },

    liveChatManualPreSurvey: {
      'event_name': 'live_chat_manual_prechat_survey',
      'event_category': 'live chat interaction',
      'event_action': 'prechat survey',
      'event_label': 'shown',
      'live_chat_initiation_type': 'user initiated'
    },

    searchOverlayOpen: {
      'event_name': 'search_overlay_open',
      'event_category': 'search',
      'event_action': 'view_search',
      'event_label': 'view_search_overlay'
    },

    liveChatManualWaiting: {
      'event_name': 'live_chat_manual_prechat_accepted',
      'event_category': 'live chat interaction',
      'event_action': 'prechat survey',
      'event_label': 'accepted',
      'live_chat_initiation_type': 'user initiated',
      'live_chat_type': 'live chat'
    },

    liveChatManualChatInitialize: {
      'event_name': 'live_chat_manual_chat_initialize',
      'event_category': 'live chat interaction',
      'event_action': 'chat start',
      'event_label': 'live chat',
      'live_chat_initiation_type': 'user initiated',
      'live_chat_type': 'live chat'
    },

    liveChatManualChatended: {
      'event_name': 'live_chat_manual_chat_ended',
      'event_category': 'live chat interaction',
      'event_action': 'chat ended',
      'event_label': 'live chat',
      'live_chat_initiation_type': 'user initiated',
      'live_chat_type': 'live chat'
    },

    liveChatManualChatting: {
      'event_name': 'live_chat_manual_chatting',
      'event_category': 'live chat interaction',
      'event_action': 'chatting',
      'event_label': 'live chat',
      'live_chat_initiation_type': 'user initiated',
      'live_chat_type': 'live chat'
    },

    liveChatProactiveDisplayed: {
      'event_name': 'live_chat_proactive_shown',
      'event_category': 'live chat interaction',
      'event_action': 'proactive chat',
      'event_label': 'shown',
      'event_value': '0',
      'event_noninteraction': 'false'
    },

    liveChatProactiveInitiated: {
      'event_name': 'live_chat_proactive_accepted',
      'event_category': 'live chat interaction',
      'event_action': 'proactive chat',
      'event_label': 'accepted',
      'event_value': '0',
      'event_noninteraction': 'false',
      'live_chat_initiation_type': 'proactive'
    },

    liveChatProactivePreSurvey: {
      'event_name': 'live_chat_proactive_prechat_survey',
      'event_category': 'live chat interaction',
      'event_label': 'shown',
      'event_action': 'prechat survey',
      'live_chat': 'Pre Survey Chat',
      'live_chat_initiation_type': 'proactive'
    },

    liveChatProactiveWaiting: {
      'event_name': 'live_chat_proactive_prechat_accepted',
      'event_category': 'live chat interaction',
      'event_action': 'prechat survey',
      'event_label': 'accepted',
      'live_chat_initiation_type': 'proactive',
      'live_chat_type': 'live chat'
    },

    liveChatProactiveChatting: {
      'event_name': 'live_chat_proactive_chatting',
      'event_category': 'live chat interaction',
      'event_action': 'chat start',
      'event_label': 'live chat',
      'live_chat_initiation_type': 'proactive',
      'live_chat_type': 'live chat'
    },

    loyaltyTag: {
      'event_name': 'loyalty',
      'event_category': 'loyalty',
      'event_action': null, // depends on source of tag
      'event_label': null, // depends on source of tag
      'event_noninteraction': null
    },

    navigationClick: {
      'event_name': 'navigation_click',
      'event_category': 'global',
      'event_action': 'navigation click',
      'event_label': [], // '<promo_pos> - <promo_creative> - <navigation name> - <navigation link>'
      'enh_action': 'promo_click',
      'promo_pos': ['gnav'],
      'promo_creative': ['link'],
      'promo_name': [], // '<navigation name> - <navigation link>'
      'promo_id': [] // '<promo_pos> - <promo_creative> - <navigation name> - <navigation link>'
    },

    offerFailed: {
      'event_name': 'offers_failed',
      'event_category': 'offers',
      'event_action': 'fail',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': null // <offerCode> - <offerMessage>
    },

    offerSuccessful: {
      'event_name': 'offers_success',
      'event_category': 'offers',
      'event_action': 'success',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': null // <offerCode>
    },

    quickView: {
      'enh_action': 'detail',
      'event_name': 'quickview',
      'event_category': 'ecommerce',
      'event_action': 'product detail view - quickview',
      'event_noninteraction': 'true',
      'sc_event_name': 'Product Quick View',
      'event_label': null, // '<product name> - <product ID>'
      'product_id': null, // '<product ID>'
      'product_base_id': null, // '<prod> - <product ID>'
      'product_catagory_name': null, // '<prod category>'
      'product_price': null // <prod price>
    },

    productClick: {
      'enh_action': 'product_click',
      'event_name': 'product_click',
      'event_category': 'ecommerce',
      'event_action': 'product click',
      'event_label': null, // '<product name> - <product ID>'
      'product_id': null, // '<product ID>'
      'product_position': null, // <product position>
      'product_list': null, // <product location pathname>
      'product_sku': null,
      'product_product_code': null,
      'product_price': null,
      'product_shade': null,
      'product_size' : null
    },

    profileUpdate: {
      'event_name': 'profile_update',
      'event_category': 'account',
      'event_action': 'profile update',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard' // '<type of signin: standard or facebook'>
    },

    questionAnswer: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': 'ask answer - ask a question - end',
      'event_label': null // '<product name> - <product ID>'
    },

    questionAsk: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': 'ask answer - read',
      'event_label': null // '<product name> - <product ID>'
    },

    questionAskSearch: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': null, // 'ask answer - ask a question - search - <search term>'
      'event_label': null // '<product name> - <product ID>'
    },

    sortAnswers: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': null, // 'ask answer - sort - <sort order selected>'
      'event_label': null // '<product name> - <product ID>'
    },

    rateAnswers: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': null, // 'ask answer - helpful - <thumbs up/down>'
      'event_label': null // '<product name> - <product ID>'
    },

    addAnswerStart: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': 'ask answer - add an answer - start',
      'event_label': null // '<product name> - <product ID>'
    },

    addAnswerEnd: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': 'ask answer - add an answer - end',
      'event_label': null // '<product name> - <product ID>'
    },

    showMoreAnswers: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': 'ask answer - show more q&a',
      'event_label': null // '<product name> - <product ID>'
    },

    registration: {
      'event_name': 'registration',
      'event_category': 'account',
      'event_action': 'create success',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard', // '<type of signin: standard or facebook'>
      'account_source': 'standard', // '<type of signin: standard or facebook'>
      'account_type': 'complete',
      'account_referrer': 'site'
    },

    reviewRead: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': 'review - read',
      'event_label': null // '<product name> - <product ID>'
    },

    reviewWriteStart: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': 'review - write - start',
      'event_label': null // '<product name> - <product ID>'
    },

    reviewWriteEnd: {
      'event_name': 'read_write_review',
      'event_category': 'Product Reviews / Ask Answer',
      'event_action': 'Review - Write - End',
      'event_label': null // '<product name> - <product ID>'
    },

    sortReviews: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': null, // 'Review - Sort - <sort order selected>'
      'event_label': null // '<product name> - <product ID>'
    },

    rateReviews: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': null, // 'review - helpful - <thumbs up/down / flag this review>'
      'event_label': null // '<product name> - <product ID>'
    },

    searchReviews: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': null, // 'review - search - <search term>'
      'event_label': null // '<product name> - <product ID>'
    },

    filterReviews: {
      'event_name': 'read_write_review',
      'event_category': 'product reviews / ask answer',
      'event_action': null, // 'review - filter - <Filter Name> | <Filter Selected comma separated>'
      'event_label': null // '<product name> - <product ID>'
    },

    removeFromCart: {
      'enh_action': 'remove',
      'event_name': 'remove_from_bag',
      'event_category': 'ecommerce',
      'event_action': 'remove from bag',
      'event_label': null, // '<product name> - <product ID>'
      'product_id': null, // '<product id>'
      'product_shade': null, // '<product shade>'
      'product_size': null, // '<product size>'
      'product_sku': null // '<sku id>'
    },

    searchIRBannerDisplayed: {
      'event_name': 'dtigimagesearch',
      'event_category': 'onsite search',
      'event_action': 'image search banner',
      'event_label': 'displayed'
    },

    searchIRBannerClicked: {
      'event_name': 'dtigimagesearch',
      'event_category': 'onsite search',
      'event_action': 'image search banner',
      'event_label': 'clicked'
    },

    searchIRTryAgainClicked: {
      'event_name': 'dtigimagesearch',
      'event_category': 'onsite search',
      'event_action': 'try again button',
      'event_label': 'clicked'
    },

    searchAllResultsSelected: {
      'event_name': 'onsite_search',
      'event_category': 'onsite search',
      'event_action': 'standard search',
      'event_label': null, // '<search term>'
      'event_value': null, // '<number of returned results>'
      'event_noninteraction': false,
      'search_keyword': null, // '<search term>'
      'search_type': 'standard search',
      'number_of_on_site_search_results': null, // '<number of returned results>'
      'number_of_on_site_searches': 1
    },

    searchOneResultSelected: {
      'event_name': 'onsite_search',
      'event_category': 'onsite search',
      'event_action': 'type ahead',
      'event_label': null, // '<search term>'
      'event_noninteraction': false,
      'search_keyword': null, // '<search term>'
      'product_sku': null, // '<product sku'>
      'product_id': null, // '<product id'>
      'product_name': null, // '<prodcut name>'
      'search_type': 'standard search'
    },

    searchResultsRedirect: {
      'event_name': 'onsite_search',
      'event_category': 'onsite search',
      'event_action': 'redirect',
      'event_label': null, // '<search term>'
      'event_noninteraction': false,
      'search_keyword': null, // '<search term>'
      'search_type': 'redirect',
      'number_of_on_site_searches': 1
    },

    searchPageLoaded: {
      'page_type': 'search',
      'search_keyword': null, // '<search term>'
      'search_type': 'standard search',
      'search_results': null, // '<number of results>',
      'Number_of_On_Site_Searches': 1
    },

    searchPredicted: {
      'page_type': 'search',
      'search_keyword': null, // '<search term>'
      'search_type': 'predictive search',
      'search_results': null, // '<number of results>',
      'Number_of_On_Site_Searches': 1
    },

    cartOverlay: {
      'event_name': 'checkout_basket',
      'event_category': 'viewcart',
      'event_action': 'view_cart',
      'event_label': 'view_cart_overlay',
      'event_noninteraction': 'true'
    },

    signin: {
      'event_name': 'signin',
      'event_category': 'account',
      'event_action': 'login success',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard', // '<type of signin: standard or facebook'>
      'account_source': 'standard', // '<type of signin: standard or facebook'>
      'account_type': 'complete',
      'account_referrer': 'site'
    },

    signinFailed: {
      'event_name': 'signin_failed',
      'event_category': 'account',
      'event_action': 'login fail',
      'event_value': '0',
      'event_noninteraction': 'false',
      'event_label': 'standard' // '<type of signin: standard or facebook'>
    },
    emailWishlist: {
      event_name: 'share wishlist',
      event_category: 'account',
      event_action: 'wishlist',
      event_label: 'share'
    },

    oneClickcheckout: {
      'enh_action': 'checkout',
      'checkout_type': 'oneclick',
      'event_name': 'checkout_option',
      'event_category': 'cart',
      'event_action': 'view',
      'event_label': location.pathname,
      'event_one_click': 'one click'
    },

    socialLink: {
      'enh_action': 'social',
      'event_name': 'outbound link click',
      'event_category': 'outbound link click',
      'event_action': null, // '<click url>'
      'event_label': null // '<page url>'
    },

    productThumbnailClick: {
      'event_name': 'Product Thumbnail Clicks',
      'event_category': 'Product Thumbnail Clicks',
      'event_action': null, // '<alt image > - <image name> - <swipe/drag/click>'
      'event_label': null // '<product name> - <product id>'
    },

    skuChange: {
      'event_name': 'product_detail_shade_size',
      'enh_action': 'detail',
      'event_category': 'ecommerce',
      'event_action': 'spp',
      'event_label': 'shade size switch',
    },

    giftWrapEnable: {
      'event_name': 'cart_gift_wrap',
      'event_category': null, // <page Type>
      'event_action': 'cart_gift_wrap_selected',
      'event_label': 'cart_gift_wrap_selected',
    },

    // BOPIS events
    sppOpenPostmatesOverlay: {
      event_name: 'delivery_options',
      event_category: 'delivery options',
      event_action: 'launched',
      event_label: 'postmates'
    },

    sppOpenBopisOverlay: {
      event_name: 'delivery_options',
      event_category: 'delivery options',
      event_action: 'launched',
      event_label: 'bopis'
    },

    bopisStoreClick: {
      event_name: 'delivery_options',
      event_category: 'bopis',
      event_action: 'store search selection',
      event_label: null // <store_name>
    },

    bopisSearch: {
      event_name: 'checkout_option',
      event_category: 'ecommerce',
      event_action: 'bopis zipcode search',
      event_label: null // <page_type>
    },

    bopisSearchCurrentLocation: {
      event_name: 'delivery_options',
      event_category: 'delivery options',
      event_action: 'store search',
      event_label: 'location search'
    },

    bopisSelectStore: {
      event_name: 'delivery_options',
      event_category: 'bopis',
      event_action: 'store selected for purchase',
      event_label: null // <store_name>
    },

    bopisSearchResults: {
      event_name: 'delivery_options',
      event_category: 'delivery options',
      event_action: 'store results',
      event_label: null // <number of results returned>
    },

    bopisSelectDeliveryOption: {
      event_name: 'checkout_option',
      enh_action: 'checkout_option',
      event_category: 'ecommerce',
      event_action: 'order delivery type',
      event_label: null // '<delivery_type>'
    },

    bopisEditBagAction: {
      event_name: 'checkout_option',
      event_category: 'ecommerce',
      event_action: 'BOPIS - items unavailable',
      event_label: null //'<selected menu item>'
    },

    bopisRemoveUnavailableItems: {
      event_name: 'checkout_option',
      event_category: 'ecommerce',
      event_action: 'BOPIS - remove unavailable items',
      event_label: null //'<selected menu item>'
    },

    bopisEditDeliveryType: {
      event_name: 'checkout_option',
      event_category: 'ecommerce',
      event_action: 'edit delivery type',
      event_label: null //'<selected delivery type>'
    },

    cartPostamatesStatus: {
      event_name: 'checkout_option',
      event_category: 'ecommerce',
      event_action: 'same day delivery banner',
      event_label: null //'<selected delivery type>'
    },

    bopisEditBagClick: {
      event_name: 'delivery_options',
      event_category: 'bopis',
      event_action: 'store search',
      event_label: 'edit bag'
    },

    cancelOrder: {
      'event_name': 'checkout_option',
      'event_category': 'ecommerce',
      'event_action': 'refund',
      'event_label': null, // '<order ID>'
      'enh_action': 'refund'
    },

    altImageZoomSelected: {
      'event_name': 'product_images_zoom',
      'event_category': 'product_images',
      'event_action': null,  // {{ Zoom Method }}
      'event_label': null, // {{ Product Base ID }}
      'alt_image_placement': null, //{{spp or quickshop}}
      'alt_image_text' : null  //{{Image Alt Text or File Name}}
    },

    payPalButtonActions: {
      'event_name': 'cart_payment_options',
      'event_category': 'viewcart',
      'event_action': 'cart_payment_options',
      'event_label': 'paypal',
      'enh_action': 'checkout_option',
      'checkout_option': 'paypal'
    },

    applePayButtonClick: {
      'event_name': 'cart_payment_options',
      'event_category': 'viewcart',
      'event_action': 'cart_payment_options',
      'event_label': 'apple_pay',
      'enh_action': 'checkout_option',
      'checkout_option': 'apple_pay'
    },

    applePayOverlay: {
      'event_name': 'apple_pay_overlay',
      'event_category': 'viewcart',
      'event_action': 'apple_pay_session_begins',
      'event_label': 'apple_pay_session_begins'
    },

    addPaymentInfo: {
      'event_name': 'add_payment_info',
      'enh_action': 'checkout',
      'checkout_type': 'rco',
      'active_panel': 'payment',
      'active_checkout_panel': 'payment',
      'page_type': 'checkout'
    },

    joinFormLoyalty: {
      'event_name': 'join_banner_loyalty',
      'event_category': 'account_loyalty',
      'event_action': null, // {{ signed_in_loyalty_user/signed_in_user/non_signed_in_user }}
      'event_label': null // {{ cta-label }}
    }
  };

  function tealiumAPI(type, obj, callback) {
    if (typeof utag !== 'undefined') {
      if (callback) {
        utag[type](obj, callback);
      } else {
        utag[type](obj);
      }
    }
  }

  function addToCart(eventData) {
    var obj = {};
    var vtoAddToBagClick = document.cookie.match(new RegExp('(^| )vtoAddToBagClick=([^;]+)'));
    var liveChatAddToBagClick = document.cookie.match(new RegExp('(^| )liveChatAddToBagClick=([^;]+)'));
    var timeSec = 0;

    if (eventData && !isEmpty(eventData)) {
      if (vtoAddToBagClick && vtoAddToBagClick[2] === '1') {
        obj.event_action = 'vto - add to bag';
        document.cookie = 'vtoAddToBagClick=0';
      } else if (liveChatAddToBagClick && liveChatAddToBagClick[2] === '1') {
        timeSec = 1000;
        document.cookie = 'liveChatAddToBagClick=0';
      }
      obj.event_label = stripOutMarkup(eventData.product_name[0]) + ' - ' + eventData.product_id[0];
      setTimeout(function() {
        site.track.evtAction('addToCart', Object.assign({}, eventData, obj));
      }, timeSec);
    }
  }

  function addToFavorites(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_label = stripOutMarkup(eventData.product_name[0]) + ' - ' + eventData.product_id[0];
      site.track.evtAction('addToFavorites', Object.assign({}, eventData, obj));
    }
  }

  // OPC will pass two active_panels for each event: 'review' and the current panel
  // So pop the first panel, if not review, use it. Otherwise check the second.
  function checkoutOPC(eventData) {
    var obj = {};
    var data = site.track.refreshData();
    if (eventData && !isEmpty(eventData)) {
      if (typeof eventData.active_panel === 'object') {
        obj.event_label = eventData.active_panel[0] === 'review' ? eventData.active_panel[1] : eventData.active_panel[0];
      } else {
        obj.event_label = eventData.active_panel;
      }
      obj.page_type = data.page_type;

      if (obj.page_type !== 'cart') {
        site.track.evtAction('checkoutOPC', Object.assign({}, eventData, obj));
      }
    }
  }

  function addPaymentInfo(eventData) {
    var data = site.track.refreshData();
    if (data && data.country_code && data.country_code.match(/kr|my/gi)) {
      site.track.evtAction('addPaymentInfo', Object.assign({}, data, eventData));
    }
  }

  function checkoutSampleAdded(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      for (var i = 0; i < eventData.product_name.length; i++) {
        obj.event_label = eventData.product_name[i] + ' - ' + eventData.product_sku[i];
        site.track.evtAction('checkoutSampleAdded', Object.assign({}, obj));
      }
    }
  }

  function checkoutPaymentSelected(eventData) {
    var data = site.track.refreshData() || {};
    if (eventData && !isEmpty(eventData)) {
      site.track.evtAction('checkoutPaymentSelected', Object.assign({}, data, eventData));
    }
  }

  function emailSignup(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData) && eventData['last_source']) {
      obj['event_label'] = eventData['last_source'];
      obj['event_action'] = eventData['opt_in_state'];
    }
    Object.assign(site.trackingDataLayer.data, eventData);
    site.track.evtAction('emailSignup', Object.assign({}, eventData, obj));
  }

  function liveChatManualInitiated() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data)) {
      obj.event_label = data.page_type;
      site.track.evtAction('liveChatManualInitiated', Object.assign({}, obj));
    }
  }

  function liveChatManualPreSurvey() {
    site.track.evtAction('liveChatManualPreSurvey');
  }

  function liveChatManualWaiting() {
    site.track.evtAction('liveChatManualWaiting');
  }

  function liveChatManualChatInitialize() {
    site.track.evtAction('liveChatManualChatInitialize');
  }

  function liveChatManualChatended() {
    site.track.evtAction('liveChatManualChatended');
  }

  function liveChatManualChatting() {
    site.track.evtAction('liveChatManualChatting');
  }

  function liveChatProactiveDisplayed() {
    site.track.evtAction('liveChatProactiveDisplayed');
  }

  function liveChatProactiveInitiated() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data)) {
      obj.event_label = data.page_type;
      site.track.evtAction('liveChatProactiveInitiated', Object.assign({}, obj));
    }
  }

  function liveChatProactivePreSurvey() {
    site.track.evtAction('liveChatProactivePreSurvey');
  }

  function liveChatProactiveWaiting() {
    site.track.evtAction('liveChatProactiveWaiting');
  }

  function liveChatProactiveChatting() {
    site.track.evtAction('liveChatProactiveChatting');
  }

  function searchOverlayOpen() {
    site.track.evtAction('searchOverlayOpen');
  }

  function loyaltyTag(pageData) {
    if (pageData) {
      var setTagObject = {
        'account | signin': {
          event_action: 'sign up',
          event_label: 'click'
        },
        'account': {
          event_action: 'account',
          event_label: 'join now'
        },
        'checkout | confirm': {
          event_action: 'checkout',
          event_label: 'join now'
        },
        'signup overlay': {
          event_action: 'enrolment overlay',
          event_label: 'displayed',
          event_noninteraction: true
        },
        'marketing enrollment': {
          event_action: 'cms',
          event_label: 'join now'
        },
        'enrollment overlay': {
          event_action: 'enrolment overlay',
          event_label: 'join now cta'
        },
        'marketing overlay': {
          event_action: 'cms',
          event_label: 'join now'
        },
        'apply offers': {
          event_action: 'account',
          event_label: 'apply offer'
        },
        'redeem rewards': {
          event_action: 'account',
          event_label: 'redeem'
        },
        'checkout redeem rewards': {
          event_action: 'checkout',
          event_label: 'redeem'
        },
        'checkout apply offers': {
          event_action: 'checkout',
          event_label: 'apply offer'
        },
        'checkout enrollment': {
          event_action: 'checkout',
          event_label: 'join now'
        },
        'checkout signup': {
          event_action: 'checkout',
          event_label: 'Sign up'
        },
        'marketing sign in': {
          event_action: 'cms',
          event_label: 'sign in now'
        },
        'cancel loyalty': {
          event_action: 'account',
          event_label: 'cancel'
        }
      };
      var obj = setTagObject[pageData];
      if (obj.event_action) {
        site.track.evtAction('loyaltyTag', obj);
      }
    }
  }

  function navigationClick(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData) && eventData.promo_name) {
      obj.promo_name = eventData.promo_name.indexOf('>') === 0 ? eventData.promo_name.replace(/[>]+/, '') : eventData.promo_name;
      obj.event_label = ['gnav' + '-' + 'link' + '-' + obj.promo_name];
      obj.promo_id = ['gnav' + '-' + 'link' + '-' + obj.promo_name];
      site.track.evtAction('navigationClick', Object.assign({}, eventData, obj));
    }
  }

  function offerFailed(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      for (var i = 0; i < eventData.offer_code.length; i++) {
        obj.event_label = eventData.offer_code[i] + ' - ' + eventData.offer_message[i];
        site.track.evtAction('offerFailed', Object.assign({}, eventData, obj));
      }
    }
  }

  function quickView(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};

    if (eventData && !isEmpty(eventData)) {
      if (data && !isEmpty(data) && data.product_impression_id) {
        var product_id = $.isArray(eventData.product_id) ? eventData.product_id[0] : eventData.product_id;
        var productIndex = data.product_impression_id.indexOf(product_id);

        if (product_id && productIndex >= 0) {
          var productFields = ['base_id', 'name', 'price', 'product_code', 'shade', 'short_desc', 'size', 'sku'];

          productFields.forEach(function (field) {
            if (data[`product_impression_${field}`]) {
              obj[`product_${field}`] = [data[`product_impression_${field}`][productIndex]];
            }
          });
        }
      }

      site.track.evtAction('quickView', Object.assign({}, eventData, obj));
    }
  }

  function productClick(eventData) {
    var obj = {};
    var data = site.track.refreshData();

    // Product Click exclude from react/gemini/vulcan
    var getDomainCookie = document.cookie.match(new RegExp('(^| )T_DOMAIN=([^;]+)'));
    var utagPlatform = (window && window.utag_data) ? window.utag_data.platform : '';
    var $targetElem = eventData && eventData.targetElem ? eventData.targetElem : '';
    var isStartdustTemplate = false;
    var startdustClassRef = ['.sd-product-grid', '.sd-product-spp', '.sd-search-results', '.sd-search-gnav-input-field', '.sd-discovery'];

    if($targetElem) {
      startdustClassRef.forEach(function (elementClass) {
        isStartdustTemplate = $targetElem.closest(elementClass).length === 1 ? true : isStartdustTemplate;
      });
    }

    if ((!eventData.features_prod_click && isStartdustTemplate) || (getDomainCookie && getDomainCookie[2] === 'gemini_ghost-aws' || getDomainCookie && getDomainCookie[2] === 'Vulcan_IN' && utagPlatform && utagPlatform !== 'original')) {
      return;
    }

    if (eventData && !isEmpty(eventData) && data && !isEmpty(data)) {
      if (!data.product_impression_id || !eventData.product_id) {
        if (!eventData.product_position) {
          return;
        }
      }
      if (data.product_impression_id) {
        var product_index = data.product_impression_id.indexOf(eventData.product_id[0]);
        if (product_index >= 0) {
          obj.event_label = stripOutMarkup(data.product_impression_name[product_index]) + ' - ' + eventData.product_id[0];
          obj.product_position = [product_index + 1];
          obj.product_list = [location.pathname];
          obj.product_sku = [data.product_impression_sku[product_index]];
          obj.product_product_code = [data.product_impression_product_code[product_index]];
          obj.product_price = [data.product_impression_price[product_index]];
          obj.product_shade = [data.product_impression_shade[product_index]];
          obj.product_size = [data.product_impression_size[product_index]];
          obj.product_name = [data.product_impression_name[product_index]];
          site.track.evtAction('productClick', Object.assign({}, eventData, obj));
        } else if (product_index == -1) {
          var eventDataPrice = $.isArray(eventData.product_price) ? eventData.product_price[0] : eventData.product_price;
          var productPrice = eventDataPrice ? eventDataPrice : data.product_impression_price;
          obj.event_label = eventData.product_impression_name + ' - ' + eventData.product_id;
          obj.product_position = eventData.product_position;
          obj.product_list = [location.pathname];
          obj.product_sku = data.product_impression_sku;
          obj.product_product_code = data.product_impression_product_code;
          obj.product_price = $.isArray(productPrice) ? productPrice : [productPrice];
          obj.product_shade = data.product_impression_shade;
          obj.product_size = data.product_impression_size;
          obj.product_name = data.product_impression_name;
          site.track.evtAction('productClick', Object.assign({}, eventData, obj));
        }
      } else {
        var productPrice = data.product_price || data.cart_product_price;
        obj.event_label = eventData.product_impression_name + ' - ' + eventData.product_id;
        obj.product_position = eventData.product_position;
        obj.product_list = [location.pathname];
        obj.product_sku = data.product_sku || data.cart_product_sku;
        obj.product_product_code = data.product_product_code || data.cart_product_product_code;
        obj.product_price = $.isArray(productPrice) ? productPrice : [productPrice];
        obj.product_shade = data.product_shade || data.cart_product_shade;
        obj.product_size = data.product_size || data.cart_product_size;
        obj.product_name = data.product_name || data.cart_product_name;
        site.track.evtAction('productClick', Object.assign({}, eventData, obj));
      }
    }
  }

  function getRecAIProdData(eventData) {
    var obj = {product_impression_position:[],product_impression_list:[]};
    var data = site.track.refreshData() || {};
    if (eventData && !isEmpty(eventData) && eventData.product_impression_id) {
        eventData.product_impression_id.forEach(function(element,index) {
          obj.product_impression_position.push(index+1);
          obj.product_impression_list.push(location.pathname);
      });
      obj.rec_ai_placement_id = data.placement_id;
      site.track.evtAction('getRecAIProdData',  Object.assign({}, eventData, obj));
    }
  }

  function profileUpdate(eventData) {
    site.track.evtAction('profileUpdate');
  }

  function offerSuccessful(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      for (var i = 0; i < eventData.offer_code.length; i++) {
        obj.event_label = eventData.offer_code[0];
        site.track.evtAction('offerSuccessful', Object.assign({}, eventData, obj));
      }
    }
  }

  function questionAnswer() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data) && data.product_id && data.product_id.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('questionAnswer', obj);
    }
  }

  function questionAsk() {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data) && data.product_id && data.product_id.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('questionAsk', obj);
    }
  }

  function questionAskSearch(eventData) {
    var obj = {};
    var data = site.track.refreshData();
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && eventData && !isEmpty(eventData)) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      obj.event_action = 'ask answer - ask a question - search - ' + eventData.search_term;
      site.track.evtAction('questionAskSearch', obj);
    }
  }

  function registration(eventData) {
    eventData = eventData || {};

    var registrationPlatform = localStorage.getItem('route_iam');
    if (registrationPlatform) {
      localStorage.removeItem('route_iam');
      return;
    }

    if (eventData && eventData.login_source) {
      eventData.event_label = eventData['login_source'].toLowerCase();
      eventData.account_source = eventData['login_source'].toLowerCase();
    }
    var data = site.track.refreshData() || {};
    if (data && data.page_type && data.page_type === 'checkout') {
      eventData.event_category = 'ecommerce'
    }
    site.track.evtAction('registration', eventData);
  }

  function reviewRead() {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('reviewRead', obj);
    }
  }

  function reviewWriteStart() {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('reviewWriteStart', obj);
    }
  }

  function reviewWriteEnd(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData) && eventData.product_impression_id && eventData.product_impression_name) {
      obj.event_label = stripOutMarkup(eventData.product_impression_name) + ' - ' + eventData.product_impression_id;
    } else {
      var data = site.track.refreshData();
      if (data && !isEmpty(data) && data.product_impression_id && data.product_impression_id.length) {
        obj.event_label = stripOutMarkup(data.product_impression_name[0]) + ' - ' + data.product_impression_id[0];
      }
    }
    if (obj.event_label) {
      site.track.evtAction('reviewWriteEnd', obj);
    }
  }

  function sortReviews(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && eventData && !isEmpty(eventData) && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      obj.event_action = 'Review - Sort - ' + eventData.sort_option;
      site.track.evtAction('sortReviews', obj);
    }
  }

  function rateReviews(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && eventData && !isEmpty(eventData) && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      obj.event_action = 'review - helpful - ' + eventData.event_action;
      site.track.evtAction('rateReviews', obj);
    }
  }

  function searchReviews(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && eventData && !isEmpty(eventData) && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      obj.event_action = 'review - search - ' + eventData.search_term;
      site.track.evtAction('searchReviews', obj);
    }
  }

  function filterReviews(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && eventData && !isEmpty(eventData) && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      obj.event_action = 'review - filter - ' + eventData.sort_option;
      site.track.evtAction('filterReviews', obj);
    }
  }

  function sortAnswers(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && eventData && !isEmpty(eventData) && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      obj.event_action = 'ask answer - sort - ' + eventData.sort_option;
      site.track.evtAction('sortAnswers', obj);
    }
  }

  function rateAnswers(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && eventData && !isEmpty(eventData) && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      obj.event_action = 'ask answer - helpful - ' + eventData.event_action;
      site.track.evtAction('rateAnswers', obj);
    }
  }

  function addAnswerStart() {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('addAnswerStart', obj);
    }
  }

  function addAnswerEnd() {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('addAnswerEnd', obj);
    }
  }

  function showMoreAnswers() {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && !isEmpty(data) && data.product_id && data.product_id.length && data.product_name && data.product_name.length) {
      obj.event_label = stripOutMarkup(data.product_name[0]) + ' - ' + data.product_id[0];
      site.track.evtAction('showMoreAnswers', obj);
    }
  }

  function removeFromCart(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_label = stripOutMarkup(eventData.product_name[0]) + ' - ' + eventData.product_id[0];
      site.track.evtAction('removeFromCart', Object.assign({}, eventData, obj));
    }
  }

  // eventData here is an instance of the Endeca JS
  function searchPageLoaded(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (eventData && !isEmpty(eventData)) {
      var searchTerm = eventData.meta.searchInfo.correctedTerms && eventData.meta.searchInfo.correctedTerms.length ? eventData.meta.searchInfo.correctedTerms[0] : eventData.queries.product.parsedSearchTerm();

      obj.search_keyword = searchTerm;
      obj.search_results = eventData.meta.searchInfo.totalProductRecords.toString();
      obj.location = location.origin + location.pathname + '?search=' + searchTerm + '&searchtype=standard';
      data.location = obj.location;

      site.track.evtView(data); // First page view tag for standard search
      site.track.evtAction('searchPageLoaded', obj); // Second page view tag
    }
  }

  // Predictive search
  function searchPredicted(eventData) {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (eventData && !isEmpty(eventData)) {
      var searchTerm = eventData.meta.searchInfo.correctedTerms && eventData.meta.searchInfo.correctedTerms.length ? eventData.meta.searchInfo.correctedTerms[0] : eventData.queries.product.parsedSearchTerm();
      var productImpressionIds = [];
      var productImpressionPositions = [];
      var productImpressionList = [];
      var index = 1;
      for (var key in eventData.catalogs.product.productList) {
        productImpressionIds.push(eventData.catalogs.product.productList[key].PRODUCT_ID);
        productImpressionPositions.push(index);
        productImpressionList.push(location.pathname);
        index++;
      }
      obj.product_impression_id = productImpressionIds;
      obj.product_impression_list = productImpressionList;
      obj.product_impression_position = productImpressionPositions;
      obj.location = location.origin + location.pathname + '?search=' + searchTerm.replace(/[!@#$%^&*()]/g, "") + '&searchtype=predictive';
      obj.search_keyword = searchTerm.replace(/[!@#$%^&*()]/g, "");
      obj.search_results = eventData.catalogs.product.resultList.length.toString();

      site.track.evtAction('searchPredicted', obj);
    }
  }

  if (window && window.GlobalServiceBus) {
    window.GlobalServiceBus.on('product.grid.viewed', function () {
      serviceBusCartOverlayEvt = true;
    });
  }

  function cartOverlay() {
    // MTA-8172 - Added condition "my-account-sku" for supressing the cartOverlay event on the account profile page globally.
    if ($('.sd-product-grid').length === 0 && !serviceBusCartOverlayEvt && $('.my-account-sku').length === 0) {
      site.track.evtAction('cartOverlay');
    }
  }

  function searchRedirect() {

  }

  function signin(eventData) {
    eventData = eventData || {};

    var signinPlatform = localStorage.getItem('route_iam');
    if (signinPlatform) {
      localStorage.removeItem('route_iam');
      return;
    }

    if (eventData && eventData.login_source) {
      eventData.event_label = eventData['login_source'].toLowerCase();
      eventData.account_source = eventData['login_source'].toLowerCase();
    }
    var data = site.track.refreshData() || {};
    if (data && data.page_type && data.page_type === 'checkout') {
      eventData.event_category = 'ecommerce'
    }
    site.track.evtAction('signin', eventData);
  }

  function signinFailed(eventData) {
    eventData = eventData || {};

    var signinFailedPlatform = localStorage.getItem('route_iam');
    if (signinFailedPlatform) {
      localStorage.removeItem('route_iam');
      return;
    }

    if (eventData && eventData.login_source) {
      eventData.event_label = eventData['login_source'].toLowerCase();
    }
    var data = site.track.refreshData() || {};
    site.track.evtAction('signinFailed', eventData);
  }

  function oneClickcheckout() {
    var data = site.track.refreshData() || {};
    data.location = '/checkout/onecart.tmpl';
    site.track.evtAction('oneClickcheckout', data);
  }

  function emailWishlist() {
    site.track.evtAction('emailWishlist');
  }

  function productThumbnailClick(eventData) {
    if (eventData && !isEmpty(eventData)) {
      site.track.evtAction('productThumbnailClick', eventData);
    }
  }

  function skuChange(eventData) {
    var data = site.track.refreshData() || {};

    if (eventData && !isEmpty(eventData)) {
      if (data && data.brand) {
        eventData.product_brand = [data.brand];
      }
      site.track.evtAction('skuChange', eventData);
    }
  }

  function giftWrapEnable() {
    var obj = {};
    var data = site.track.refreshData() || {};
    if (data && data.page_type) {
      obj.event_category = data.page_type;
      site.track.evtAction('giftWrapEnable', obj);
    }
  }

  function cancelOrder(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_label = eventData.order_id;
      site.track.evtAction('cancelOrder', Object.assign({}, eventData, obj));
    }
  }

  function altImageZoomSelected(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_action = eventData.zoomAction;
      obj.event_label = eventData.eventLabel;
      obj.alt_image_placement = eventData.imagePlacement;
      obj.alt_image_text = eventData.imageLabel;
      site.track.evtAction('altImageZoomSelected', Object.assign({}, eventData, obj));
    }
  }

  function applePayButtonClick() {
    site.track.evtAction('applePayButtonClick');
  }

  function payPalButtonActions(eventData = {}) {
    site.track.evtAction('payPalButtonActions', Object.assign({}, eventData));
  }

  function applePayOverlay() {
    site.track.evtAction('applePayOverlay');
  }

  function stripOutMarkup(str) {
    return str.replace(/(<([^>]+)>)/ig, '');
  }

  function isEmpty(obj) {
    for (var x in obj) {
      return false;
    }
    return true;
  }

  function getProductPosition(productIds) {
    if (!productIds) {
      return [];
    }
    if (typeof Drupal.behaviors.analyticsBehavior !== 'undefined') {
      return Drupal.behaviors.analyticsBehavior.getProductPositions(productIds);
    } else {
      return [];
    }
  }

  function trackBopisEvent(eventData) {
    if (eventData && eventData.action) {
      site.track.evtAction(eventData.action, eventData.payload || {});
    }
  }

  function joinFormLoyalty(eventData) {
    var obj = {};
    if (eventData && !isEmpty(eventData)) {
      obj.event_action = eventData.event_action;
      obj.event_label = eventData.event_label;
      site.track.evtAction('joinFormLoyalty', Object.assign({}, eventData, obj));
    }
  }

  site.track = tealium;
}(window.site || {}, window.utag_data || {}));
