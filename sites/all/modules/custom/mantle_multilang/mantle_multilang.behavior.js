/* globals JSBoot */

/*
 * We extend MantleMultiLang in the behavior js so that we have access to
 * jquery at this point.
 *
 * The API defined here cannot be access in the head.
 */
var MantleMultiLang = (function(MantleMultiLang, $, JSBoot) {
  /*
   * Process a link in the js-mantle-multilang-trigger format.
   */
  MantleMultiLang.handleMultilangTrigger = function($trigger) {
    var locale = $trigger.data('pg-locale');
    var request_context = $trigger.data('request-context');

    var target_url = $trigger.attr('href');
    // Some language switch links have no real path target.
    // They just work on the page they are currently on.
    if ($trigger.data('no-follow-link') === 1) {
      target_url = null;
    }
    MantleMultiLang.requestLocaleSwitch(locale, request_context, target_url);
  };

  /*
   * Global click handler for js-mantle-multilang-trigger.
   */
  $(document).on('click.mantlemultilang', '.js-mantle-multilang-trigger', function(e) {
    e.preventDefault();
    var $trigger = $(this);
    MantleMultiLang.handleMultilangTrigger($trigger);
  });

  return MantleMultiLang;
})(MantleMultiLang || {}, jQuery, JSBoot);
