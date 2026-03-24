(function ($) {
  Drupal.behaviors.stickyFooterChatV1 = {
    attach: function (context) {
      var $template = $('.js-sticky-footer-chat-v1', context);
      var $footer = $('.site-footer', context);
      var _displaySticky = function () {
        var $this = $(window);
        var windowHeight = $this.height();
        var footerOffset = $footer.offset();
        var scrollTop = $this.scrollTop();
        var offsetBottom = footerOffset.top - windowHeight;

        if (scrollTop <= offsetBottom) {
          $template.removeClass('hidden');
        } else {
          $template.addClass('hidden');
        }
      };

      _displaySticky();

      $(window).on(
        'scroll resize',
        _.throttle(function () {
          _displaySticky();
        }, 100)
      );
    }
  };
})(jQuery);
