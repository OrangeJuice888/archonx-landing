/* ================================================
   ARCHONX.AI — MINIMAL INTERACTIONS
   Clean scroll reveals, counters, nav
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // =================== NAVBAR ===================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // =================== MOBILE NAV ===================
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // =================== SMOOTH SCROLL ===================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 60;
                const pos = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            }
        });
    });

    // =================== REVEAL ON SCROLL ===================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // =================== COUNTER ANIMATION ===================
    const counters = document.querySelectorAll('.counter, .hero-stat-value[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const duration = 1600;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(easedProgress * target);
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(update);
    }

    // =================== IMPACT RINGS ===================
    const svgNS = 'http://www.w3.org/2000/svg';
    const svgDefs = document.createElementNS(svgNS, 'svg');
    svgDefs.setAttribute('width', '0');
    svgDefs.setAttribute('height', '0');
    svgDefs.style.position = 'absolute';
    svgDefs.innerHTML = `
        <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1d1d1f;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#86868b;stop-opacity:1" />
            </linearGradient>
        </defs>
    `;
    document.body.appendChild(svgDefs);

    const impactRings = document.querySelectorAll('.impact-ring-fill');
    const ringObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target;
                const percent = parseInt(circle.dataset.percent);
                const circumference = 2 * Math.PI * 54;
                const offset = circumference - (percent / 100) * circumference;
                circle.style.strokeDashoffset = offset;
                ringObserver.unobserve(circle);
            }
        });
    }, { threshold: 0.5 });

    impactRings.forEach(ring => ringObserver.observe(ring));
});
