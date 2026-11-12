let currentLang = 'ru';

if (new URLSearchParams(window.location.search).has('pdf-preview')) {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('exporting-pdf');
    });
}

function getMenuToggleLabel(isOpen) {
    if (currentLang === 'en') {
        return isOpen ? 'Close menu' : 'Open menu';
    }
    return isOpen ? 'Закрыть меню' : 'Открыть меню';
}

function calculateExperience(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    let result = [];
    if (years > 0) {
        result.push(`${years} ${translations[currentLang][`year-${getPluralKey(years)}`]}`);
    }
    if (months > 0) {
        result.push(`${months} ${translations[currentLang][`month-${getPluralKey(months)}`]}`);
    }
    
    return result.join(currentLang === 'ru' ? ' и ' : ' and ') || translations[currentLang]['less-month'];
}

function getPluralKey(number) {
    if (currentLang === 'en') {
        return number === 1 ? '1' : '2';
    }
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) return '5';
    n %= 10;
    if (n === 1) return '1';
    if (n >= 2 && n <= 4) return '2';
    return '5';
}

function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return `${age} ${translations[currentLang][`year-${getPluralKey(age)}`]}`;
}

function updateDynamicDates() {
    const totalExpElement = document.getElementById('total-exp');
    if (totalExpElement) {
        totalExpElement.textContent = calculateExperience('2010-07-01');
    }
    
    const currentJobExpElement = document.getElementById('current-job-exp');
    if (currentJobExpElement) {
        currentJobExpElement.textContent = calculateExperience('2024-09-01');
    }

    const ageElement = document.getElementById('age');
    if (ageElement) {
        ageElement.textContent = calculateAge('1988-12-04');
    }
}

function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    updateDynamicDates();

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.setAttribute('aria-label', getMenuToggleLabel(menuToggle.getAttribute('aria-expanded') === 'true'));
    }

    window.dispatchEvent(new Event('cv:contentchange'));
}

// Obfuscated contacts — assembled at runtime to reduce static scraping
function initContacts() {
    const xorKey = 23;
    const decode = (chars) => String.fromCharCode(...chars.map((code) => code ^ xorKey));
    const emailUser = decode([121, 120, 101, 115]);
    const emailDomain = decode([112, 120, 123, 115, 113, 126, 121, 116, 127, 114, 100, 57, 101, 98]);
    const phoneRaw = decode([60, 32, 46, 37, 38, 46, 34, 33, 38, 36, 36, 32]);

    const emailLink = document.getElementById('contact-email');
    if (emailLink) {
        const addr = `${emailUser}@${emailDomain}`;
        emailLink.href = 'mai' + 'lto:' + addr;
    }

    const phoneLink = document.getElementById('contact-phone');
    const phoneText = document.getElementById('contact-phone-text');
    if (phoneLink) {
        phoneLink.href = 'te' + 'l:' + phoneRaw;
        if (phoneText) {
            phoneText.textContent = `${phoneRaw.slice(0, 2)} (${phoneRaw.slice(2, 5)}) ${phoneRaw.slice(5, 8)}-${phoneRaw.slice(8, 10)}-${phoneRaw.slice(10, 12)}`;
        }
    }
}

// Export to PDF via html2pdf.js
function exportPDF() {
    const btn = document.querySelector('.btn-pdf');
    if (btn) btn.disabled = true;

    // Temporarily add print class for clean output
    document.body.classList.add('exporting-pdf');

    const restoreExportState = () => {
        document.body.classList.remove('exporting-pdf');
        if (btn) btn.disabled = false;
    };

    const container = document.querySelector('body > .container');
    const nameEl = document.querySelector('[data-i18n="hero-name"]');
    const filename = (nameEl ? nameEl.textContent.replace(/\s+/g, '_') : 'CV') + '.pdf';

    const opt = {
        margin: [6, 6, 6, 6],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#fff',
            windowWidth: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css'] }
    };

    if (typeof html2pdf !== 'function') {
        restoreExportState();
        window.print();
        return;
    }

    html2pdf().set(opt).from(container).save().then(() => {
        restoreExportState();
    }).catch(() => {
        restoreExportState();
    });
}

// The decorative route follows reading anchors; scrolling itself stays native.
function initScrollEffects() {
    const bar = document.getElementById('scroll-progress');
    const nav = document.querySelector('nav');
    const content = document.querySelector('body > .container');
    const background = document.getElementById('cicd-background');
    const route = document.getElementById('cicd-route-light');
    const runner = document.getElementById('cicd-route-runner');
    const colorStops = [...document.querySelectorAll('#cicd-ribbon-color stop')];
    const sections = [...document.querySelectorAll('section[data-scroll-fold]')];
    const jobs = [...document.querySelectorAll('#experience .timeline-item')];
    const timeline = document.querySelector('#experience .timeline');
    const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const landmarks = [document.getElementById('about'), ...jobs, document.getElementById('education')].filter(Boolean);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallScreen = window.matchMedia('(max-width: 620px)');
    if (!content) return;

    const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
    const top = (element) => element.getBoundingClientRect().top + window.scrollY;
    const palette = colorStops.map(stop => getComputedStyle(stop).stopColor.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [118, 247, 220]);
    let frameId = null;
    let dirty = true;
    let previousTime = 0;
    let progress = null;
    let snap = true;
    let maxScroll = 0;
    let readingOffset = 0;
    let anchors = [];
    let sectionMetrics = [];
    let jobMetrics = [];
    let timelineTop = 0;
    let timelineHeight = 1;
    let routeLength = 0;
    try { routeLength = route ? route.getTotalLength() : 0; } catch (_) { /* SVG geometry may be unavailable in print renderers. */ }

    const measure = () => {
        const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 64;
        document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
        maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        readingOffset = navHeight + (window.innerHeight - navHeight) * 0.28;
        // Short final blocks can share a viewport; coalesce their anchors before interpolating.
        anchors = [0, ...landmarks.map(el => clamp(top(el) - readingOffset, 0, maxScroll)), maxScroll]
            .filter((value, index, values) => index === 0 || value > values[index - 1] + 1);
        sectionMetrics = sections.map(element => ({ element, top: top(element) }));
        jobMetrics = jobs.map(element => ({ element, top: top(element) }));
        if (timeline) {
            timelineTop = top(timeline);
            timelineHeight = timeline.offsetHeight || 1;
        }
        dirty = false;
    };

    const readingProgress = (scrollTop) => {
        if (anchors.length < 2) return 0;
        let index = 0;
        while (index < anchors.length - 2 && scrollTop >= anchors[index + 1]) index++;
        const local = clamp((scrollTop - anchors[index]) / (anchors[index + 1] - anchors[index]));
        return (index + local) / (anchors.length - 1);
    };

    const update = (time) => {
        frameId = null;
        if (dirty) measure();
        const scrollTop = clamp(window.scrollY, 0, maxScroll);
        const target = readingProgress(scrollTop);
        const still = reducedMotion.matches || smallScreen.matches;
        const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
        previousTime = time;
        progress = progress === null || snap || still ? target : progress + (target - progress) * (1 - Math.exp(-elapsed / 65));
        if (Math.abs(target - progress) < 0.0001) progress = target;
        snap = false;
        document.body.classList.toggle('is-scrolled', scrollTop > 8);
        if (bar) bar.style.transform = `scaleX(${maxScroll ? scrollTop / maxScroll : 0})`;

        const point = route && routeLength ? route.getPointAtLength(routeLength * progress) : { x: 450, y: 260 };
        // Match the ribbon's user-space gradient, including both passes through its crossing.
        const phase = clamp((point.x - 140) / 620) * (palette.length - 1);
        const base = Math.floor(phase);
        const blend = phase - base;
        const from = palette[base];
        const to = palette[Math.min(base + 1, palette.length - 1)];
        const color = from && to ? `rgb(${from.map((channel, index) => Math.round(channel + (to[index] - channel) * blend)).join(',')})` : 'var(--accent-green)';

        if (!still && route && routeLength) {
            const trail = Math.min(0.055, progress);
            route.style.strokeDasharray = `${trail} ${1 - trail}`;
            route.style.strokeDashoffset = String(trail - progress);
            route.style.color = color;
            if (runner) {
                runner.style.transform = `translate(${point.x - 450}px, ${point.y - 260}px)`;
                runner.style.color = color;
            }
            if (background) background.style.transform = `translate3d(0, ${-24 * progress}px, 0)`;
        } else {
            if (background) background.style.removeProperty('transform');
        }

        const readingTop = maxScroll > 0 && scrollTop >= maxScroll - 1
            ? document.documentElement.scrollHeight
            : scrollTop + readingOffset;
        let activeSection = null;
        sectionMetrics.forEach(metric => { if (metric.top <= readingTop) activeSection = metric.element; });
        links.forEach(link => {
            if (activeSection && link.hash === `#${activeSection.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        let activeJob = -1;
        jobMetrics.forEach((metric, index) => { if (metric.top <= readingTop) activeJob = index; });
        if (activeSection?.id !== 'experience') activeJob = -1;
        jobMetrics.forEach(({ element }, index) => {
            element.classList.toggle('is-reading', index === activeJob);
            element.classList.toggle('is-read', index < activeJob);
            if (index === activeJob) element.style.setProperty('--reading-color', color);
        });
        if (timeline) {
            timeline.style.setProperty('--reading-progress', String(clamp((readingTop - timelineTop) / timelineHeight)));
            timeline.style.setProperty('--reading-color', color);
        }
        if (progress !== target && !document.hidden) frameId = window.requestAnimationFrame(update);
    };

    const requestUpdate = () => {
        if (frameId === null && !document.hidden) frameId = window.requestAnimationFrame(update);
    };
    const invalidate = () => { dirty = true; snap = true; requestUpdate(); };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', invalidate, { passive: true });
    window.addEventListener('cv:contentchange', invalidate);
    window.addEventListener('pageshow', invalidate);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && frameId !== null) { cancelAnimationFrame(frameId); frameId = null; }
        else { snap = true; requestUpdate(); }
    });
    document.addEventListener('keydown', event => {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) snap = true;
    });
    [reducedMotion, smallScreen].forEach(query => {
        if (typeof query.addEventListener === 'function') query.addEventListener('change', invalidate);
        else query.addListener(invalidate);
    });
    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(invalidate);
        observer.observe(content);
        if (nav) observer.observe(nav);
    }
    if (document.fonts?.ready) document.fonts.ready.then(invalidate);
    document.body.classList.add('has-scroll-cut');
    requestUpdate();
}

function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (!toggle || !navLinks) return;

    const setMenuOpen = (isOpen) => {
        navLinks.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', getMenuToggleLabel(isOpen));
    };

    toggle.addEventListener('click', () => {
        setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            toggle.focus();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateDynamicDates();
    initContacts();
    initScrollEffects();
    initMobileMenu();

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLanguage(e.target.dataset.lang);
        });
    });
});
