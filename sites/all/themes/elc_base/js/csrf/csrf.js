(function($) {
  var csrfLib = {
    enabled: true
  };

  const tokenName = 'csrftoken';
  const tokenHeader = 'X-CSRF-Token';
  const tokenParam = '_TOKEN';

  function parseUrl(url) {
    var parser = document.createElement('a');
    var searchObject = {};
    var queries;
    var split;

    parser.href = url;

    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (var i = 0; i < queries.length; i++) {
      split = queries[i].split('=');
      searchObject[split[0]] = split[1];
    }

    return {
      protocol: parser.protocol,
      host: parser.host,
      hostname: parser.hostname,
      port: parser.port,
      pathname: parser.pathname
    };
  }

  function getCookie(name) {
    var cookieValue = null;

    if (window.top.document.cookie && window.top.document.cookie !== '') {
      var cookies = window.top.document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();

        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }

    return cookieValue;
  }

  function sameOrigin(url) {
    if (typeof url !== 'string') {
      return false;
    }

    const protocol = document.location.protocol;
    const hostname = document.location.hostname;

    // URL to lowercase and trim whitespaces.
    url = url.toLowerCase().trim();

    // Detect absolute or relative path.
    const regex = new RegExp('^(?:[a-z]+:)?//', 'i');
    if (regex.test(url)) {
      // Here stands the absolute paths.

      // Since this is 'Protocol-relative' we assume the protocol is the same.
      if (url.substr(0, 2) == '//') {
        // We add the protocol to be able to generate the URL object.
        url = protocol + url;
      }

      // Compare between given protocol and hostname against the ones from domain.
      const compareUrl = parseUrl(url);
      if (compareUrl.protocol == protocol && compareUrl.hostname == hostname) {
        return true;
      }

    } else {
      // Here stands the relative paths:
      // - Starts with '/'.
      // - Starts without protocol/host/port.
      return true;
    }

    return false;
  }

  function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method));
  }

  function searchParam(existing) {
    return existing.search(tokenParam);
  }

  /**
   * Helper function to add the _TOKEN parameter to all request bodies
   *
   * Expected format for `formattedRequests`:
   * [
   *   {
   *     method: <method>,
   *     params: [ { <data> } ]
   *   }
   * ]
   */
  function addCSRFToken(formattedRequests, csrftoken) {
    function updateParams(request) {
      if (!request.hasOwnProperty('params')) {
        request.params = [];
      }

      if (Array.isArray(request.params)) {
        if (request.params.length === 0) {
          request.params.push({});
        }

        const newParams = request.params.map(function(p) {
          p[tokenParam] = csrftoken;
          return p;
       });

        request.params = newParams;
      } else if (typeof request.params === 'object') {
        request.params[tokenParam] = csrftoken;
      }

      return request;
    }

    if (Array.isArray(formattedRequests)) {
      formattedRequests = formattedRequests.map(function(request) {
        request = updateParams(request);

        return request;
      });
    } else if (typeof formattedRequests === 'object') {
      formattedRequests = updateParams(formattedRequests);
    }

    return formattedRequests;
  }

  /**
   * Helper function to alter outbound RPC's
   */
  function alterRequestData(existing, csrftoken) {
    if (typeof existing === 'string') {
      if (searchParam(existing) !== -1) {
        return existing;
      }

      // Deconstruct the request
      existing = unescape(existing);
      existing = existing.replace('JSONRPC=', '');
      existing = JSON.parse(existing);

      // Add CSRF token
      existing = addCSRFToken(existing, csrftoken);

      // Reconstruct the request
      existing = JSON.stringify(existing);
      existing = escape(existing);
      existing = 'JSONRPC=' + existing;
    } else {
      existing[tokenParam] = csrftoken;
    }

    return existing;
  }

  csrfLib.getCSRFCookie = function() {
    return getCookie(tokenName) || '';
  };

  function detectRpcTemplate(url) {
    if (typeof url !== 'string') {
      return false;
    }

    const rpcTemplatePath = '/rpc/jsonrpc.tmpl';

    if (url.indexOf(rpcTemplatePath) !== -1) {
      return true;
    }

    return false;
  }

  // Hook into jQuery and send along the CSRF token for each request. If there are multiple
  // versions of jQuery included on a site, this most likely won't affect all of them.
  // ajaxPrefilter will avoid any overrides by:
  // 'beforeSend' within an '$.ajax()' calls.
  // Any other 'ajaxPrefilter'.
  $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (! csrfLib.enabled) return;
    const csrftoken = csrfLib.getCSRFCookie();
    if (
      !!csrftoken &&
      !csrfSafeMethod(options.type) &&
      sameOrigin(options.url) &&
      detectRpcTemplate(options.url)
    ) {
      // Exclude requests for the csrf token itself
      if (options.url.indexOf('csrf.getToken') === -1) {
        jqXHR.setRequestHeader(tokenHeader, csrftoken);
        options.data = alterRequestData(options.data, csrftoken);
      }
    }
  });

  // Add the _TOKEN input to all forms that need it, but wait until the PG BE has set it
  $(document).on('csrf.success', function() {
    const csrftoken = csrfLib.getCSRFCookie();

    if (!!csrftoken) {
      var $forms = document.getElementsByTagName('form');

      for (var i = 0; i < $forms.length; i++) {
        var $form = $forms[i];
        var actionURL = $form.action;
        var $tokenInput = $form.querySelectorAll('input[name=' + tokenParam + ']');

        if ($form.getAttribute('data-ignore-csrf') === 'true') {
          continue;
        }

        if (sameOrigin(actionURL)) {
          if (!$tokenInput.length) {
            var inputToken = document.createElement('input');
            inputToken.type = 'hidden';
            inputToken.name = tokenParam;
            inputToken.value = csrftoken;
            $form.appendChild(inputToken);
          }
          else {
            for (var j = 0; j < $tokenInput.length; j++) {
              $tokenInput[j].value = csrftoken;
            }
          }
        }
      }
    }
  });

  csrfLib.documentWatch = function (mutations) {
    var callCsrfSuccess = false;
    var formRX = new RegExp(/<form\s+/, 'i');

    for (var i = 0; i < mutations.length; i++) {
      var thisMutation = mutations[i];
      if (! thisMutation.addedNodes.length ) return;
      if (! (thisMutation.type === 'childList') ) return;

      //we should also check target, as form can be already there on the page, but w/o token filled
      if (formRX.test(thisMutation.target.innerHTML)) {
        callCsrfSuccess = true;
        break;
      };

      for (var k=0; k < thisMutation.addedNodes.length; k++) {
        var node = thisMutation.addedNodes[k];
        if ((node.nodeName == 'FORM') || formRX.test(node.innerHTML)) {
          callCsrfSuccess = true;
          break;
        }
      };
      if (callCsrfSuccess) break;
    };
    if (callCsrfSuccess) $(document).triggerHandler('csrf.success');
  }

  csrfLib.startObserver = function () {
    csrfLib.enabled = true;
    if (!csrfLib.observer) csrfLib.observer = new MutationObserver(csrfLib.documentWatch);
    csrfLib.observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
  csrfLib.stopObserver = function () {
    csrfLib.enabled = false;
    if (csrfLib.observer) csrfLib.observer.disconnect();
  }

  $(document).on('csrf.start_hooks', function() {
    csrfLib.startObserver();
  });
  $(document).on('csrf.stop_hooks', function() {
    csrfLib.stopObserver();
  });

  csrfLib.startObserver();
  return csrfLib;
})(
  jQuery
);
