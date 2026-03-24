(function($) {
  Drupal.behaviors.ie11UpgradePopup = {
    attach: function(context) {
      var $ieUpgradeContainer = $('.js-ie-upgrade-v1', context);
      var $ieUpgradeClose = $('.js-ie-upgrade-close', $ieUpgradeContainer);

      if ($.cookie('JML2_IE_UPGRADE_POPUP')) {
        return;
      }

      if (navigator.userAgent.indexOf('MSIE') >= 0 || navigator.appVersion.indexOf('Trident/') > -1) {
        $ieUpgradeContainer.removeClass('hidden');
        $ieUpgradeClose.on('click', function() {
          $.cookie('JML2_IE_UPGRADE_POPUP', '1', { path: '/' });
          $ieUpgradeContainer.addClass('hidden');
        });
      } else {
        $ieUpgradeContainer.html('');
      }
    }
  };
})(jQuery);
