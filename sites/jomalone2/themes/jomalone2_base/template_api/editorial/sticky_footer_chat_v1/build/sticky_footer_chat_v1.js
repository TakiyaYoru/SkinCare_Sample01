!function(o){Drupal.behaviors.stickyFooterChatV1={attach:function(t){var e=o(".js-sticky-footer-chat-v1",t),i=o(".site-footer",t),n=function(){var t=o(window),n=t.height(),r=i.offset();t.scrollTop()<=r.top-n?e.removeClass("hidden"):e.addClass("hidden")};n(),o(window).on("scroll resize",_.throttle((function(){n()}),100))}}}(jQuery);
//# sourceMappingURL=sticky_footer_chat_v1.js.map
