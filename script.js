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

// Scroll-linked progress, CI/CD background, and reversible section fold
function initScrollEffects() {
    const bar = document.getElementById('scroll-progress');
    const nav = document.querySelector('nav');
    const content = document.querySelector('body > .container');
    const route = document.getElementById('cicd-route-light');
    const routeRunner = document.getElementById('cicd-route-runner');
    const stages = Array.from(document.querySelectorAll('.cicd-segment[data-stage]'));
    const sections = Array.from(document.querySelectorAll('section[data-scroll-fold]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!bar && !route && !sections.length) return;

    let frameId = null;
    let routeLength = 0;
    let layoutDirty = true;
    let navHeight = 64;
    let sectionMetrics = [];

    const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

    const getDocumentTop = (element) => {
        let top = 0;
        let current = element;
        while (current) {
            top += current.offsetTop || 0;
            current = current.offsetParent;
        }
        return top;
    };

    const measure = () => {
        navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);

        sectionMetrics = sections.map((section) => ({
            section,
            bottom: getDocumentTop(section) + section.offsetHeight,
            range: clamp(section.offsetHeight * 0.1, 88, 148)
        }));

        layoutDirty = false;
    };

    const update = () => {
        frameId = null;
        if (layoutDirty) measure();

        const scrollTop = Math.max(0, window.scrollY || document.documentElement.scrollTop);
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const pageProgress = maxScroll > 0 ? clamp(scrollTop / maxScroll) : 0;

        document.body.classList.toggle('is-scrolled', scrollTop > 8);

        if (bar) {
            bar.style.transform = `scaleX(${pageProgress})`;
        }

        document.documentElement.style.setProperty('--page-progress', pageProgress.toFixed(4));

        if (reducedMotion.matches) {
            if (route) route.style.removeProperty('stroke-dashoffset');
            if (routeRunner) routeRunner.style.display = 'none';
            stages.forEach((stage) => stage.classList.remove('is-active'));
            sectionMetrics.forEach(({ section }) => {
                section.style.setProperty('--fold-progress', '0');
                section.classList.remove('is-folding', 'is-folded');
            });
            return;
        }

        if (route) {
            route.style.strokeDashoffset = String(-pageProgress);
        }

        if (routeRunner && route && routeLength > 0) {
            routeRunner.style.removeProperty('display');
            const point = route.getPointAtLength(routeLength * pageProgress);
            routeRunner.setAttribute('cx', point.x);
            routeRunner.setAttribute('cy', point.y);
        }

        const activeStage = Math.min(stages.length - 1, Math.floor(pageProgress * stages.length));
        stages.forEach((stage, index) => stage.classList.toggle('is-active', index === activeStage));

        const trigger = scrollTop + navHeight;
        sectionMetrics.forEach(({ section, bottom, range }) => {
            const foldProgress = clamp((trigger + range - bottom) / range);
            section.style.setProperty('--fold-progress', foldProgress.toFixed(4));
            section.classList.toggle('is-folding', foldProgress > 0 && foldProgress < 0.98);
            section.classList.toggle('is-folded', foldProgress >= 0.98);
        });
    };

    const requestUpdate = () => {
        if (frameId === null) frameId = window.requestAnimationFrame(update);
    };

    if (route) {
        try {
            routeLength = route.getTotalLength();
        } catch (_) {
            routeLength = 0;
        }
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => {
        layoutDirty = true;
        requestUpdate();
    }, { passive: true });
    window.addEventListener('cv:contentchange', () => {
        layoutDirty = true;
        requestUpdate();
    });

    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', requestUpdate);
    } else {
        reducedMotion.addListener(requestUpdate);
    }

    if ('ResizeObserver' in window && content) {
        const resizeObserver = new ResizeObserver(() => {
            layoutDirty = true;
            requestUpdate();
        });
        resizeObserver.observe(content);
        if (nav) resizeObserver.observe(nav);
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            layoutDirty = true;
            requestUpdate();
        });
    }

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
            const target = document.querySelector(link.hash);
            if (target) {
                target.style.setProperty('--fold-progress', '0');
                target.classList.remove('is-folding', 'is-folded');
            }
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
