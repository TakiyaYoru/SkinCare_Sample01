(function ($, Drupal, GlobalServiceBus) {
  Drupal.behaviors.elcSdSearchGnavInputFieldV1 = {
    attached: false,

    getIcon: function () {
      return $('.sd-search-gnav-input-field').find('.svg-search-icon');
    },

    /**
     * These event bindings should only apply when search version 5.x is active.
     * The static icon will be enabled in the mustache template when that's the case,
     *  which is why I'm checking for the presence of that element.
     */
    shouldNotAttach: function () {
      const serviceBusLoaded =
        GlobalServiceBus.hasOwnProperty('emit') && GlobalServiceBus.hasOwnProperty('on');
      const isAttached = this.attached;
      const hasIcon = this.getIcon().length;

      return !serviceBusLoaded || isAttached || !hasIcon;
    },

    attach: function (_context) {
      if (this.shouldNotAttach()) {
        return;
      }
      this.attached = true;
      const $icon = this.getIcon();

      $icon.once().on('click', () => {
        GlobalServiceBus.emit('search.should.render', true);
      });
    }
  };
})(jQuery, Drupal, window.GlobalServiceBus || {});
