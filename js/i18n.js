// js/i18n.js
// Requires js/translations.js to be loaded first

class I18nEngine {
  constructor(dictionary) {
    this.dictionary = dictionary || {};
    this.currentLang = localStorage.getItem('ns_lang') || 'es';
    this.supportedLangs = {
      es: '🇪🇸 ES',
      en: '🇺🇸 EN'
    };
  }

  // Initialize and translate immediately
  init() {
    this.translateDOM();
    this.updateLanguageToggles();
    this.setupDropdowns();
  }

  // Change language and translate immediately
  changeLanguage(lang) {
    if (!this.supportedLangs[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('ns_lang', lang);
    this.translateDOM();
    this.updateLanguageToggles();
    
    // Dispatch a custom event so other scripts (like app.js) can re-render dynamic content
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  // Translate all elements with data-i18n attribute
  translateDOM() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.dictionary[key] && this.dictionary[key][this.currentLang]) {
        // If it's an input placeholder, update the placeholder
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = this.dictionary[key][this.currentLang];
        } else {
          // Use innerHTML to support embedded tags like <span> or <br> within translations
          el.innerHTML = this.dictionary[key][this.currentLang];
        }
      } else if (this.dictionary[key] && this.dictionary[key]['en']) {
        // Fallback to English if translation is missing
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = this.dictionary[key]['en'];
        } else {
          el.innerHTML = this.dictionary[key]['en'];
        }
      }
    });

    // Also translate placeholders separately if requested via data-i18n-ph
    const phElements = document.querySelectorAll('[data-i18n-ph]');
    phElements.forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (this.dictionary[key] && this.dictionary[key][this.currentLang]) {
        el.placeholder = this.dictionary[key][this.currentLang];
      } else if (this.dictionary[key] && this.dictionary[key]['en']) {
        el.placeholder = this.dictionary[key]['en'];
      }
    });
  }

  // Update UI toggles
  updateLanguageToggles() {
    // Update the main toggle button text
    const toggleBtns = document.querySelectorAll('.nav__lang-toggle');
    const label = this.supportedLangs[this.currentLang] || '🇪🇸 ES';
    toggleBtns.forEach(btn => {
      btn.innerHTML = label;
    });

    // Update active state in dropdowns
    const options = document.querySelectorAll('.lang-option');
    options.forEach(opt => {
      if (opt.getAttribute('data-lang') === this.currentLang) {
        opt.classList.add('active-lang');
      } else {
        opt.classList.remove('active-lang');
      }
    });
  }

  // Setup click events for the dropdown menus
  setupDropdowns() {
    const pickers = document.querySelectorAll('.lang-picker');
    pickers.forEach(picker => {
      const btn = picker.querySelector('.nav__lang-toggle');
      const dropdown = picker.querySelector('.lang-dropdown');
      
      if (!btn || !dropdown) return;

      // Toggle dropdown on button click
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Close other dropdowns
        document.querySelectorAll('.lang-dropdown').forEach(d => {
          if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.toggle('active');
      });

      // Handle option clicks
      const options = picker.querySelectorAll('.lang-option');
      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const lang = opt.getAttribute('data-lang');
          if (lang) {
            this.changeLanguage(lang);
          }
          dropdown.classList.remove('active');
        });
      });
    });

    // Click outside to close
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-dropdown').forEach(d => {
        d.classList.remove('active');
      });
    });
  }
  
  getCurrentLanguage() {
    return this.currentLang;
  }
}

// Global instance
window.i18n = new I18nEngine(window.TRANSLATIONS || (typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS : {}));

// Provide fallback for existing code
window.getCurrentLanguage = () => window.i18n.getCurrentLanguage();

document.addEventListener('DOMContentLoaded', () => {
  window.i18n.init();
});
