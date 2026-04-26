/* translate.js - Custom Google Translate Switcher */

function setCookie(key, value, expiry) {
  var expires = new Date();
  expires.setTime(expires.getTime() + (expiry * 24 * 60 * 60 * 1000));
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'es', 
    includedLanguages: 'en,es', 
    autoDisplay: false
  }, 'google_translate_element');
}

function changeLanguage(lang) {
  // Set the native Google Translate cookie so it persists across page loads instantly
  if (lang === 'en') {
    setCookie('googtrans', '/es/en', 30);
  } else {
    // Clear or set to es
    setCookie('googtrans', '/es/es', 30);
    // Also try clearing it just in case
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  localStorage.setItem('ns_lang', lang);
  
  // Trigger Google Translate dropdown if it exists
  const selectField = document.querySelector(".goog-te-combo");
  if (selectField) {
    selectField.value = lang;
    if (typeof Event === 'function') {
      selectField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    } else {
      const event = document.createEvent('HTMLEvents');
      event.initEvent('change', true, true);
      selectField.dispatchEvent(event);
    }
  } else {
    // If it doesn't exist yet, reload the page to apply the cookie
    window.location.reload();
    return;
  }
  
  updateLanguageUI(lang);
}

function updateLanguageUI(lang) {
  const toggleBtns = document.querySelectorAll('.nav__lang-toggle');
  
  toggleBtns.forEach(btn => {
    if (lang === 'en') {
      btn.innerHTML = '🇺🇸 EN';
      btn.onclick = (e) => {
        e.preventDefault();
        changeLanguage('es');
      };
    } else {
      btn.innerHTML = '🇪🇸 ES';
      btn.onclick = (e) => {
        e.preventDefault();
        changeLanguage('en');
      };
    }
  });

  applyManualOverrides(lang);
}

function applyManualOverrides(lang) {
  const map = [
    { es: 'Inicio', en: 'Home' },
    { es: 'Propiedades', en: 'Properties' },
    { es: 'Calculadora', en: 'Calculator' },
    { es: 'Agendar Tour', en: 'Schedule Tour' },
    { es: 'Publicar', en: 'Publish' },
    { es: 'Nosotros', en: 'About Us' },
    { es: 'Contactar', en: 'Contact Us' },
    { es: 'Contactar Ahora', en: 'Contact Now' },
    { es: 'Agenda un tour y conoce tu próxima propiedad', en: 'Schedule a tour and see your next property' },
    { es: 'Agenda tu Visita', en: 'Schedule Your Visit' },
    { es: 'Login', en: 'Login' },
    { es: 'Login / Iniciar Sesión', en: 'Login / Iniciar Sesión' },
    { es: '¿No tienes cuenta?', en: 'No account?' },
    { es: 'Sign Up', en: 'Sign Up' }
  ];

  map.find(m => m.es === 'Login / Iniciar Sesión').en = 'Login';
  const targetLang = lang === 'en' ? 'en' : 'es';

  const selectors = 'a, button, h1, h2, h3, .nav__link, .btn, .nav__signup-text';
  document.querySelectorAll(selectors).forEach(el => {
    if (el.children.length === 0) {
      const text = el.textContent.trim();
      const match = map.find(m => m.es === text || m.en === text);
      if (match) {
        el.textContent = match[targetLang];
      }
    } else {
      el.childNodes.forEach(node => {
        if (node.nodeType === 3) {
          const text = node.textContent.trim();
          const match = map.find(m => m.es === text || m.en === text);
          if (match) {
            node.textContent = match[targetLang];
          }
        }
      });
    }
  });
}

window.getCurrentLanguage = function() {
  return localStorage.getItem('ns_lang') || 'es';
};

// Run IMMEDIATELY on DOMContentLoaded, DO NOT wait for Google Translate
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('ns_lang') || 'es';
  
  // 1. Instantly apply our manual UI overrides (fixes nav jump)
  updateLanguageUI(savedLang);

  // 2. We don't need to manually trigger the combo box on load anymore 
  // because we set the 'googtrans' cookie. Google Translate reads it natively!
});
