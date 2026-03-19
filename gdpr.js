/**
 * gdpr.js – EU GDPR compliance for Schreibwerkstatt Klasse 3
 * Handles: consent gate · privacy notice · font loading · LanguageTool gate · data deletion
 * Include before </body> in every HTML page.
 * Each page must set window._SW_FONTS_URL before this script.
 */
(function () {
  'use strict';

  var SK   = 'sw_gdpr_v1';  // sessionStorage: general consent
  var LT_SK = 'sw_lt_v1';   // sessionStorage: LanguageTool consent

  /* ── Block LanguageTool until consented ─────────────────────────────── */
  var _origFetch = window.fetch.bind(window);
  window.fetch = function (url) {
    if (typeof url === 'string' && url.indexOf('languagetool.org') !== -1
        && !sessionStorage.getItem(LT_SK)) {
      return Promise.reject(new Error(
        'Rechtschreibprüfung deaktiviert – bitte Datenschutz akzeptieren.'
      ));
    }
    return _origFetch.apply(window, arguments);
  };

  /* ── Load Google Fonts after consent ───────────────────────────────── */
  function loadFonts() {
    var url = window._SW_FONTS_URL;
    if (!url || document.getElementById('gdpr-gf')) return;
    var l = document.createElement('link');
    l.id   = 'gdpr-gf';
    l.rel  = 'stylesheet';
    l.href = url;
    document.head.appendChild(l);
  }

  /* ── Public: delete all stored data ────────────────────────────────── */
  window.sw_deleteAllData = function () {
    if (!confirm(
      'Alle gespeicherten Daten löschen?\n' +
      '(Texte, Feedback, Einstellungen)\n\n' +
      'Das kann nicht rückgängig gemacht werden.'
    )) return;
    ['builder-data', 'sw_fb', 'sw_play_data', 'sw_story_data']
      .forEach(function (k) { localStorage.removeItem(k); });
    sessionStorage.removeItem(LT_SK);
    alert('✅ Alle Daten wurden gelöscht.');
    location.reload();
  };

  /* ── Public: show / close privacy notice ──────────────────────────── */
  window.sw_showPrivacy  = function () {
    var m = document.getElementById('gdpr-pm');
    if (m) m.style.display = 'flex';
  };
  window.sw_closePrivacy = function () {
    var m = document.getElementById('gdpr-pm');
    if (m) m.style.display = 'none';
  };

  /* ── Accept consent ────────────────────────────────────────────────── */
  window.gdprAccept = function () {
    var ltCb = document.getElementById('gdpr-lt-cb');
    sessionStorage.setItem(SK, '1');
    if (ltCb && ltCb.checked) sessionStorage.setItem(LT_SK, '1');
    loadFonts();
    var ov = document.getElementById('gdpr-ov');
    if (ov) ov.style.display = 'none';
  };

  /* ── Enable / disable start button based on main checkbox ─────────── */
  window.gdprMainCbChange = function () {
    var cb  = document.getElementById('gdpr-main-cb');
    var btn = document.getElementById('gdpr-start');
    if (btn) btn.disabled = !cb.checked;
  };

  /* ── Inject HTML ───────────────────────────────────────────────────── */
  function buildHTML() {
    var el = document.createElement('div');
    el.innerHTML = [
      /* ── CSS ── */
      '<style>',
      /* overlay */
      '#gdpr-ov{position:fixed;inset:0;background:rgba(8,8,20,.93);z-index:99999;display:flex;',
      'align-items:center;justify-content:center;padding:1rem;}',
      '#gdpr-box{background:#fff;border-radius:20px;max-width:520px;width:100%;overflow:hidden;',
      'box-shadow:0 24px 60px rgba(0,0,0,.5);font-family:"Baloo 2","Trebuchet MS",sans-serif;}',
      '.gd-head{background:linear-gradient(135deg,#3ab84e,#22a03c);padding:18px 24px;',
      'display:flex;align-items:center;gap:12px;}',
      '.gd-head h2{color:#fff;font-size:17px;margin:0;font-weight:800;line-height:1.35;}',
      '.gd-head-icon{font-size:28px;flex-shrink:0;}',
      '.gd-body{padding:18px 24px 4px;}',
      '.gd-row{display:flex;align-items:flex-start;gap:10px;padding:7px 0;',
      'border-bottom:1px solid #f0f0f0;}',
      '.gd-row:last-child{border:none;}',
      '.gd-row .ri{font-size:17px;margin-top:1px;flex-shrink:0;}',
      '.gd-row p{margin:0;font-size:13px;color:#333;line-height:1.6;}',
      '.gd-row p strong{color:#111;}',
      '.gd-cb{display:flex;align-items:flex-start;gap:10px;margin:12px 0 6px;',
      'padding:10px 12px;border-radius:10px;}',
      '.gd-cb.main{background:#f2fff4;border:1.5px solid #a8e8b0;}',
      '.gd-cb.lt{background:#f5f5ff;border:1.5px solid #c0c0ee;}',
      '.gd-cb input[type=checkbox]{width:18px;height:18px;margin-top:2px;flex-shrink:0;',
      'accent-color:#3ab84e;cursor:pointer;}',
      '.gd-cb label{font-size:13px;color:#111;cursor:pointer;line-height:1.55;}',
      '.gd-cb label a,.gd-cb label button.link{color:#3ab84e;font-weight:700;',
      'background:none;border:none;cursor:pointer;padding:0;font-family:inherit;font-size:13px;',
      'text-decoration:underline;}',
      '.gd-foot{padding:12px 24px 20px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
      '#gdpr-start{flex:1;padding:12px 20px;background:#3ab84e;color:#fff;border:none;',
      'border-radius:12px;font-size:15px;font-weight:800;cursor:pointer;',
      'font-family:inherit;transition:background .2s;min-width:160px;}',
      '#gdpr-start:hover:not(:disabled){background:#22a03c;}',
      '#gdpr-start:disabled{background:#ccc;cursor:not-allowed;}',
      '.gd-policy-btn{padding:10px 16px;background:none;border:2px solid #ddd;',
      'border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;color:#555;',
      'font-family:inherit;transition:all .2s;white-space:nowrap;}',
      '.gd-policy-btn:hover{border-color:#3ab84e;color:#3ab84e;}',
      /* privacy modal */
      '#gdpr-pm{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:100000;',
      'display:none;align-items:center;justify-content:center;padding:1rem;}',
      '#gdpr-pm-box{background:#fff;border-radius:20px;max-width:600px;width:100%;',
      'max-height:92vh;overflow-y:auto;font-family:"Baloo 2","Trebuchet MS",sans-serif;}',
      '.gd-pm-head{background:linear-gradient(135deg,#5b5fcf,#7b7fd8);padding:14px 20px;',
      'display:flex;align-items:center;justify-content:space-between;',
      'border-radius:20px 20px 0 0;position:sticky;top:0;z-index:1;}',
      '.gd-pm-head h3{color:#fff;margin:0;font-size:15px;font-weight:800;}',
      '.gd-pm-close{background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;',
      'width:32px;height:32px;font-size:16px;cursor:pointer;display:flex;align-items:center;',
      'justify-content:center;flex-shrink:0;}',
      '.gd-pm-body{padding:18px 22px;}',
      '.gd-pm-body h4{font-size:13px;font-weight:800;color:#111;margin:16px 0 4px;',
      'padding-left:6px;border-left:3px solid #3ab84e;}',
      '.gd-pm-body p,.gd-pm-body li{font-size:12.5px;color:#444;line-height:1.7;margin:3px 0;}',
      '.gd-pm-body ul{padding-left:18px;}',
      '.gd-pm-body a{color:#3ab84e;}',
      '.gd-pm-body code{background:#f4f4f4;padding:1px 5px;border-radius:4px;font-size:11px;}',
      '.gd-pm-foot{padding:10px 22px 18px;border-top:1px solid #eee;display:flex;gap:8px;',
      'flex-wrap:wrap;position:sticky;bottom:0;background:#fff;}',
      /* floating button */
      '#gdpr-fab{position:fixed;bottom:14px;left:14px;z-index:9900;',
      'background:rgba(255,255,255,.94);border:1.5px solid #ddd;border-radius:99px;',
      'padding:5px 12px;font-size:11px;font-weight:700;color:#555;cursor:pointer;',
      'font-family:"Baloo 2","Trebuchet MS",sans-serif;display:flex;align-items:center;',
      'gap:5px;box-shadow:0 2px 8px rgba(0,0,0,.12);transition:all .2s;}',
      '#gdpr-fab:hover{border-color:#3ab84e;color:#3ab84e;}',
      '</style>',

      /* ── Consent overlay ── */
      '<div id="gdpr-ov">',
      '<div id="gdpr-box" role="dialog" aria-modal="true" aria-labelledby="gdpr-title">',
      '<div class="gd-head">',
      '<span class="gd-head-icon">🔒</span>',
      '<h2 id="gdpr-title">Datenschutz-Einwilligung<br>',
      '<span style="font-weight:600;font-size:12px;opacity:.9;">',
      'Bitte von Lehrkraft oder Elternteil bestätigen</span></h2>',
      '</div>',
      '<div class="gd-body">',
      '<div class="gd-row"><span class="ri">✅</span><p>',
      '<strong>Nur lokale Speicherung</strong> — Texte und Geschichten werden ',
      'ausschließlich auf diesem Gerät gespeichert, nicht auf externen Servern.</p></div>',
      '<div class="gd-row"><span class="ri">🚫</span><p>',
      '<strong>Keine Werbung &amp; kein Tracking</strong> — kein Google Analytics, ',
      'keine Tracking-Cookies, keine Nutzerprofile.</p></div>',
      '<div class="gd-row"><span class="ri">🔤</span><p>',
      '<strong>Schriften (Google Fonts)</strong> — nach Zustimmung werden Schriften ',
      'von Google Fonts geladen. Dabei wird die IP-Adresse kurz übertragen.</p></div>',
      '<div class="gd-row"><span class="ri">✏️</span><p>',
      '<strong>Rechtschreibprüfung (optional)</strong> — wenn aktiviert, werden ',
      'Texte zur Prüfung an ',
      '<a href="https://languagetool.org/privacy/" target="_blank" rel="noopener">',
      'LanguageTool.org</a> gesendet.</p></div>',
      '</div>',
      /* checkboxes */
      '<div style="padding:0 24px;">',
      '<div class="gd-cb main">',
      '<input type="checkbox" id="gdpr-main-cb" onchange="gdprMainCbChange()">',
      '<label for="gdpr-main-cb">Ich bin Lehrkraft oder Elternteil und stimme der ',
      'Nutzung gemäß der ',
      '<button class="link" onclick="sw_showPrivacy();return false;">',
      'Datenschutzerklärung</button> zu.</label>',
      '</div>',
      '<div class="gd-cb lt">',
      '<input type="checkbox" id="gdpr-lt-cb" checked>',
      '<label for="gdpr-lt-cb"><strong>Rechtschreibprüfung aktivieren</strong> — ',
      'Text des Kindes wird an LanguageTool.org gesendet ',
      '(empfohlen für Klasse 3).</label>',
      '</div>',
      '</div>',
      '<div class="gd-foot">',
      '<button class="gd-policy-btn" onclick="sw_showPrivacy()">',
      '📋 Datenschutzerklärung</button>',
      '<button id="gdpr-start" disabled onclick="gdprAccept()">',
      'Zustimmen &amp; starten ▶</button>',
      '</div>',
      '</div>',
      '</div>',

      /* ── Privacy notice modal ── */
      '<div id="gdpr-pm" onclick="if(event.target===this)sw_closePrivacy()">',
      '<div id="gdpr-pm-box">',
      '<div class="gd-pm-head">',
      '<h3>📋 Datenschutzerklärung – Schreibwerkstatt Klasse 3</h3>',
      '<button class="gd-pm-close" onclick="sw_closePrivacy()" ',
      'title="Schließen">✕</button>',
      '</div>',
      '<div class="gd-pm-body">',
      '<p><strong>Stand:</strong> März 2026 · Dieses Projekt ist ein ',
      'nicht-kommerzielles Open-Source-Schulprojekt.</p>',

      '<h4>1. Verantwortliche Person</h4>',
      '<p>Diese App wird von der Schule bzw. Lehrkraft betrieben, die sie einsetzt. ',
      'Für Fragen zum Datenschutz wenden Sie sich bitte an die zuständige Lehrkraft.',
      '</p>',

      '<h4>2. Welche Daten werden verarbeitet?</h4>',
      '<ul>',
      '<li>Texte und Geschichten des Kindes (im Browser gespeichert)</li>',
      '<li>Selbsteinschätzungen und Checklisten (keine Namen erforderlich)</li>',
      '<li>Optionale Fotos von handgeschriebenen Texten (nur lokal)</li>',
      '<li>Optionale Sprachaufnahmen (nur lokal, werden nicht übertragen)</li>',
      '<li>Feedback von Lehrkraft / Elternteil (nur lokal)</li>',
      '</ul>',

      '<h4>3. Speicherung &amp; Verbleib der Daten</h4>',
      '<p>Alle Daten verbleiben im Browser dieses Geräts (<code>localStorage</code>). ',
      'Es gibt keinen Server, der Daten empfängt oder speichert. Die Daten bleiben ',
      'bis zur manuellen Löschung erhalten (s. Abschnitt 6).</p>',

      '<h4>4. Externe Dienste (Art. 6 Abs. 1 lit. a DSGVO – Einwilligung)</h4>',
      '<p><strong>a) Google Fonts</strong><br>',
      'Nach Einwilligung werden Schriften von <code>fonts.googleapis.com</code> geladen. ',
      'Dabei überträgt Ihr Browser die IP-Adresse an Google LLC, USA. ',
      'Datenschutzerklärung: ',
      '<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">',
      'policies.google.com/privacy</a></p>',

      '<p><strong>b) LanguageTool.org</strong> (nur wenn aktiviert)<br>',
      'Klickt das Kind auf „Prüfen", wird der eingegebene Text an die öffentliche ',
      'API von LanguageTool.org gesendet (Serverstandort: EU). ',
      'Es werden keine Namen oder Login-Daten übertragen. ',
      'Die Prüfung kann jederzeit deaktiviert werden. ',
      'Datenschutzerklärung: ',
      '<a href="https://languagetool.org/privacy/" target="_blank" rel="noopener">',
      'languagetool.org/privacy</a></p>',

      '<h4>5. Kinder &amp; besonderer Schutz (Art. 8 DSGVO)</h4>',
      '<p>Diese App richtet sich an Kinder der Klasse 3 (ca. 8–10 Jahre). ',
      'Gemäß Art. 8 DSGVO wird vor der Nutzung die Einwilligung einer ',
      'erziehungsberechtigten Person oder der Lehrkraft eingeholt. ',
      'Die Einwilligung gilt jeweils für eine Browser-Sitzung.</p>',

      '<h4>6. Ihre Rechte als Erziehungsberechtigte</h4>',
      '<ul>',
      '<li><strong>Auskunft</strong>: Alle Daten befinden sich im Browser dieses Geräts.</li>',
      '<li><strong>Löschung</strong>: Jederzeit über den Button „Alle Daten löschen" ',
      'oder die Browser-Einstellungen (Websitedaten löschen).</li>',
      '<li><strong>Berichtigung</strong>: Texte können jederzeit in der App bearbeitet werden.</li>',
      '<li><strong>Widerruf</strong>: Die Einwilligung gilt pro Sitzung und endet ',
      'automatisch beim Schließen des Browsers.</li>',
      '<li><strong>Beschwerde</strong>: Beim ',
      '<a href="https://www.lda.bayern.de" target="_blank" rel="noopener">',
      'Bayerischen Landesbeauftragten für den Datenschutz (BayLfD)</a>.</li>',
      '</ul>',

      '<h4>7. Datenweitergabe</h4>',
      '<p>Es erfolgt keine Weitergabe personenbezogener Daten an Dritte, ',
      'außer an LanguageTool bei aktivierter Rechtschreibprüfung (s. Abschnitt 4b).</p>',

      '<h4>8. Daten löschen</h4>',
      '<p>Alle lokal gespeicherten Daten können jederzeit gelöscht werden:</p>',
      '</div>',
      '<div class="gd-pm-foot">',
      '<button onclick="sw_deleteAllData()" ',
      'style="padding:10px 18px;background:#fff0f0;border:2px solid #ffaaaa;',
      'border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;color:#c00;',
      'font-family:inherit;">🗑️ Alle Daten löschen</button>',
      '<button onclick="sw_closePrivacy()" ',
      'style="flex:1;padding:10px 18px;background:#3ab84e;color:#fff;border:none;',
      'border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;',
      'font-family:inherit;">Schließen ✕</button>',
      '</div>',
      '</div>',
      '</div>',

      /* ── Floating privacy button ── */
      '<button id="gdpr-fab" onclick="sw_showPrivacy()">🔒 Datenschutz</button>'
    ].join('');

    document.body.appendChild(el);
  }

  /* ── Init ──────────────────────────────────────────────────────────── */
  function init() {
    buildHTML();
    if (sessionStorage.getItem(SK) === '1') {
      /* Already consented this session – hide overlay and load fonts */
      var ov = document.getElementById('gdpr-ov');
      if (ov) ov.style.display = 'none';
      loadFonts();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
