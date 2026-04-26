/**
 * contact-guard.js — Nuevo Sol Inversiones
 * ─────────────────────────────────────────
 * Detecta información de contacto (teléfonos, emails, WhatsApp, etc.)
 * en los campos de texto del formulario de publicación.
 *
 * Lógica de suspensiones (almacenada en Firestore):
 *  - Cada intento de colar info de contacto suma 1 a `violations`
 *  - Al llegar a VIOLATIONS_THRESHOLD (5) seguidos → suspensión
 *  - Primera suspensión: 24h
 *  - Cada suspensión siguiente: tiempo anterior × 2
 *  - El contador de intentos se resetea después de cada suspensión
 */

import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// ─── Configuración ────────────────────────────────────────────────────────────
const VIOLATIONS_THRESHOLD = 5;          // Intentos antes de suspender
const BASE_SUSPENSION_MS   = 24 * 60 * 60 * 1000; // 24 horas en ms

// ─── Patrones de detección ────────────────────────────────────────────────────
const CONTACT_PATTERNS = [
  // Email
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
  // Teléfono general (con/sin guiones, espacios, paréntesis)
  /(\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/,
  // Celulares RD: 809, 829, 849
  /\b(809|829|849)[\s.\-]?\d{3}[\s.\-]?\d{4}\b/,
  // WhatsApp escrito
  /whatsapp/i,
  // "llámame", "llama al", "escríbeme" con números cerca
  /ll[aá]ma(me|r)?[\s:]+[\d]/i,
  // Secuencia de 7+ dígitos consecutivos (probable número)
  /\d{7,}/,
  // Instagram/Telegram handles seguidos del nombre
  /@[a-zA-Z0-9_.]{3,}/,
  // t\.me links
  /t\.me\//i,
  // URLs con contacto
  /\b(wa\.me|bit\.ly|linktr\.ee)\//i,
];

/**
 * Comprueba si un texto contiene información de contacto prohibida.
 * @param {string} text
 * @returns {{ found: boolean, pattern: string|null }}
 */
export function detectContactInfo(text) {
  if (!text) return { found: false, pattern: null };
  for (const regex of CONTACT_PATTERNS) {
    if (regex.test(text)) {
      return { found: true, pattern: regex.toString() };
    }
  }
  return { found: false, pattern: null };
}

/**
 * Comprueba todos los campos de texto/textarea de un formulario.
 * @param {HTMLFormElement} form
 * @returns {boolean} true si encontró info de contacto
 */
export function formContainsContactInfo(form) {
  const fields = form.querySelectorAll('input[type="text"], input[type="url"], textarea');
  for (const field of fields) {
    if (field.name === 'fotos_link') continue; // URL legítima
    const { found } = detectContactInfo(field.value);
    if (found) return true;
  }
  return false;
}

// ─── Firestore helpers ────────────────────────────────────────────────────────

/**
 * Obtiene (o crea) el documento de violaciones del usuario en Firestore.
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} uid
 * @returns {Promise<object>}
 */
async function getViolationDoc(db, uid) {
  const ref  = doc(db, 'violaciones', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initial = {
      violations:        0,
      totalSuspensions:  0,
      suspendedUntil:    null,
      lastViolation:     null,
    };
    await setDoc(ref, initial);
    return initial;
  }
  return snap.data();
}

/**
 * Comprueba si el usuario está actualmente suspendido.
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} uid
 * @returns {Promise<{ suspended: boolean, remainingMs: number }>}
 */
export async function checkSuspension(db, uid) {
  const data = await getViolationDoc(db, uid);
  if (!data.suspendedUntil) return { suspended: false, remainingMs: 0 };

  const until = data.suspendedUntil.toDate
    ? data.suspendedUntil.toDate().getTime()
    : new Date(data.suspendedUntil).getTime();

  const now = Date.now();
  if (now < until) {
    return { suspended: true, remainingMs: until - now };
  }
  return { suspended: false, remainingMs: 0 };
}

/**
 * Registra una violación. Si alcanza el umbral, suspende la cuenta.
 * @param {import('firebase/firestore').Firestore} db
 * @param {string} uid
 * @returns {Promise<{ nowSuspended: boolean, suspendedUntil: Date|null, violations: number }>}
 */
export async function recordViolation(db, uid) {
  const ref  = doc(db, 'violaciones', uid);
  const data = await getViolationDoc(db, uid);

  const newViolations = (data.violations || 0) + 1;

  if (newViolations >= VIOLATIONS_THRESHOLD) {
    // Calcular duración de suspensión (doblar con cada suspensión)
    const totalSuspensions = (data.totalSuspensions || 0) + 1;
    const durationMs       = BASE_SUSPENSION_MS * Math.pow(2, totalSuspensions - 1);
    const until            = new Date(Date.now() + durationMs);

    await updateDoc(ref, {
      violations:       0,            // reset después de suspender
      totalSuspensions: totalSuspensions,
      suspendedUntil:   until,
      lastViolation:    serverTimestamp(),
    });

    return { nowSuspended: true, suspendedUntil: until, violations: 0 };
  }

  await updateDoc(ref, {
    violations:    newViolations,
    lastViolation: serverTimestamp(),
  });

  return { nowSuspended: false, suspendedUntil: null, violations: newViolations };
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

/**
 * Formatea milisegundos en una cadena legible (ej: "48 horas", "3 días y 2 horas")
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  const lang = window.i18n ? window.i18n.currentLang : 'es';
  const dict = window.i18n ? window.i18n.dictionary : {};

  const totalSeconds = Math.floor(ms / 1000);
  const days         = Math.floor(totalSeconds / 86400);
  const hours        = Math.floor((totalSeconds % 86400) / 3600);
  const minutes      = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  if (days > 0) {
    const unit = days > 1 ? (dict['cg.dur.days']?.[lang] || 'días') : (dict['cg.dur.day']?.[lang] || 'día');
    parts.push(`${days} ${unit}`);
  }
  if (hours > 0) {
    const unit = hours > 1 ? (dict['cg.dur.hours']?.[lang] || 'horas') : (dict['cg.dur.hour']?.[lang] || 'hora');
    parts.push(`${hours} ${unit}`);
  }
  if (minutes > 0 && days === 0) {
    const unit = minutes > 1 ? (dict['cg.dur.minutes']?.[lang] || 'minutos') : (dict['cg.dur.minute']?.[lang] || 'minuto');
    parts.push(`${minutes} ${unit}`);
  }

  const andText = dict['cg.dur.and']?.[lang] || 'y';
  const fewMinsText = dict['cg.dur.few_mins']?.[lang] || 'unos minutos';

  return parts.join(` ${andText} `) || fewMinsText;
}

/**
 * Inyecta el modal de advertencia de contacto en el documento (una sola vez).
 */
export function injectContactWarningModal() {
  if (document.getElementById('cg-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'cg-modal';
  modal.innerHTML = `
    <div id="cg-backdrop" style="
      display:none; position:fixed; inset:0; z-index:9999;
      background:rgba(0,0,0,0.7); backdrop-filter:blur(6px);
      align-items:center; justify-content:center; padding:20px;
    ">
      <div style="
        background:#fff; border-radius:20px; max-width:460px; width:100%;
        box-shadow:0 32px 80px rgba(0,0,0,0.4); overflow:hidden;
        animation: cgSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
      ">
        <!-- Header rojo -->
        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c); padding:24px; text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:8px;">🚫</div>
          <h2 id="cg-title" style="margin:0; color:#fff; font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:700;">
          </h2>
        </div>
        <!-- Body -->
        <div style="padding:28px 28px 20px;">
          <p id="cg-message" style="color:#334155; font-size:0.9375rem; line-height:1.6; margin:0 0 20px; text-align:center;"></p>
          <!-- Contador de advertencias -->
          <div id="cg-counter-wrap" style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px 18px; margin-bottom:20px;">
            <p style="margin:0; font-size:0.8125rem; color:#991b1b; display:flex; align-items:center; gap:8px;">
              <span>⚠️</span>
              <span id="cg-counter-text"></span>
            </p>
          </div>
          <button id="cg-close" style="
            width:100%; padding:14px; border:none; border-radius:12px;
            background:linear-gradient(135deg,#1a3c5e,#0f2640);
            color:#fff; font-family:'Outfit',sans-serif; font-size:1rem;
            font-weight:700; cursor:pointer; transition:opacity 0.2s;
          "></button>
        </div>
      </div>
    </div>
    <style>
      @keyframes cgSlideIn {
        from { opacity:0; transform:scale(0.85) translateY(20px); }
        to   { opacity:1; transform:scale(1)    translateY(0); }
      }
    </style>
  `;
  document.body.appendChild(modal);

  document.getElementById('cg-close').addEventListener('click', closeContactWarningModal);
  document.getElementById('cg-backdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('cg-backdrop')) closeContactWarningModal();
  });
}

export function showContactWarningModal({ violations, suspended, suspendedUntil, remainingMs }) {
  const lang = window.i18n ? window.i18n.currentLang : 'es';
  const dict = window.i18n ? window.i18n.dictionary : {};

  const backdrop    = document.getElementById('cg-backdrop');
  const title       = document.getElementById('cg-title');
  const message     = document.getElementById('cg-message');
  const counterWrap = document.getElementById('cg-counter-wrap');
  const counterText = document.getElementById('cg-counter-text');
  const closeBtn    = document.getElementById('cg-close');

  closeBtn.textContent = dict['cg.modal.btn_ok']?.[lang] || 'Entendido';

  if (suspended) {
    title.textContent = dict['cg.modal.title_suspended']?.[lang] || '🔒 Cuenta suspendida';
    let msg = dict['cg.modal.msg_suspended']?.[lang] || 'Tu cuenta ha sido suspendida temporalmente...';
    message.innerHTML = msg.replace('{duration}', formatDuration(remainingMs));
    counterWrap.style.display = 'none';
  } else {
    const remaining = VIOLATIONS_THRESHOLD - violations;
    title.textContent = dict['cg.modal.title_warning']?.[lang] || 'Información de contacto no permitida';
    message.innerHTML = dict['cg.modal.msg_warning']?.[lang] || 'No puedes incluir teléfonos...';
    
    counterWrap.style.display = 'block';
    if (remaining === 1) {
      counterText.textContent = dict['cg.modal.counter_last']?.[lang] || '⚠️ Este es tu último intento...';
    } else {
      let t = dict['cg.modal.counter_remaining']?.[lang] || 'Te quedan {n} intentos...';
      counterText.textContent = t.replace('{n}', remaining);
    }
  }

  backdrop.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

export function closeContactWarningModal() {
  const backdrop = document.getElementById('cg-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Muestra un banner de suspensión que bloquea todo el formulario.
 */
export function showSuspensionBanner(remainingMs) {
  const lang = window.i18n ? window.i18n.currentLang : 'es';
  const dict = window.i18n ? window.i18n.dictionary : {};

  const form = document.querySelector('form');
  if (!form) return;

  const banner = document.createElement('div');
  banner.id = 'cg-suspension-banner';
  banner.style.cssText = `
    position:fixed; inset:0; z-index:8000; background:rgba(15,22,36,0.95);
    backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center;
    padding:20px; flex-direction:column; gap:0;
  `;
  banner.innerHTML = `
    <div style="
      background:#fff; border-radius:24px; max-width:500px; width:100%;
      box-shadow:0 40px 100px rgba(0,0,0,0.5); overflow:hidden; text-align:center;
    ">
      <div style="background:linear-gradient(135deg,#7f1d1d,#dc2626); padding:36px 24px;">
        <div style="font-size:4rem; margin-bottom:12px;">🔒</div>
        <h1 style="margin:0; color:#fff; font-family:'Outfit',sans-serif; font-size:1.5rem; font-weight:800;">
          ${dict['cg.banner.title']?.[lang] || 'Cuenta Suspendida'}
        </h1>
      </div>
      <div style="padding:32px 28px;">
        <p style="color:#475569; font-size:0.9375rem; line-height:1.7; margin:0 0 24px;">
          ${dict['cg.banner.desc']?.[lang] || 'Tu cuenta ha sido suspendida temporalmente...'}
        </p>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:14px; padding:18px; margin-bottom:28px;">
          <p style="margin:0; font-size:0.875rem; color:#991b1b; font-weight:600;">
            ${dict['cg.banner.countdown_label']?.[lang] || '⏱ Podrás publicar nuevamente en:'}
          </p>
          <p id="cg-countdown" style="margin:8px 0 0; font-size:1.5rem; font-weight:800; color:#dc2626; font-family:'Outfit',sans-serif;">
            ${formatDuration(remainingMs)}
          </p>
        </div>
        <a href="index.html" style="
          display:inline-block; padding:14px 32px; background:linear-gradient(135deg,#1a3c5e,#0f2640);
          color:#fff; border-radius:12px; text-decoration:none; font-family:'Outfit',sans-serif;
          font-weight:700; font-size:0.9375rem;
        ">${dict['cg.banner.btn_home']?.[lang] || 'Volver al inicio'}</a>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
}
