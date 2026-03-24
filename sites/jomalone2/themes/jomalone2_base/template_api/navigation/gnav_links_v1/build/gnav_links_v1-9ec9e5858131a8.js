(function ($) {
  Drupal.behaviors.gnavLinksV1 = {
    attached: false,
    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;

      var $template = $('.js-gnav-links-v1', context);
      var $mobileLinks = $('.js-gnav-links__mobile-content', $template);
      var $linksContent = $('.js-gnav-links__content', $template);
      var $trigger = $('.js-gnav-links__headline', $mobileLinks);

      // Collapse subnav using js only.
      $linksContent.attr('aria-hidden', 'true');
      $mobileLinks.attr('aria-expanded', 'false');

      // Check if this has a trigger
      if ($trigger.length) {
        // Toggle the nav
        $trigger.once().on('click', function (e) {
          var $this = $(this);
          var $parent = $this.parent();
          var $content = $this.next('.js-gnav-links__content');
          // Cast the expanded state as a boolean
          var expanded = $parent.attr('aria-expanded') === 'false' ? false : true;

          e.preventDefault();
          // Switch the states of aria-expanded and aria-hidden
          $parent.attr('aria-expanded', !expanded);
          $content.attr('aria-hidden', expanded);
        });
      }
    }
  };
})(jQuery);
