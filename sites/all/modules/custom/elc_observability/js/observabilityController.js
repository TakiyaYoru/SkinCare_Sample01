var site = window.site || {};

(function () {
  site.recordObservableEvent = function (payload, url = '/api/observability') {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  };
})();
