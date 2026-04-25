/* translate.js - Custom Google Translate Switcher */

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'es', 
    includedLanguages: 'en,es', 
    autoDisplay: false
  }, 'google_translate_element');
}

function changeLanguage(lang) {
  const selectField = document.querySelector(".goog-te-combo");
  if (!selectField) {
    // Retry if Google script hasn't fully loaded
    setTimeout(() => changeLanguage(lang), 500);
    return;
  }
  
  selectField.value = lang;
  selectField.dispatchEvent(new Event('change'));
  
  localStorage.setItem('ns_lang', lang);
  updateLanguageUI(lang);
}

function updateLanguageUI(lang) {
  const toggleBtns = document.querySelectorAll('.nav__lang-toggle');
  
  toggleBtns.forEach(btn => {
    if (lang === 'en') {
      btn.innerHTML = '🇪🇸 ES';
      btn.onclick = (e) => {
        e.preventDefault();
        changeLanguage('es');
      };
    } else {
      btn.innerHTML = '🇺🇸 EN';
      btn.onclick = (e) => {
        e.preventDefault();
        changeLanguage('en');
      };
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('ns_lang');
  
  // Wait for Google Translate dropdown to render
  const checkGoogleLoaded = setInterval(() => {
    const selectField = document.querySelector(".goog-te-combo");
    if (selectField) {
      clearInterval(checkGoogleLoaded);
      if (savedLang === 'en') {
        updateLanguageUI('en');
      } else {
        updateLanguageUI('es');
      }
    }
  }, 100);
});
