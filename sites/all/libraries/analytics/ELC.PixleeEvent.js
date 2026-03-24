var site = window.site || {};
var eventObj = {};
(function (site) {
  window.addEventListener('message', (event) => {
    // only listen to events coming from Pixlee
    if (!event.data) {
      return;
    }
    try {
      const message = JSON.parse(event.data);
      if (message.eventName) {
        // condition for photoOpened widget.
        if (message.eventName == 'photoOpened') {
          eventObj.vendor = 'pixlee';
          eventObj.social_platform = message.data.source;
          eventObj.content_type = message.data.content_type;
          trackEvent('pixlee_widget_events', 'pixlee_widget_events', message.eventName, message.data.platform_link);
        } else {
          eventObj.vendor = 'pixlee';
          trackEvent('pixlee_widget_events', 'pixlee_widget_events', message.eventName, message.eventName);
        }
      }
    } catch (error) {
      // error during JSON.parse, skip
    }
  });
  // Event track common function call start
  function trackEvent(eName, eCategory, eAction, elabel) {
    Object.assign(eventObj, {
      event_name: eName,
      event_category: eCategory,
      event_action: eAction,
      event_label: elabel
    });
    site.track.evtLink(eventObj);
    eventObj = {};
  }
  // Event track common function call end.
})(window.site);
