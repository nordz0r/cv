<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/banner-light.svg">
    <img alt="nordz0r/cv — CV website" src=".github/assets/banner-light.svg" width="100%">
  </picture>
</p>

<p align="center"><a href="README.md">Русский</a> · <b>English</b></p>

<p align="center">
  <a href="https://cv.gldf.ru"><img alt="cv.gldf.ru" src="https://img.shields.io/badge/live-cv.gldf.ru-00e5ff?style=flat-square"></a>
  <img alt="HTML/CSS/JS" src="https://img.shields.io/badge/HTML%2FCSS%2FJS-no_build-e34f26?style=flat-square&logo=html5&logoColor=white">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"></a>
</p>

A single-page résumé site in a DevOps/tech style with a dark theme, animations, and two languages (RU/EN).

## Features

- Modern dark UI with accents
- Sticky navigation and anchor links
- Section reveal animations and a typewriter effect
- Vertical work-experience timeline
- Responsive layout (including a mobile menu)
- RU/EN language switch without reload
- Age and experience calculated automatically
- SVG favicon

## Project structure

- `index.html` — page markup
- `style.css` — styles and responsive layout
- `script.js` — UI logic, animations, i18n switching
- `i18n.js` — RU/EN translation dictionaries

## Running

Open `index.html` in a browser.

To serve it from a local server, use e.g. VSCode Live Server.

## Customization

### Texts

Edit the dictionaries in `i18n.js`:

- `translations.ru` — Russian
- `translations.en` — English

### Styles

The main theme variables are in `:root` in `style.css`.

### Content

Sections and card structure are edited in `index.html`.

## Contacts

- Contacts are intentionally assembled at runtime on the page (`script.js`) to make automated scraping harder.
- Use the **Email**, **Telegram**, **Habr Career** buttons on the résumé page.

## License

MIT, see [LICENSE](LICENSE).
