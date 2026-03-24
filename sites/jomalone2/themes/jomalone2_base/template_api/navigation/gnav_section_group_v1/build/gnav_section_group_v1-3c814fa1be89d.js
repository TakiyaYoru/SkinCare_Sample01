(function ($) {
  Drupal.behaviors.gnavSectionGroupV1 = {
    attached: false,
    attach: function (context) {
      if (this.attached) {
        return;
      }
      this.attached = true;

      var $template = $('.js-gnav-section-group-v1', context);

      $template.each(function () {
        var $sectionTrigger = $(this).find('.js-gnav-section-formatter__link--trigger');
        var sectionsCount = $sectionTrigger.length;

        if (sectionsCount === 1) {
          $sectionTrigger.addClass('pc-trigger-hidden').find('span').addClass('pc-trigger-hidden');
        }
      });
    }
  };
})(jQuery);
