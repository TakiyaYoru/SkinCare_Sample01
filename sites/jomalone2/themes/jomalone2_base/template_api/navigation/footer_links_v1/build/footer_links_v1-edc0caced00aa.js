(function ($) {
  Drupal.behaviors.footerLinksV1 = {
    attached: false,
    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;

      var $template = $('.js-footer-links-v1', context);
      var $mobileLinks = $('.js-footer-links__content', $template);
      var $trigger = $('.js-footer-links__title', $mobileLinks);

      // Check if this has a trigger
      if ($trigger.length) {
        // Toggle the footer link
        $trigger.once().on('click', function () {
          var $this = $(this);
          var $parent = $this.parent();
          var $content = $this.next('.js-footer-links__section');
          // Cast the expanded state as a boolean
          var expanded = $parent.attr('aria-expanded') === 'false' ? false : true;

          // Switch the states of aria-expanded and aria-hidden
          $parent.attr('aria-expanded', !expanded);
          $content.attr('aria-hidden', expanded);
        });
      }
    }
  };
})(jQuery);
