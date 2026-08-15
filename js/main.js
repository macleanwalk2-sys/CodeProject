/* Oakwood Marketing Services
   Scroll reveal: fade elements in as they enter the viewport. */

(function () {
  var targets = document.querySelectorAll('.reveal, .grow');
  if (!targets.length) return;

  // No IntersectionObserver (very old browser): just show everything.
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  targets.forEach(function (el) { observer.observe(el); });
})();
