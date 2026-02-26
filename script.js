let currentLang = 'ru';

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
}

document.addEventListener('DOMContentLoaded', () => {
    updateDynamicDates();

    // Mobile menu auto-close
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
            }
        });
    });

    // Stagger animation for tags
    const tags = document.querySelectorAll('.tag');
    tags.forEach((tag, index) => {
        setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 800 + (index * 30));
    });

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLanguage(e.target.dataset.lang);
        });
    });
});