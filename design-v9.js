/* 2505QLNH | Gentle interaction layer. Does not replace site event listeners. */
(() => {
  'use strict';
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    document.addEventListener('pointerdown', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled || button.closest('#drawer') || button.closest('.regForm')) return;
      // Pure visual feedback only; do not block or delay the site's existing click events.
      if (window.getComputedStyle(button).position === 'static') button.style.position = 'relative';
      button.style.overflow = 'hidden';
      const r = button.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.className = 'g9Ripple';
      dot.setAttribute('aria-hidden', 'true');
      dot.style.left = `${event.clientX - r.left - 7}px`;
      dot.style.top = `${event.clientY - r.top - 7}px`;
      button.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), {once:true});
    }, {passive:true});
  }
  // Animate only static home sections. Dynamically generated voting/forms remain untouched.
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('g9Reveal');
        io.unobserve(entry.target);
      }
    }, {threshold:.09,rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.homeSectionHead,.homeLinks button,.g9Heritage,.news-section-heading').forEach(node => io.observe(node));
  }
})();
