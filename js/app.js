/* ============================================
   NUEVO SOL INVERSIONES — Main Application
   Core JS: Nav, animations, cards, calculator,
   AI search, lightbox, lazy loading
   ============================================ */

(function () {
  'use strict';

  // ── Data Store ──
  let propertiesData = [];
  let companyData = {};

  // ── DOM Ready ──
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    await loadData();
    initNavigation();
    initScrollAnimations();
    initCounterAnimations();
    initLazyLoading();
    renderFeaturedProperties();
    initMortgageCalculator();
    initAISearch();
    initLightbox();
    initQuickFilters();
    initCategoryCardHover();
    initTourDropdown();
  }

  // ── Embedded Property Data (fallback for file:// protocol) ──
  const EMBEDDED_DATA = {
    "company": {
      "name": "Nuevo Sol Inversiones",
      "tagline": "Tu futuro comienza con una inversión inteligente",
      "phone": "+1 (809) 697-2050",
      "whatsapp": "18096972050",
      "email": "nuevosolinversionesrd@gmail.com",
      "address": "Santo Domingo, República Dominicana",
      "city": "Santo Domingo",
      "country": "República Dominicana",
      "social": {
        "instagram": "https://www.instagram.com/nuevosol.inversiones",
        "facebook": "https://www.facebook.com/profile.php?id=61574348483343"
      }
    },
    "properties": [
      {
        "id": "NSI-2604-LIX2",
        "title": "Casa / Mansión 3 Niveles – Los Ríos",
        "slug": "mansion-3-niveles-los-rios",
        "type": "Casa",
        "category": "luxury",
        "badge": "Destacada",
        "price": 1000000,
        "currency": "USD",
        "location": {
          "neighborhood": "Los Ríos",
          "city": "Santo Domingo",
          "province": "Distrito Nacional"
        },
        "features": {
          "bedrooms": 6,
          "bathrooms": 5,
          "half_bathrooms": 2,
          "area_m2": 600,
          "land_m2": 1000,
          "parking": 10,
          "floors": 3,
          "year_built": null
        },
        "amenities": [
          "Sala",
          "Comedor",
          "Cocina Fría",
          "Cocina Caliente",
          "Balcón",
          "Terraza",
          "Estudio",
          "Área de Lavado",
          "Cuartos de Servicio",
          "Patio Trasero",
          "Cisterna 3,000 Galones",
          "Planta Eléctrica Full",
          "Cámaras de Seguridad",
          "Intercom",
          "Gas Común",
          "Jacuzzi",
          "Walking Closet",
          "Jardinera Frontal"
        ],
        "description": "Majestuosa casa de 3 niveles, donde el primer piso tiene la particularidad de ser estilo sótano, diseñada para ofrecer amplitud, comodidad y funcionalidad en cada uno de sus espacios. La propiedad cuenta con entrada principal y accesos laterales, una distribución pensada para la vida familiar, el entretenimiento y el servicio, así como amplias áreas interiores y exteriores.\n\nEn el primer nivel se encuentran elegantes áreas sociales, incluyendo dos salas, una sala adicional, oficina, comedor principal, comedor de diario, cocina de gran tamaño con dos credenzas, balcones y un amplio lobby central que conecta armoniosamente con el segundo nivel y el sótano.\n\nEl sótano ofrece entrada interna y externa, dos habitaciones con baño compartido, dos cuartos de servicio con baño independiente, área de lavado y planchado, tendedero y cuarto de almacén.\n\nEn el segundo nivel se destacan 4 habitaciones de generosas dimensiones. La habitación principal cuenta con baño completo, dos lavamanos, dos walking closets en cedro, jacuzzi y ventana corrediza con vista al patio. Las habitaciones secundarias también cuentan con jacuzzi, walking closet y acceso a balcón.\n\nCapacidad total de estacionamiento para 11 vehículos: marquesina sin techo para 5, techada para 2 y espacio exterior para 4 adicionales.",
        "description_short": "Majestuosa mansión de 3 niveles con 6 habitaciones, jacuzzi, planta eléctrica full y capacidad para 11 vehículos en Los Ríos.",
        "status_label": "Listo / Reventa",
        "finishes": "Pisos de porcelanato de primera, terminación en caoba (puertas, gabinetes, etc.)",
        "documents": [
          "Título de Propiedad",
          "IPI al Día",
          "Planos"
        ],
        "images": [
          "assets/images/properties/NSI-2604-LIX2/NKN_0023.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0012.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0037.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0160.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0177.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0183.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0152.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0132.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0113.jpg",
          "assets/images/properties/NSI-2604-LIX2/NKN_0054.jpg"
        ],
        "hero_image": "assets/images/properties/NSI-2604-LIX2/NKN_0023.jpg",
        "thumbnail": "assets/images/properties/NSI-2604-LIX2/NKN_0023.jpg",
        "featured": true,
        "status": "available"
      }
    ]
  };

  // ── Load Property Data ──
  async function loadData() {
    try {
      const response = await fetch('data/properties.json');
      const data = await response.json();
      propertiesData = data.properties || [];
      companyData = data.company || {};
    } catch (e) {
      console.warn('Fetch failed (likely file:// protocol), using embedded data');
      propertiesData = EMBEDDED_DATA.properties;
      companyData = EMBEDDED_DATA.company;
    }
  }

  // ══════════════════════════════════════════
  // NAVIGATION
  // ══════════════════════════════════════════
  function initNavigation() {
    const nav = document.getElementById('mainNav');
    const hamburger = document.getElementById('navHamburger');
    const mobileNav = document.getElementById('navMobile');

    if (!nav) return;

    // Scroll behavior
    let lastScroll = 0;
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          if (currentScroll > 80) {
            nav.classList.remove('nav--transparent');
            nav.classList.add('nav--solid');
          } else {
            nav.classList.add('nav--transparent');
            nav.classList.remove('nav--solid');
          }
          lastScroll = currentScroll;
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Hamburger menu
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', mobileNav.classList.contains('active'));
      });
    }

    // Close mobile nav function (global)
    window.closeMobileNav = function () {
      if (hamburger) hamburger.classList.remove('active');
      if (mobileNav) mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    };
  }

  // ══════════════════════════════════════════
  // SCROLL ANIMATIONS (IntersectionObserver)
  // ══════════════════════════════════════════
  function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale, .stagger');

    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  // ══════════════════════════════════════════
  // COUNTER ANIMATIONS
  // ══════════════════════════════════════════
  function initCounterAnimations() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString() + (target >= 100 ? '+' : '+');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ══════════════════════════════════════════
  // LAZY LOADING (native + intersection)
  // ══════════════════════════════════════════
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    // Native lazy loading is supported in all modern browsers
    // Add loaded class for CSS transitions
    images.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
      }
    });
  }

  // ══════════════════════════════════════════
  // RENDER FEATURED PROPERTIES
  // ══════════════════════════════════════════
  function renderFeaturedProperties() {
    const grid = document.getElementById('featuredGrid');
    if (!grid || !propertiesData.length) return;

    const featured = propertiesData.filter(p => p.featured).slice(0, 6);

    grid.innerHTML = featured.map(prop => createPropertyCard(prop)).join('');
  }

  function createPropertyCard(prop) {
    const badgeClass = {
      'luxury': 'badge-luxury',
      'lowcost': 'badge-lowcost'
    }[prop.category] || 'badge-new';

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: prop.currency,
      maximumFractionDigits: 0
    }).format(prop.price);

    return `
      <article class="property-card" onclick="window.location.href='propiedad.html?id=${prop.id}'" role="link" tabindex="0" aria-label="${prop.title}">
        <div class="property-card__image-wrap">
          <img class="property-card__image" 
               src="${prop.thumbnail}" 
               alt="${prop.title} - ${prop.location.neighborhood}, ${prop.location.city}"
               loading="lazy"
               width="400" height="300">
          <span class="property-card__badge ${badgeClass}">${prop.badge}</span>
          <button class="property-card__favorite" aria-label="Guardar como favorito" onclick="event.stopPropagation(); this.classList.toggle('active');">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
        <div class="property-card__body">
          <div class="property-card__location">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
              <div style="display:flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                ${prop.location.neighborhood}, ${prop.location.city}
              </div>
              <button class="copy-id-btn" onclick="event.stopPropagation(); window.copyToClipboard('${prop.id}', this)" style="cursor:pointer; background:none; border:none; padding:0; display:flex; align-items:center; gap:4px; font-family:inherit; transition: color 0.2s;">
                <span style="font-size:10px; color:var(--color-gray-400); font-weight:600; letter-spacing:0.05em;">REF: ${prop.id}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
          <h3 class="property-card__title">${prop.title}</h3>
          <div class="property-card__price">${formattedPrice} <span>${prop.currency}</span></div>
          <div class="property-card__features">
            <div class="property-card__feature">
              <svg viewBox="0 0 24 24"><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M21 7H3l2-4h14l2 4z"/><path d="M12 4v16"/></svg>
              ${prop.features.bedrooms} Hab.
            </div>
            <div class="property-card__feature">
              <svg viewBox="0 0 24 24"><path d="M4 12h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v7"/><path d="M5 17v3"/><path d="M19 17v3"/></svg>
              ${prop.features.bathrooms} Baños
            </div>
            <div class="property-card__feature">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              ${prop.features.area_m2} m²
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // ══════════════════════════════════════════
  // MORTGAGE CALCULATOR
  // ══════════════════════════════════════════
  function initMortgageCalculator() {
    const priceSlider = document.getElementById('calcPrice');
    const downSlider = document.getElementById('calcDown');
    const rateSlider = document.getElementById('calcRate');
    const termSlider = document.getElementById('calcTerm');

    if (!priceSlider) return;

    const inputs = [priceSlider, downSlider, rateSlider, termSlider];
    inputs.forEach(input => {
      input.addEventListener('input', updateCalculator);
    });

    updateCalculator();
  }

  function updateCalculator() {
    const price = parseFloat(document.getElementById('calcPrice').value);
    const downPercent = parseFloat(document.getElementById('calcDown').value);
    const rate = parseFloat(document.getElementById('calcRate').value);
    const term = parseInt(document.getElementById('calcTerm').value);

    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = (rate / 100) / 12;
    const numberOfPayments = term * 12;

    let monthlyPayment;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numberOfPayments;
    } else {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    // Update display values
    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

    const priceVal = document.getElementById('calcPriceValue');
    const downVal = document.getElementById('calcDownValue');
    const rateVal = document.getElementById('calcRateValue');
    const termVal = document.getElementById('calcTermValue');
    const result = document.getElementById('calcResult');
    const loanEl = document.getElementById('calcLoanAmount');
    const totalEl = document.getElementById('calcTotalPayment');
    const interestEl = document.getElementById('calcTotalInterest');
    const downEl = document.getElementById('calcDownPayment');

    if (priceVal) priceVal.textContent = fmt(price);
    if (downVal) downVal.textContent = `${downPercent}% (${fmt(downPayment)})`;
    if (rateVal) rateVal.textContent = `${rate}%`;
    if (termVal) termVal.textContent = `${term} años`;
    if (result) result.textContent = fmt(monthlyPayment);
    if (loanEl) loanEl.textContent = fmt(loanAmount);
    if (totalEl) totalEl.textContent = fmt(totalPayment);
    if (interestEl) interestEl.textContent = fmt(totalInterest);
    if (downEl) downEl.textContent = fmt(downPayment);
  }

  // ══════════════════════════════════════════
  // AI SEARCH
  // ══════════════════════════════════════════
  function initAISearch() {
    const input = document.getElementById('aiSearchInput');
    const btn = document.getElementById('aiSearchBtn');
    const resultsContainer = document.getElementById('aiResults');

    if (!input || !btn) return;

    btn.addEventListener('click', () => performAISearch(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performAISearch(input.value);
    });
  }

  function performAISearch(query) {
    const resultsContainer = document.getElementById('aiResults');
    if (!query.trim() || !resultsContainer) return;

    // Show thinking animation
    resultsContainer.classList.add('active');
    resultsContainer.innerHTML = `
      <div class="ai-results__thinking">
        <div class="ai-results__dots"><span></span><span></span><span></span></div>
        <span>Buscando propiedades que coincidan con tu descripción...</span>
      </div>
    `;

    // Simulate AI search with local filtering
    setTimeout(() => {
      const results = smartSearch(query);
      renderSearchResults(results, resultsContainer);
    }, 1500);
  }

  function smartSearch(query) {
    const q = query.toLowerCase();
    
    return propertiesData.map(prop => {
      let score = 0;
      const text = `${prop.title} ${prop.description} ${prop.type} ${prop.category} ${prop.location.neighborhood} ${prop.location.city} ${prop.amenities.join(' ')}`.toLowerCase();

      // Type matching
      if ((q.includes('casa') || q.includes('house')) && prop.type.toLowerCase() === 'casa') score += 30;
      if ((q.includes('apartamento') || q.includes('apartment') || q.includes('apto')) && prop.type.toLowerCase() === 'apartamento') score += 30;
      if ((q.includes('villa')) && prop.type.toLowerCase() === 'villa') score += 30;
      if ((q.includes('penthouse') || q.includes('pent')) && prop.type.toLowerCase() === 'penthouse') score += 30;

      // Category matching
      if ((q.includes('lujo') || q.includes('luxury') || q.includes('exclusiv') || q.includes('premium')) && prop.category === 'luxury') score += 25;
      if ((q.includes('económic') || q.includes('barato') || q.includes('accesible') || q.includes('bajo costo') || q.includes('económ')) && prop.category === 'lowcost') score += 25;

      // Room matching
      const roomMatch = q.match(/(\d+)\s*(hab|cuarto|room|dormit)/);
      if (roomMatch) {
        const rooms = parseInt(roomMatch[1]);
        if (prop.features.bedrooms === rooms) score += 20;
        if (prop.features.bedrooms >= rooms) score += 10;
      }

      // Price matching
      const priceMatch = q.match(/(\d[\d,]*)\s*(mil|k|usd|\$|dolar|peso)/i);
      if (priceMatch) {
        let priceTarget = parseInt(priceMatch[1].replace(/,/g, ''));
        if (q.includes('mil') || q.includes('k')) priceTarget *= 1000;
        if (prop.price <= priceTarget * 1.2) score += 15;
      }

      if (q.includes('menos de') || q.includes('menos')) {
        const lessMatch = q.match(/menos\s*de?\s*[\$]?(\d[\d,]*)/);
        if (lessMatch) {
          let maxPrice = parseInt(lessMatch[1].replace(/,/g, ''));
          if (maxPrice < 1000) maxPrice *= 1000;
          if (prop.price <= maxPrice) score += 20;
        }
      }

      // Location matching
      if (q.includes('ríos') || q.includes('rios')) {
        if (prop.location.neighborhood.toLowerCase().includes('ríos')) score += 20;
      }
      if (q.includes('piantini')) {
        if (prop.location.neighborhood.toLowerCase().includes('piantini')) score += 20;
      }
      if (q.includes('naco')) {
        if (prop.location.neighborhood.toLowerCase().includes('naco')) score += 20;
      }
      if (q.includes('juan dolio') || q.includes('playa') || q.includes('mar') || q.includes('beach')) {
        if (prop.location.neighborhood.toLowerCase().includes('juan dolio') || text.includes('playa') || text.includes('mar')) score += 20;
      }

      // Amenity matching
      if ((q.includes('piscina') || q.includes('pool')) && text.includes('piscina')) score += 15;
      if ((q.includes('terraza') || q.includes('balcón') || q.includes('balcon')) && (text.includes('terraza') || text.includes('balcón'))) score += 10;
      if ((q.includes('jardín') || q.includes('jardin') || q.includes('garden')) && text.includes('jardín')) score += 10;
      if ((q.includes('seguridad') || q.includes('security')) && text.includes('seguridad')) score += 5;

      // General word matching
      const words = q.split(/\s+/).filter(w => w.length > 3);
      words.forEach(word => {
        if (text.includes(word)) score += 3;
      });

      return { ...prop, score };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  }

  function renderSearchResults(results, container) {
    if (!results.length) {
      container.innerHTML = `
        <div style="padding:var(--space-5);background:rgba(255,255,255,0.08);border-radius:var(--radius-lg);text-align:center;">
          <p style="color:rgba(255,255,255,0.7);font-size:var(--text-sm);margin:0;">No encontramos propiedades que coincidan exactamente. Prueba con otros términos o <a href="propiedades.html" style="color:var(--color-gold-light);text-decoration:underline;">explora todo nuestro catálogo</a>.</p>
        </div>
      `;
      return;
    }

    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-4);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-light)" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M18 14a6 6 0 0 1-12 0"/></svg>
        <span style="color:rgba(255,255,255,0.6);font-size:var(--text-sm);">${results.length} propiedad${results.length > 1 ? 'es' : ''} encontrada${results.length > 1 ? 's' : ''}</span>
      </div>
      ${results.map(prop => `
        <a href="propiedad.html?id=${prop.id}" style="display:flex;gap:var(--space-4);padding:var(--space-4);background:rgba(255,255,255,0.08);border-radius:var(--radius-lg);margin-bottom:var(--space-3);text-decoration:none;transition:background 0.3s ease;">
          <img src="${prop.thumbnail}" alt="${prop.title}" style="width:80px;height:60px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0;" loading="lazy">
          <div style="flex:1;min-width:0;">
            <h4 style="color:white;font-size:var(--text-sm);font-weight:600;margin-bottom:var(--space-1);font-family:var(--font-display);">${prop.title}</h4>
            <p style="color:rgba(255,255,255,0.5);font-size:var(--text-xs);margin:0;">${prop.location.neighborhood} · ${prop.features.bedrooms} hab · ${prop.features.area_m2}m²</p>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="color:var(--color-gold-light);font-weight:700;font-size:var(--text-sm);font-family:var(--font-display);">${fmt(prop.price)}</div>
          </div>
        </a>
      `).join('')}
      <a href="propiedades.html" style="display:block;text-align:center;padding:var(--space-3);color:var(--color-gold-light);font-size:var(--text-sm);margin-top:var(--space-2);">Ver todas las propiedades →</a>
    `;
  }

  // ══════════════════════════════════════════
  // QUICK FILTERS
  // ══════════════════════════════════════════
  function initQuickFilters() {
    const tags = document.querySelectorAll('.hero__filter-tag');
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        const filter = tag.dataset.filter;
        const value = tag.dataset.value;
        window.location.href = `propiedades.html?${filter}=${encodeURIComponent(value)}`;
      });
    });
  }

  // ══════════════════════════════════════════
  // CATEGORY CARD HOVER
  // ══════════════════════════════════════════
  function initCategoryCardHover() {
    const cards = document.querySelectorAll('.category-card');
    cards.forEach(card => {
      const img = card.querySelector('img');
      if (!img) return;
      card.addEventListener('mouseenter', () => { img.style.transform = 'scale(1.08)'; });
      card.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; });
    });
  }

  // ══════════════════════════════════════════
  // LIGHTBOX
  // ══════════════════════════════════════════
  let lightboxImages = [];
  let lightboxIndex = 0;

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!lightbox) return;

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.id === 'lightboxImage') {
        // Only close if clicking the backdrop, not the image itself
        if (e.target === lightbox) closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  window.openLightbox = function (images, index) {
    console.log('Opening lightbox with images:', images, 'at index:', index);
    lightboxImages = images || [];
    lightboxIndex = index || 0;
    
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) {
      console.error('Lightbox element not found!');
      return;
    }

    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction) {
    const img = document.getElementById('lightboxImage');
    if (img) img.classList.add('loading');

    setTimeout(() => {
      lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
      updateLightboxImage();
    }, 150);
  }

  function updateLightboxImage() {
    const img = document.getElementById('lightboxImage');
    const counter = document.getElementById('lightboxCounter');
    
    if (!img) return;

    const src = lightboxImages[lightboxIndex];
    // Optimize high-res path if naming convention exists
    const highResSrc = src.replace('_400.', '_1920.').replace('_800.', '_1920.');
    
    img.src = highResSrc;
    img.alt = `Imagen ${lightboxIndex + 1} de ${lightboxImages.length}`;

    img.onload = () => {
      img.classList.remove('loading');
    };

    if (counter) counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;

    // Handle Blur for third-party signs (specific logic for this project)
    const blurImages = ['NKN_0006', 'NKN_0007', 'NKN_0008', 'NKN_0009', 'NKN_0021'];
    const needsBlur = blurImages.some(name => src.includes(name));
    let blurOverlay = document.getElementById('lightboxBlur');
    
    if (needsBlur) {
      if (!blurOverlay) {
        blurOverlay = document.createElement('div');
        blurOverlay.id = 'lightboxBlur';
        blurOverlay.style.cssText = `
          position: absolute;
          top: 51%;
          left: 62%;
          width: 8%;
          height: 7%;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 4px;
          pointer-events: none;
          z-index: 10;
        `;
        img.parentElement.appendChild(blurOverlay);
      }
      blurOverlay.style.display = 'block';
    } else if (blurOverlay) {
      blurOverlay.style.display = 'none';
    }
  }

  // ══════════════════════════════════════════
  // UTILITY: Format Currency
  // ══════════════════════════════════════════
  window.formatCurrency = function (amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  function initTourDropdown() {
    const select = document.getElementById('tourProperty');
    if (!select) return;
    propertiesData.forEach(prop => {
      const option = document.createElement('option');
      option.value = prop.title;
      option.textContent = prop.title;
      select.insertBefore(option, select.lastElementChild);
    });
  }

  // ══════════════════════════════════════════
  // PROPERTIES PAGE FUNCTIONS (used by propiedades.html)
  // ══════════════════════════════════════════
  window.getProperties = function () { return propertiesData; };
  window.getCompany = function () { return companyData; };
  window.createPropertyCard = createPropertyCard;
  
  // ── Utility: Copy to Clipboard ──
  window.copyToClipboard = function (text, btn) {
    if (!navigator.clipboard) {
      // Fallback for non-https or older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showFeedback(btn);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      showFeedback(btn);
    }).catch(err => {
      console.error('Clipboard API failed', err);
    });

    function showFeedback(el) {
      const originalHTML = el.innerHTML;
      const originalColor = el.style.color;
      
      el.innerHTML = `<span style="font-size:10px; color:var(--color-gold-dark); font-weight:700;">¡Copiado!</span>`;
      el.style.color = 'var(--color-gold-dark)';
      
      setTimeout(() => {
        el.innerHTML = originalHTML;
        el.style.color = originalColor;
      }, 2000);
    }
  };

})();
