(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealSelectors = [
    'section',
    '.service-quick-card',
    '.service-category-card',
    '.growth-step',
    '.case-card',
    '.feature-chip',
    '.shop-package-card',
    '.shop-service-card',
    '.shop-benefit-item',
    '.cart-item',
    '.info-card',
    '.booking-card',
    '.career-panel',
    '.client-card',
    '.client-design-card',
    '.error-panel'
  ];
  const revealSelector = revealSelectors.join(',');
  let revealObserver;
  let motionCount = 0;

  function revealNow(node) {
    node.classList.add('hds-in', 'opacity-100', 'translate-y-0');
    node.classList.remove('opacity-0', 'translate-y-6');
    node.style.willChange = 'auto';
  }

  function ensureRevealObserver() {
    if (reduceMotion || revealObserver || !('IntersectionObserver' in window)) return revealObserver;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    return revealObserver;
  }

  function revealNodes(root = document) {
    if (!root) return;
    const nodes = [];
    if (root.nodeType === 1 && root.matches?.(revealSelector)) nodes.push(root);
    root.querySelectorAll?.(revealSelector).forEach(node => nodes.push(node));

    const observer = ensureRevealObserver();
    nodes.forEach(node => {
      if (!node.dataset.motionReady) {
        node.dataset.motionReady = 'true';
        node.style.setProperty('--motion-order', String(motionCount % 10));
        motionCount += 1;
        node.classList.add('hds-reveal', 'motion-safe:transition-all', 'motion-safe:duration-700', 'motion-safe:ease-hds');
        if (!reduceMotion && observer) node.classList.add('opacity-0', 'translate-y-6');
      }
      if (reduceMotion || !observer) revealNow(node);
      else if (!node.classList.contains('hds-in')) observer.observe(node);
    });
  }

  function enhanceInteractive(root = document) {
    root.querySelectorAll?.('.btn, .shop-filter-chip, .service-category-card, .shop-package-card, .shop-service-card, .growth-step, .case-card').forEach(node => {
      node.classList.add('motion-safe:transition-all', 'motion-safe:duration-300', 'motion-safe:ease-hds');
    });
  }

  function init() {
    revealNodes(document);
    enhanceInteractive(document);

    const watcher = new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        revealNodes(node);
        enhanceInteractive(node);
      }));
    });
    watcher.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
