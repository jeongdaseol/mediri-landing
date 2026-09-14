const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  // No IntersectionObserver support: show content immediately rather than
  // leaving it permanently hidden behind opacity:0.
  revealItems.forEach((item) => item.classList.add('in-view'));
}

const flow = document.querySelector('[data-flow]');
const flowItems = flow ? [...flow.querySelectorAll('.flow-item')] : [];
if (flow && flowItems.length) {
  const flowObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    let current = 0;
    const timer = window.setInterval(() => {
      flowItems.forEach((item, index) => item.classList.toggle('active', index === current));
      current += 1;
      if (current === flowItems.length) window.clearInterval(timer);
    }, 520);
    flowObserver.unobserve(flow);
  }, { threshold: 0.35 });
  flowObserver.observe(flow);
}

document.querySelectorAll('.top-nav a, .text-link, .wordmark').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || !targetId.startsWith('#')) return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Arrow / Page keys: step one section at a time.
const sectionTargets = [...document.querySelectorAll('main > section')];
if (sectionTargets.length) {
  let animating = false;
  const header = document.querySelector('.site-header');
  // Snap to each section's first real content block, not its padding box,
  // so sections with large top padding don't land on empty space.
  const anchorTop = (section) => {
    const anchor = section.querySelector('.section-kicker, .hero-copy, .closing-inner') || section;
    // offsetTop chain ignores the reveal transform, so the target doesn't shift
    // by 28px once the section animates in.
    let top = 0;
    let node = anchor;
    while (node) { top += node.offsetTop; node = node.offsetParent; }
    const gap = (header ? header.offsetHeight : 76) + 68;
    return Math.max(0, top - gap);
  };
  const currentIndex = () => {
    const y = window.scrollY + 40;
    let index = 0;
    sectionTargets.forEach((section, i) => {
      if (anchorTop(section) <= y) index = i;
    });
    return index;
  };
  const goTo = (index) => {
    const target = sectionTargets[Math.max(0, Math.min(sectionTargets.length - 1, index))];
    if (!target) return;
    animating = true;
    window.scrollTo({ top: Math.max(0, anchorTop(target)), behavior: 'smooth' });
    window.setTimeout(() => { animating = false; }, 620);
  };
  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;
    let direction = 0;
    if (event.key === 'ArrowDown' || event.key === 'PageDown') direction = 1;
    if (event.key === 'ArrowUp' || event.key === 'PageUp') direction = -1;
    if (!direction) return;
    event.preventDefault();
    if (animating) return;
    const index = currentIndex();
    // Down from mid-section first snaps to that section's start.
    const atSectionStart = Math.abs(window.scrollY - anchorTop(sectionTargets[index])) < 60;
    goTo(direction > 0 ? index + 1 : (atSectionStart ? index - 1 : index));
  });
}
