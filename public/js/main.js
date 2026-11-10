/**
 * Al Quran Academy - Official Website Frontend Scripts
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar shadow on scroll
  const navbar = document.querySelector('.site-navbar');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile navbar auto-close on link click
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        bsCollapse?.hide();
      }
    });
  });

  // 3. Smooth scrolling for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    });
  });

  // 4. Privacy Policy TOC Active Link Highlighting
  const policyBlocks = document.querySelectorAll('.policy-block');
  const tocLinks = document.querySelectorAll('.toc-nav .nav-link');
  
  if (policyBlocks.length > 0 && tocLinks.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active', 'text-emerald', 'fw-bold');
              } else {
                link.classList.remove('active', 'text-emerald', 'fw-bold');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
      }
    );

    policyBlocks.forEach((block) => observer.observe(block));
  }

  // 5. Interactive Demo Verse Highlight for Reading Showcase
  const playButton = document.getElementById('demo-play-btn');
  const verseBoxes = document.querySelectorAll('.quran-ayah-box');
  const progressBar = document.querySelector('.audio-progress-fill');
  let isPlaying = false;
  let currentVerseIndex = 0;
  let playInterval = null;

  if (playButton && verseBoxes.length > 0) {
    playButton.addEventListener('click', () => {
      isPlaying = !isPlaying;
      const icon = playButton.querySelector('i');

      if (isPlaying) {
        if (icon) icon.className = 'bi bi-pause-circle-fill fs-2 text-gold';
        
        // Cycle active verses every 3 seconds to simulate sync player
        playInterval = setInterval(() => {
          verseBoxes.forEach((box) => box.classList.remove('active-verse'));
          currentVerseIndex = (currentVerseIndex + 1) % verseBoxes.length;
          verseBoxes[currentVerseIndex].classList.add('active-verse');
          
          if (progressBar) {
            const percent = ((currentVerseIndex + 1) / verseBoxes.length) * 100;
            progressBar.style.width = `${percent}%`;
          }
        }, 3000);
      } else {
        if (icon) icon.className = 'bi bi-play-circle-fill fs-2 text-gold';
        if (playInterval) clearInterval(playInterval);
      }
    });
  }
});

