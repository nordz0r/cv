let currentLang = 'ru';

function getMenuToggleLabel(isOpen) {
    if (currentLang === 'en') {
        return isOpen ? 'Close menu' : 'Open menu';
    }
    return isOpen ? 'Закрыть меню' : 'Открыть меню';
}

function getPlural(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
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
    const originalLayout = document.body.dataset.layout;
    document.body.classList.add('exporting-pdf');
    document.body.dataset.layout = 'print';

    const restoreExportState = () => {
        document.body.classList.remove('exporting-pdf');
        document.body.dataset.layout = originalLayout;
        if (btn) btn.disabled = false;
    };

    const container = document.querySelector('.container');
    const nameEl = document.querySelector('[data-i18n="hero-name"]');
    const filename = (nameEl ? nameEl.textContent.replace(/\s+/g, '_') : 'CV') + '.pdf';

    const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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

// Scroll-linked progress and CI/CD loop
function initScrollEffects() {
    const bar = document.getElementById('scroll-progress');
    const loopPath = document.getElementById('cicd-loop-path');
    const loopRunner = document.getElementById('cicd-loop-runner');
    const skills = document.getElementById('skills');
    const experience = document.getElementById('experience');
    const education = document.getElementById('education');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!bar && !loopPath) return;

    let frameId = null;
    let pathLength = 0;

    const update = () => {
        frameId = null;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) {
            const pageProgress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
            bar.style.transform = `scaleX(${pageProgress})`;
        }

        if (!loopPath) return;

        if (reducedMotion.matches) {
            loopPath.style.strokeDashoffset = '0';
            if (loopRunner) loopRunner.style.display = 'none';
            return;
        }

        if (loopRunner) loopRunner.style.removeProperty('display');
        if (!skills || (!education && !experience)) return;

        const loopStart = skills.getBoundingClientRect().top + scrollTop;
        const contentEnd = Math.max(
            experience ? experience.getBoundingClientRect().bottom + scrollTop : 0,
            education ? education.getBoundingClientRect().bottom + scrollTop : 0
        );
        const loopEnd = Math.min(contentEnd, maxScroll);
        const loopProgress = loopEnd > loopStart
            ? Math.min(Math.max((scrollTop - loopStart) / (loopEnd - loopStart), 0), 1)
            : 0;

        loopPath.style.strokeDashoffset = String(1 - loopProgress);

        if (loopRunner && pathLength > 0) {
            const point = loopPath.getPointAtLength(pathLength * loopProgress);
            loopRunner.setAttribute('cx', point.x);
            loopRunner.setAttribute('cy', point.y);
        }
    };

    const requestUpdate = () => {
        if (frameId === null) frameId = window.requestAnimationFrame(update);
    };

    if (loopPath) {
        try {
            pathLength = loopPath.getTotalLength();
        } catch (_) {
            pathLength = 0;
        }
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    window.addEventListener('cv:layoutchange', requestUpdate);
    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', requestUpdate);
    } else {
        reducedMotion.addListener(requestUpdate);
    }
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
        link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            toggle.focus();
        }
    });
}

function initLayoutSwitcher() {
    const buttons = Array.from(document.querySelectorAll('.layout-btn[data-layout]'));
    if (!buttons.length) return;

    const layouts = new Set(buttons.map((button) => button.dataset.layout));
    let savedLayout = null;

    try {
        savedLayout = window.localStorage.getItem('cv-layout');
    } catch (_) {
        // Storage can be unavailable in private or restricted browsing contexts.
    }

    const applyLayout = (layout, persist = false) => {
        if (!layouts.has(layout)) return;

        document.body.dataset.layout = layout;
        buttons.forEach((button) => {
            const isActive = button.dataset.layout === layout;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
        window.dispatchEvent(new Event('cv:layoutchange'));

        if (persist) {
            try {
                window.localStorage.setItem('cv-layout', layout);
            } catch (_) {
                // Keep the selected layout for this page session when storage is unavailable.
            }
        }
    };

    applyLayout(layouts.has(savedLayout) ? savedLayout : document.body.dataset.layout);
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            applyLayout(button.dataset.layout, true);

            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.getElementById('nav-links');
            if (menuToggle && navLinks && menuToggle.getAttribute('aria-expanded') === 'true') {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', getMenuToggleLabel(false));
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateDynamicDates();
    initContacts();
    initScrollEffects();
    initMobileMenu();
    initLayoutSwitcher();

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLanguage(e.target.dataset.lang);
        });
    });
});
