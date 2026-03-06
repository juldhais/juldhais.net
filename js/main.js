// Typing animation
(function () {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = ['Software Engineer', '.NET C# Programmer', 'Full-Stack Developer'];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const typeSpeed = 90;
  const backSpeed = 50;
  const pauseAfterType = 1800;
  const pauseAfterDelete = 400;

  function tick() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, pauseAfterType);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, pauseAfterDelete);
        return;
      }
      setTimeout(tick, backSpeed);
    }
  }

  setTimeout(tick, 500);
})();

// Mobile nav toggle
(function () {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    links.classList.toggle('open');
  });

  // Close menu on link click
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
    });
  });
})();
