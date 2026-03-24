var lpTag = window.lpTag || {};
var site = window.site || {};

(function () {
  function initLiveChatWindowObservability() {
    window.observability = window.observability || {};
    window.observability.livechat = window.observability.livechat || {};
    window.observability.livechat.liveperson =
      window.observability.livechat.liveperson || {};
  }

  async function calculateLpLoadTime() {
    return new Promise((resolve) => {
      initLiveChatWindowObservability();
      window.observability.livechat.liveperson.loadStartTime = Date.now();
      lpTag.events?.bind?.('LP_OFFERS', 'OFFER_DISPLAY', () => {
        const endTime = Date.now();
        const startTime = window.observability.livechat.liveperson.loadStartTime;
        const duration = endTime - startTime;

        resolve(duration);
      });
    });
  }

  function browserSpecs() {
    try {
      var navigatorSpecs = [
        'hostname:' + (window.location.hostname || 'Unknown'),
        'region:' + (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'),
        'device_type:' + (lpTag && lpTag._userAgentResolver && lpTag._userAgentResolver.os ? lpTag._userAgentResolver.os : 'Unknown'),
        'browser_type:' + (lpTag && lpTag._userAgentResolver && lpTag._userAgentResolver.browser ? lpTag._userAgentResolver.browser : 'Unknown'),
        'latency:' + (navigator && navigator.connection && navigator.connection.rtt ? navigator.connection.rtt + 'ms' : 'Unknown'),
        'bandwidth:' + (navigator && navigator.connection && navigator.connection.downlink ? navigator.connection.downlink + 'MB/s' : 'Unknown'),
        'speed:' + (navigator && navigator.connection && navigator.connection.effectiveType ? navigator.connection.effectiveType : 'Unknown')
      ];
      return navigatorSpecs;
    } catch (e) {
      return [];
    }
  }

  site.observeLpLoadTime = async function () {
    const duration = await calculateLpLoadTime();
    const specs = browserSpecs();
    const payload = {
      series: [
        {
          metric: 'livechat.liveperson.load_time',
          type: 3,
          points: [
            {
              timestamp: Math.floor(Date.now() / 1000),
              value: duration
            }
          ],
          tags: specs
        }
      ]
    };

    site.recordObservableEvent?.(payload, '/api/observability/livechat');
  };
})();
