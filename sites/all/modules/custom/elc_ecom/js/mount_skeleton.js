(function () {
  var mountedClass = 'sd-mounted';
  var processedClass = 'sd-skeleton-processed';
  var transitionClass = 'sd-transition';
  var mountPointsSelector = '[data-component]';
  var skeletonClassSelector = '.sd-mount-skeleton';
  var skeletonTransitionClassSelector = 'js-sd-grid-skeleton-transition';
  var config = {
    childList: true,
    subtree: true
  };

  function getSkeletons() {
    return document.querySelectorAll(skeletonClassSelector);
  }

  var mutationObserverCallback = function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type !== 'childList') {
        return;
      }

      var activeSkeletons = getSkeletons();

      if (!activeSkeletons || !activeSkeletons.length) {
        return;
      }

      activeSkeletons.forEach(function (skeleton) {
        var parent = skeleton.parentElement;
        var component = parent.querySelector(mountPointsSelector);
        var hasTransition = skeleton.getElementsByClassName(skeletonTransitionClassSelector).length > 0;

        if (!component) {
          skeleton.remove();
          return;
        }

        var hasContent = component.hasChildNodes();

        if (!hasContent) {
          return;
        }

        if (skeleton.classList.contains(processedClass)) {
          return;
        }

        component.classList.add(mountedClass);

        if (!hasTransition) {
          skeleton.remove();
          return;
        }

        skeleton.classList.add(processedClass);
        component.classList.add(transitionClass);
        skeleton
        .animate({ opacity: [1, 0] }, { duration: 500, iterations: 1, easing: "ease-out" })
        .onfinish = (e) => {
          component.classList.remove(transitionClass);
          skeleton.remove();
        };

      });
    }
  };

  var observer = new MutationObserver(mutationObserverCallback);

  var setMutationObserver = function () {
    var container = document.body || document.documentElement;
    observer.observe(container, config);
  };

  document.addEventListener('DOMContentLoaded', setMutationObserver, false);
})();
