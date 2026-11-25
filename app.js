(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = {
    page: 'accueil', image: null, imageUrl: '', stream: null, recognizer: null,
    lastResult: '', settings: { contrast: false, largeText: false, dark: false, voice: false, vibration: true },
    drone: { x: 16, y: 80, homeX: 16, homeY: 80, altitude: 0, battery: 86, airborne: false, emergency: false, signalTimer: null, log: [] }
  };

  const toast = (message, type = '') => {
    const region = $('#toast-region');
    const item = document.createElement('div'); item.className = `toast ${type}`.trim(); item.textContent = message;
    region.append(item); window.setTimeout(() => item.remove(), 4200);
  };
  const announce = (message, id = 'speech-status') => { const target = document.getElementById(id); if (target) target.textContent = message; };
  const say = (text) => {
    if (!text || !('speechSynthesis' in window)) { toast('La synthèse vocale n’est pas disponible dans ce navigateur.', 'error'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'fr-FR'; utterance.rate = 0.94;
    window.speechSynthesis.speak(utterance);
  };
  const vibrate = (pattern) => {
    if (!state.settings.vibration) { toast('Retour vibratoire désactivé dans les réglages.'); return; }
    if (navigator.vibrate) { navigator.vibrate(pattern); toast('Vibration envoyée par cet appareil.'); }
    else toast('Vibration simulée : cet appareil ne fournit pas de vibration dans le navigateur.');
  };
  const storeSettings = () => { try { localStorage.setItem('sensebridge-settings', JSON.stringify(state.settings)); } catch { /* stockage local facultatif */ } };
  const loadSettings = () => {
    try { const saved = JSON.parse(localStorage.getItem('sensebridge-settings') || '{}'); state.settings = { ...state.settings, ...saved }; } catch { /* réglages par défaut */ }
    $$('[data-setting]').forEach(input => { input.checked = Boolean(state.settings[input.dataset.setting]); });
    document.body.classList.toggle('contrast-theme', state.settings.contrast);
    document.body.classList.toggle('large-text', state.settings.largeText);
    document.documentElement.classList.toggle('dark-theme', state.settings.dark);
  };

  function navigate(page) {
    if (!document.getElementById(`page-${page}`)) return;
    if (state.page !== page) { stopCamera(false); stopListening(false); }
    state.page = page;
    $$('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
    $('#page-crumb').textContent = $(`#page-${page}`).dataset.title;
    window.history.replaceState(null, '', `#${page}`);
    $('#main').focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page !== 'voir') stopCamera(false);
    if (page !== 'ecouter') stopListening(false);
  }
  $$('[data-page]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.page)));
  window.addEventListener('hashchange', () => { const page = location.hash.slice(1); if (document.getElementById(`page-${page}`)) navigate(page); });

  // Vision: keep camera permission user-initiated, then analyze only a captured/selected image.
  const imageInput = $('#image-file'), imagePreview = $('#image-preview'), video = $('#camera-video');
  function setImage(source, url) {
    if (state.imageUrl && state.imageUrl.startsWith('blob:')) URL.revokeObjectURL(state.imageUrl);
    state.image = source; state.imageUrl = url;
    imagePreview.src = url; imagePreview.hidden = false; video.hidden = true; $('#camera-placeholder').hidden = true;
    $('#image-status').textContent = 'Image prête. Elle n’est pas envoyée ni enregistrée par SENSEBRIDGE.';
  }
  $('#image-pick').addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    const file = imageInput.files && imageInput.files[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Choisissez un fichier image.', 'error'); return; }
    stopCamera(false); const url = URL.createObjectURL(file); setImage(file, url);
  });
  $('#camera-start').addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia) { toast('La caméra nécessite un navigateur compatible et une connexion HTTPS.', 'error'); return; }
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      video.srcObject = state.stream; video.hidden = false; imagePreview.hidden = true; $('#camera-placeholder').hidden = true;
      $('#camera-live-controls').hidden = false; $('#camera-start').hidden = true; $('.vision-layout + .notice')?.classList.add('camera-live');
      $('.page-intro .status-chip').innerHTML = '<span class="status-dot"></span> Caméra active';
      $('#image-status').textContent = 'Caméra active à votre demande. Fermez-la après la capture.';
      await video.play();
    } catch (error) { toast(error.name === 'NotAllowedError' ? 'Accès à la caméra refusé. Vous pouvez importer une image à la place.' : 'Impossible d’ouvrir la caméra sur cet appareil.', 'error'); }
  });
  $('#camera-capture').addEventListener('click', () => {
    if (!video.videoWidth) { toast('Attendez que l’aperçu de la caméra soit prêt.', 'error'); return; }
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0); canvas.toBlob(blob => { if (blob) { setImage(blob, URL.createObjectURL(blob)); stopCamera(true); } }, 'image/jpeg', 0.9);
  });
  function stopCamera(keepImage) {
    if (state.stream) { state.stream.getTracks().forEach(track => track.stop()); state.stream = null; }
    video.srcObject = null; video.hidden = true; $('#camera-live-controls').hidden = true; $('#camera-start').hidden = false;
    const status = $('.page-intro .status-chip'); if (status) status.innerHTML = '<span class="status-dot"></span> Caméra arrêtée';
    if (!keepImage && state.page === 'voir') $('#image-status').textContent = 'La caméra est arrêtée. L’image reste sur votre appareil.';
  }
  $('#camera-stop').addEventListener('click', () => stopCamera(true));

  function setVisionResult(title, text, sourceLabel) {
    const box = $('#vision-result'); box.innerHTML = '';
    const content = document.createElement('div'); content.className = 'result-content';
    const heading = document.createElement('h3'); heading.textContent = `${title} · ${sourceLabel}`;
    const paragraph = document.createElement('div'); paragraph.textContent = text;
    content.append(heading, paragraph); box.append(content);
    $('#result-actions').hidden = false; state.lastResult = text; state.lastResultType = 'vision';
  }
  function loadScript(src, test) {
    if (test()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      const script = existing || document.createElement('script');
      if (!existing) { script.src = src; script.async = true; document.head.append(script); }
      script.addEventListener('load', resolve, { once: true }); script.addEventListener('error', () => reject(new Error('Téléchargement impossible')), { once: true });
      if (test()) resolve();
    });
  }
  const visionAsset = () => state.imageUrl || (state.image instanceof Blob ? URL.createObjectURL(state.image) : '');
  async function describeImage() {
    if (!state.image) { toast('Choisissez ou capturez d’abord une image.', 'error'); return; }
    const button = $('#describe-image'); button.disabled = true; button.querySelector('small').textContent = 'Chargement du modèle de vision…';
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js', () => Boolean(window.tf));
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js', () => Boolean(window.cocoSsd));
      const model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
      const image = new Image(); image.src = visionAsset(); await image.decode();
      const detections = await model.detect(image);
      if (!detections.length) { setVisionResult('Description indicative', 'Aucun objet reconnu avec assez de confiance dans cette image. Cela ne signifie pas qu’il n’y a rien dans la scène.', 'Analyse sur l’appareil'); }
      else {
        const position = item => { const center = item.bbox[0] + item.bbox[2] / 2; return center < image.width / 3 ? 'à gauche' : center > image.width * 2 / 3 ? 'à droite' : 'au centre'; };
        const lines = detections.slice(0, 8).map(item => `${item.class} ${position(item)}${item.score < 0.62 ? ' (incertain)' : ''}`);
        setVisionResult('Objets repérés', `L’analyse a repéré : ${lines.join(', ')}. Le modèle reconnaît certaines catégories courantes seulement; vérifiez visuellement ou demandez de l’aide si nécessaire.`, 'Modèle local');
      }
      $('#describe-image').querySelector('small').textContent = 'Analyse indicative d’objets courants dans l’image.';
    } catch (error) {
      setVisionResult('Analyse indisponible', 'Le modèle de vision n’a pas pu être chargé. Vérifiez votre connexion Internet, puis réessayez. Aucune description simulée n’a été créée.', 'Service indisponible');
      $('#describe-image').querySelector('small').textContent = 'Le modèle de vision nécessite un téléchargement Internet.';
    } finally { button.disabled = false; }
  }
  $('#describe-image').addEventListener('click', describeImage);
  $('#read-image').addEventListener('click', async () => {
    if (!state.image) { toast('Choisissez ou capturez d’abord une image.', 'error'); return; }
    const button = $('#read-image'); button.disabled = true; button.querySelector('small').textContent = 'Chargement de l’OCR en français…';
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', () => Boolean(window.Tesseract));
      const worker = await window.Tesseract.createWorker('fra');
      const result = await worker.recognize(visionAsset()); await worker.terminate();
      const text = result.data.text.trim();
      setVisionResult('Texte reconnu', text || 'Aucun texte n’a pu être extrait. Essayez une image plus nette et mieux éclairée.', 'OCR en français');
      state.lastResult = text || 'Aucun texte reconnu.';
      $('#read-image').querySelector('small').textContent = 'Texte extrait avec un modèle OCR téléchargé depuis Internet.';
    } catch (error) {
      setVisionResult('OCR indisponible', 'Le module OCR en français n’a pas pu être chargé. Vérifiez votre connexion Internet, puis réessayez.', 'Service indisponible');
      $('#read-image').querySelector('small').textContent = 'L’OCR nécessite un téléchargement Internet au premier usage.';
    } finally { button.disabled = false; }
  });
  $('#speak-result').addEventListener('click', () => say(state.lastResult));
  $('#copy-result').addEventListener('click', async () => { try { await navigator.clipboard.writeText(state.lastResult); toast('Résultat copié.'); } catch { toast('Copie indisponible dans ce navigateur.', 'error'); } });

  // Speech recognition: the microphone is opened only by the explicit start button.
  function startListening() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { announce('La reconnaissance vocale n’est pas prise en charge ici. Essayez Chrome ou saisissez une réponse.', 'speech-status'); toast('Reconnaissance vocale indisponible dans ce navigateur.', 'error'); return; }
    const recognition = new Recognition(); state.recognizer = recognition; recognition.lang = 'fr-FR'; recognition.continuous = true; recognition.interimResults = true;
    $('#transcription-empty').hidden = true; $('#mic-status').innerHTML = '<span class="status-dot" style="background:#b54708"></span> Micro actif';
    $('#listen-start').disabled = true; $('#listen-stop').disabled = false; announce('Microphone actif à votre demande. La reconnaissance peut utiliser un service externe.');
    recognition.onresult = event => {
      const transcript = $('#transcription');
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.trim(); if (!text) continue;
        if (event.results[i].isFinal) { const line = document.createElement('div'); line.className = 'transcript-line'; line.textContent = text; transcript.append(line); transcript.scrollTop = transcript.scrollHeight; }
        else { let interim = $('#interim-line'); if (!interim) { interim = document.createElement('div'); interim.id = 'interim-line'; interim.className = 'transcript-line'; interim.style.opacity = '.65'; transcript.append(interim); } interim.textContent = `${text} …`; }
      }
    };
    recognition.onerror = event => { if (event.error !== 'no-speech' && event.error !== 'aborted') announce(`La transcription a rencontré un problème (${event.error}). Vous pouvez réessayer.`); };
    recognition.onend = () => stopListening(true);
    try { recognition.start(); } catch { stopListening(false); toast('La transcription est déjà active ou indisponible.', 'error'); }
  }
  function stopListening(fromBrowser) {
    const recognition = state.recognizer; state.recognizer = null;
    if (recognition && !fromBrowser) { recognition.onend = null; try { recognition.stop(); } catch { /* déjà arrêtée */ } }
    $('#listen-start').disabled = false; $('#listen-stop').disabled = true; $('#mic-status').innerHTML = '<span class="status-dot"></span> Micro inactif';
    if (state.page === 'ecouter') announce('Le microphone est arrêté.');
  }
  $('#listen-start').addEventListener('click', startListening);
  $('#listen-stop').addEventListener('click', () => stopListening(false));
  $('#transcript-clear').addEventListener('click', () => { $$('.transcript-line').forEach(el => el.remove()); $('#transcription-empty').hidden = false; announce('Transcription effacée.'); });
  $('#speak-reply').addEventListener('click', () => { const text = $('#reply-text').value.trim(); if (!text) { toast('Écrivez un message avant de le faire lire.'); return; } state.lastResult = text; say(text); });
  $('#show-reply').addEventListener('click', () => { const text = $('#reply-text').value.trim(); if (!text) { toast('Écrivez un message à afficher.'); return; } $('#reply-large').textContent = text; $('#reply-display').hidden = false; $('#dialog-message').textContent = text; const dialog = $('#large-dialog'); if (dialog.showModal) dialog.showModal(); else $('#reply-display').scrollIntoView({ behavior: 'smooth' }); });
  $('#dialog-close').addEventListener('click', () => $('#large-dialog').close());
  $('#close-reply').addEventListener('click', () => { $('#reply-display').hidden = true; });
  $('#sound-demo').addEventListener('click', () => { $('#sound-alert').hidden = false; vibrate([120, 80, 120]); });

  // Glove virtual commands share the same action entry points as a future BLE adapter.
  $('#gesture-describe').addEventListener('click', () => {
    $('#glove-message').textContent = 'Commande virtuelle reçue : décrire la scène.'; vibrate(100);
    if (state.settings.voice) say('Commande reçue. Choisissez une image ou capturez la scène pour la décrire.');
    navigate('voir'); if (!state.image) toast('Choisissez une image pour lancer une vraie analyse.'); else describeImage();
  });
  $('#gesture-repeat').addEventListener('click', () => {
    $('#glove-message').textContent = state.lastResult ? 'Commande virtuelle reçue : répétition du dernier résultat.' : 'Aucun résultat précédent à répéter.';
    vibrate([100, 110, 100]); if (state.lastResult) say(state.lastResult); else toast('Il n’y a pas encore de résultat à répéter.');
  });
  $('#vibration-test').addEventListener('click', () => vibrate([100, 100, 100]));

  // Drone simulator: bounded movement, obstacle checks and clearly simulated safeguards.
  const drone = state.drone;
  const obstacles = [{ x1: 24, x2: 34, y1: 17, y2: 31 }, { x1: 69, x2: 81, y1: 38, y2: 55 }, { x1: 30, x2: 40, y1: 72, y2: 85 }];
  function logDrone(message) { drone.log.unshift(message); drone.log = drone.log.slice(0, 4); $('#drone-status').textContent = `${message} · Simulation seulement`; }
  function renderDrone() {
    const marker = $('#drone-marker'); marker.style.left = `${drone.x}%`; marker.style.top = `${drone.y}%`; marker.style.bottom = 'auto';
    marker.classList.toggle('flying', drone.airborne && !drone.emergency); marker.classList.toggle('emergency', drone.emergency);
    $('#altitude-value').textContent = `${drone.altitude} m`; $('#battery-value').textContent = `${drone.battery}%`; $('#battery-bar').style.width = `${drone.battery}%`;
    $('#flight-state').textContent = drone.emergency ? 'Urgence' : drone.airborne ? (drone.altitude ? 'En vol' : 'Vol stationnaire') : 'Au sol';
    $('#battery-bar').style.background = drone.battery < 20 ? 'var(--orange)' : 'var(--green)';
    const path = $('#flight-path'); const dx = drone.x - drone.homeX; const dy = drone.homeY - drone.y; const length = Math.hypot(dx, dy);
    path.style.width = `${length}%`; path.style.transform = `rotate(${-Math.atan2(dy, dx) * 180 / Math.PI}deg)`;
  }
  function collision(x, y) { return obstacles.some(o => x > o.x1 - 3 && x < o.x2 + 3 && y > o.y1 - 4 && y < o.y2 + 4); }
  function moveDrone(dx, dy) {
    if (!drone.airborne) { logDrone('Le drone est au sol. Appuyez sur Décoller pour le déplacer.'); return; }
    const nx = Math.max(7, Math.min(93, drone.x + dx)); const ny = Math.max(9, Math.min(90, drone.y + dy));
    if (collision(nx, ny)) { logDrone('Obstacle proche : déplacement bloqué.'); vibrate(140); if (state.settings.voice) say('Obstacle proche. Déplacement bloqué.'); return; }
    drone.x = nx; drone.y = ny; drone.battery = Math.max(0, drone.battery - 1); renderDrone();
    logDrone('Déplacement simulé effectué.');
    if (drone.battery <= 10) landDrone('Batterie critique : atterrissage automatique simulé.');
  }
  $$('[data-move]').forEach(button => button.addEventListener('click', () => {
    const move = button.dataset.move; if (move === 'up') moveDrone(0, -7); else if (move === 'down') moveDrone(0, 7); else if (move === 'left') moveDrone(-7, 0); else if (move === 'right') moveDrone(7, 0); else logDrone('Drone stabilisé dans la simulation.');
  }));
  $('#takeoff').addEventListener('click', () => { if (drone.battery <= 0) { logDrone('Batterie vide : rechargez la simulation avant le décollage.'); return; } drone.emergency = false; drone.airborne = true; drone.altitude = Math.max(5, drone.altitude); renderDrone(); logDrone('Décollage simulé.'); });
  function landDrone(message = 'Atterrissage simulé terminé.') { drone.airborne = false; drone.altitude = 0; drone.emergency = false; renderDrone(); logDrone(message); }
  $('#land').addEventListener('click', () => landDrone());
  $('#altitude-up').addEventListener('click', () => { if (!drone.airborne) { logDrone('Décollez avant de régler l’altitude.'); return; } drone.altitude = Math.min(60, drone.altitude + 3); drone.battery = Math.max(0, drone.battery - 1); renderDrone(); logDrone(`Altitude simulée : ${drone.altitude} mètres.`); });
  $('#altitude-down').addEventListener('click', () => { if (!drone.airborne) { logDrone('Le drone est au sol.'); return; } drone.altitude = Math.max(0, drone.altitude - 3); renderDrone(); if (!drone.altitude) landDrone('Atterrissage simulé terminé.'); else logDrone(`Altitude simulée : ${drone.altitude} mètres.`); });
  $('#emergency-stop').addEventListener('click', () => { if (!drone.airborne) { logDrone('Le drone est déjà au sol.'); return; } drone.emergency = true; drone.battery = Math.max(0, drone.battery - 1); renderDrone(); vibrate([180, 80, 180]); if (state.settings.voice) say('Arrêt d’urgence. Atterrissage simulé.'); window.setTimeout(() => landDrone('Arrêt d’urgence : atterrissage simulé.'), 900); });
  $('#return-home').addEventListener('click', () => { if (!drone.airborne) { drone.x = drone.homeX; drone.y = drone.homeY; renderDrone(); logDrone('Retour au point de départ simulé.'); return; } drone.x = drone.homeX; drone.y = drone.homeY; drone.battery = Math.max(0, drone.battery - 2); renderDrone(); logDrone('Retour au point de départ simulé.'); landDrone('Retour terminé : atterrissage au départ.'); });
  $('#link-loss').addEventListener('click', () => {
    if (!drone.airborne) { logDrone('Faites décoller le drone avant de simuler une perte de liaison.'); return; }
    window.clearTimeout(drone.signalTimer); $('#signal-value').textContent = 'Perdu'; logDrone('Liaison perdue : vol stationnaire après 1,5 seconde.');
    drone.signalTimer = window.setTimeout(() => { if (!drone.airborne) return; drone.altitude = Math.max(3, drone.altitude); renderDrone(); logDrone('Liaison absente : atterrissage automatique dans 5 secondes.'); drone.signalTimer = window.setTimeout(() => landDrone('Sécurité : atterrissage après perte prolongée de liaison.'), 5000); }, 1500);
    window.setTimeout(() => { if (!drone.airborne) $('#signal-value').textContent = 'Virtuel'; }, 7000);
  });
  $('#drone-reset').addEventListener('click', () => { window.clearTimeout(drone.signalTimer); Object.assign(drone, { x: 16, y: 80, altitude: 0, battery: 86, airborne: false, emergency: false }); $('#signal-value').textContent = 'Virtuel'; renderDrone(); logDrone('Simulation réinitialisée.'); });
  renderDrone();

  // Preferences are local to this device; permission prompts remain tied to each feature.
  $$('[data-setting]').forEach(input => input.addEventListener('change', () => {
    state.settings[input.dataset.setting] = input.checked; storeSettings(); loadSettings();
    if (input.dataset.setting === 'voice' && input.checked) toast('Le retour vocal peut lire les confirmations sur demande.');
  }));
  $('#clear-data').addEventListener('click', () => {
    if (!window.confirm('Effacer les réglages et les données de démonstration enregistrés sur cet appareil ?')) return;
    localStorage.removeItem('sensebridge-settings'); localStorage.removeItem('sensebridge-tests');
    state.settings = { contrast: false, largeText: false, dark: false, voice: false, vibration: true }; loadSettings();
    $('#clear-status').textContent = 'Les données locales de SENSEBRIDGE ont été effacées.'; toast('Données locales effacées.');
  });
  loadSettings();
  const initialPage = location.hash.slice(1); if (document.getElementById(`page-${initialPage}`)) navigate(initialPage);

  // Native PWA installation when supported, plus platform-specific home-screen guidance.
  let pendingInstallPrompt = null;
  const installButton = $('#install-app');
  const installDialog = $('#install-dialog');
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isAppleMobile = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const showInstallGuide = (platform) => {
    const steps = $('#install-steps'); steps.replaceChildren();
    const instructions = platform === 'apple'
      ? [
          ['Ouvrez dans Safari', 'Sur iPhone ou iPad, ouvrez le site SENSEBRIDGE dans Safari.'],
          ['Touchez Partager', 'Dans la barre de Safari, touchez l’icône Partager (le carré avec une flèche vers le haut).'],
          ['Ajoutez à l’écran d’accueil', 'Faites défiler le menu, touchez « Sur l’écran d’accueil », puis « Ajouter ».']
        ]
      : [
          ['Ouvrez le menu du navigateur', 'Sur Android, ouvrez SENSEBRIDGE dans Chrome ou un navigateur compatible, puis touchez ⋮.'],
          ['Choisissez l’installation', 'Touchez « Installer l’application » ou « Ajouter à l’écran d’accueil »; le libellé varie selon le navigateur.'],
          ['Confirmez', 'Touchez « Installer » ou « Ajouter ». L’icône apparaîtra parmi vos applications.']
        ];
    instructions.forEach(([title, body], index) => {
      const item = document.createElement('div'); item.className = 'install-step';
      const number = document.createElement('b'); number.textContent = String(index + 1);
      const copy = document.createElement('span'); copy.innerHTML = `<strong>${title}</strong><br>${body}`;
      item.append(number, copy); steps.append(item);
    });
    $('#install-intro').textContent = platform === 'apple'
      ? 'Sur iPhone et iPad, l’installation se fait depuis le menu de partage de Safari.'
      : 'Sur Android, votre navigateur peut installer l’application ou l’ajouter à l’écran d’accueil.';
    if (installDialog.showModal) installDialog.showModal(); else toast('Ouvrez le menu de votre navigateur pour ajouter SENSEBRIDGE à l’écran d’accueil.');
  };
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); pendingInstallPrompt = event; });
  window.addEventListener('appinstalled', () => { pendingInstallPrompt = null; installButton.innerHTML = '<span aria-hidden="true">✓</span><span>Application installée</span>'; toast('SENSEBRIDGE a été ajoutée à votre téléphone.'); });
  installButton.addEventListener('click', async () => {
    if (isStandalone()) { toast('SENSEBRIDGE est déjà installée sur cet appareil.'); return; }
    if (pendingInstallPrompt) {
      pendingInstallPrompt.prompt();
      const choice = await pendingInstallPrompt.userChoice;
      if (choice?.outcome === 'accepted') toast('Installation lancée. Suivez les étapes affichées par votre téléphone.');
      else toast('Installation annulée. Vous pouvez réessayer quand vous le souhaitez.');
      pendingInstallPrompt = null; return;
    }
    showInstallGuide(isAppleMobile() ? 'apple' : 'android');
  });
  $('#install-close').addEventListener('click', () => installDialog.close());
  $('#install-ok').addEventListener('click', () => installDialog.close());

  // Installable app shell. Models are intentionally fetched only when their feature is used.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
