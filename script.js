'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // SERVICE WORKER
  // ============================================================
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.error('SW registration failed:', err));
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const escapeHtml = (str) => {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // ============================================================
  // TOAST
  // ============================================================
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  const showToast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
  };

  // ============================================================
  // DOM REFS
  // ============================================================
  const navButtons     = document.querySelectorAll('.nav-button');
  const screens        = document.querySelectorAll('.screen');
  const headerTitle    = document.getElementById('header-title');
  const activeTripChip = document.getElementById('active-trip-chip');

  // Trips overlay
  const tripsOverlay      = document.getElementById('trips-overlay');
  const tripsToggleBtn    = document.getElementById('trips-toggle-btn');
  const tripsOverlayClose = document.getElementById('trips-overlay-close');
  const tripsListEl       = document.getElementById('trips-list');
  const newTripBtn        = document.getElementById('new-trip-btn');
  const importTripBtn     = document.getElementById('import-trip-btn');
  const importFileInput   = document.getElementById('import-file-input');

  // Trip form modal
  const tripFormModal     = document.getElementById('trip-form-modal');
  const tripFormClose     = document.getElementById('trip-form-close');
  const tripFormTitle     = document.getElementById('trip-form-title');
  const tripFormName      = document.getElementById('trip-form-name');
  const tripFormStart     = document.getElementById('trip-form-start');
  const tripFormEnd       = document.getElementById('trip-form-end');
  const tripFormTravelers = document.getElementById('trip-form-travelers');
  const tripFormId        = document.getElementById('trip-form-id');
  const tripFormSave      = document.getElementById('trip-form-save');

  // Location detail modal
  const locationModal            = document.getElementById('location-modal');
  const locDetailClose           = document.getElementById('loc-detail-close');
  const modalLocationName        = document.getElementById('modal-location-name');
  const modalCarouselSlides      = document.querySelector('#modal-carousel .carousel-slides');
  const modalCarouselDots        = document.querySelector('#modal-carousel .carousel-dots');
  const modalCarouselPrev        = document.querySelector('#modal-carousel .carousel-button.prev');
  const modalCarouselNext        = document.querySelector('#modal-carousel .carousel-button.next');
  const modalLocationDifficulty  = document.getElementById('modal-location-difficulty');
  const modalLocationGmapsLink   = document.getElementById('modal-location-gmaps-link');
  const modalLocationDescription = document.getElementById('modal-location-description');
  const modalLocationTips        = document.getElementById('modal-location-tips');
  const modalMapIframe           = document.getElementById('modal-map-iframe');

  // Location edit modal
  const locationEditModal  = document.getElementById('location-edit-modal');
  const locEditClose       = document.getElementById('loc-edit-close');
  const locEditTitle       = document.getElementById('loc-edit-title');
  const locEditName        = document.getElementById('loc-edit-name');
  const locEditDescription = document.getElementById('loc-edit-description');
  const locEditDifficulty  = document.getElementById('loc-edit-difficulty');
  const locEditTips        = document.getElementById('loc-edit-tips');
  const locEditImages      = document.getElementById('loc-edit-images');
  const locEditCoordinates = document.getElementById('loc-edit-coordinates');
  const locEditMapUrl      = document.getElementById('loc-edit-mapurl');
  const locEditId          = document.getElementById('loc-edit-id');
  const locEditSave        = document.getElementById('loc-edit-save');

  // Carousel state
  let currentSlideIndex = 0;
  let currentSlides     = [];

  // ============================================================
  // NAVIGATION
  // ============================================================
  const switchScreen = (targetScreenId, newTitle) => {
    const current = document.querySelector('.screen.active');
    const target  = document.getElementById(targetScreenId);
    if (current === target) return;

    if (current) {
      current.classList.add('exit-left');
      setTimeout(() => current.classList.remove('active'), 0);
    }
    if (target) {
      setTimeout(() => {
        screens.forEach(s => { if (s.id !== targetScreenId) s.classList.remove('active', 'exit-left'); });
        target.classList.remove('exit-left');
        target.classList.add('active');
        renderScreen(targetScreenId);
      }, 150);
    }
    headerTitle.textContent = newTitle;
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === targetScreenId));
  };

  const renderScreen = (screenId) => {
    switch (screenId) {
      case 'dashboard-screen':  renderDashboard();  break;
      case 'budget-screen':     renderBudget();     break;
      case 'map-screen':        renderLocations();  break;
      case 'itinerary-screen':  renderItinerary();  break;
      case 'checklist-screen':  renderChecklist();  break;
    }
  };

  const updateHeaderChip = () => {
    const trip = Storage.getActiveTrip();
    if (activeTripChip) activeTripChip.textContent = trip ? trip.name : '';
  };

  navButtons.forEach(btn => btn.addEventListener('click', () => {
    switchScreen(btn.dataset.screen, btn.dataset.title);
  }));

  // ============================================================
  // TRIPS OVERLAY
  // ============================================================
  const openTripsOverlay = () => {
    renderTripsOverlay();
    tripsOverlay.classList.add('active');
    tripsOverlay.setAttribute('aria-hidden', 'false');
  };

  const closeTripsOverlay = () => {
    tripsOverlay.classList.remove('active');
    tripsOverlay.setAttribute('aria-hidden', 'true');
  };

  const renderTripsOverlay = () => {
    const trips    = Storage.getTrips();
    const activeId = Storage.getActiveTripId();
    tripsListEl.innerHTML = '';
    if (trips.length === 0) {
      tripsListEl.innerHTML = '<p class="empty-state">Nu exist\u0103 c\u0103l\u0103torii. Creeaz\u0103 una!</p>';
      return;
    }
    trips.forEach(trip => {
      const isActive = trip.id === activeId;
      const card     = document.createElement('div');
      card.className = 'trip-card' + (isActive ? ' active' : '');

      let dateRange = '';
      try {
        const fmt = { day: 'numeric', month: 'short', year: 'numeric' };
        const s = trip.startDate ? new Date(trip.startDate).toLocaleDateString('ro-RO', fmt) : '';
        const e = trip.endDate   ? new Date(trip.endDate).toLocaleDateString('ro-RO', fmt)   : '';
        dateRange = s && e ? s + ' \u2013 ' + e : (s || e);
      } catch (_) { /* ignore */ }

      const locCount  = (trip.locations  || []).length;
      const travelers = trip.travelers || 1;

      card.innerHTML =
        '<div class="trip-card-info" data-id="' + trip.id + '">' +
          '<div class="trip-card-name">' + escapeHtml(trip.name) +
            (isActive ? ' <span class="trip-active-badge">activ</span>' : '') +
          '</div>' +
          (dateRange ? '<div class="trip-card-meta">' + escapeHtml(dateRange) + '</div>' : '') +
          '<div class="trip-card-meta">' + locCount + ' loca\u021bii \u00b7 ' + travelers + ' pers.</div>' +
        '</div>' +
        '<div class="trip-card-actions">' +
          '<button class="icon-btn trip-export-btn" data-id="' + trip.id + '" title="Export JSON">\u2b07\ufe0f</button>' +
          '<button class="icon-btn trip-edit-btn"   data-id="' + trip.id + '" title="Editeaz\u0103">\u270f\ufe0f</button>' +
          '<button class="icon-btn trip-delete-btn" data-id="' + trip.id + '" title="\u0218terge">\ud83d\uddd1\ufe0f</button>' +
        '</div>';
      tripsListEl.appendChild(card);
    });
  };

  tripsListEl.addEventListener('click', (e) => {
    const exportBtn = e.target.closest('.trip-export-btn');
    const editBtn   = e.target.closest('.trip-edit-btn');
    const deleteBtn = e.target.closest('.trip-delete-btn');
    const infoArea  = e.target.closest('.trip-card-info');

    if (exportBtn) {
      exportTrip(exportBtn.dataset.id);
    } else if (editBtn) {
      openTripForm(editBtn.dataset.id);
    } else if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm('\u0218tergi aceast\u0103 c\u0103l\u0103torie? Ac\u021biunea este ireversibil\u0103.')) {
        Storage.deleteTrip(id);
        renderTripsOverlay();
        updateHeaderChip();
        const active = document.querySelector('.screen.active');
        if (active) renderScreen(active.id);
        showToast('C\u0103l\u0103torie \u015fters\u0103');
      }
    } else if (infoArea) {
      Storage.setActiveTripId(infoArea.dataset.id);
      closeTripsOverlay();
      updateHeaderChip();
      const active = document.querySelector('.screen.active');
      if (active) renderScreen(active.id);
      showToast('C\u0103l\u0103torie selectat\u0103 \u2713');
    }
  });

  tripsToggleBtn.addEventListener('click', openTripsOverlay);
  tripsOverlayClose.addEventListener('click', closeTripsOverlay);
  document.querySelector('.trips-overlay-backdrop').addEventListener('click', closeTripsOverlay);

  // ============================================================
  // TRIP FORM MODAL
  // ============================================================
  const openTripForm = (tripId) => {
    if (tripId) {
      const trip = Storage.getTrips().find(t => t.id === tripId);
      if (trip) {
        tripFormTitle.textContent = 'Editeaz\u0103 c\u0103l\u0103toria';
        tripFormName.value        = trip.name      || '';
        tripFormStart.value       = trip.startDate || '';
        tripFormEnd.value         = trip.endDate   || '';
        tripFormTravelers.value   = trip.travelers || 1;
        tripFormId.value          = trip.id;
      }
    } else {
      tripFormTitle.textContent = 'C\u0103l\u0103torie nou\u0103';
      tripFormName.value        = '';
      tripFormStart.value       = '';
      tripFormEnd.value         = '';
      tripFormTravelers.value   = 1;
      tripFormId.value          = '';
    }
    tripFormModal.classList.add('active');
  };

  const closeTripForm = () => tripFormModal.classList.remove('active');

  tripFormClose.addEventListener('click', closeTripForm);
  tripFormModal.addEventListener('click', (e) => { if (e.target === tripFormModal) closeTripForm(); });

  tripFormSave.addEventListener('click', () => {
    const name = tripFormName.value.trim();
    if (!name) { tripFormName.focus(); return; }
    const data = {
      name,
      startDate: tripFormStart.value,
      endDate:   tripFormEnd.value,
      travelers: Math.max(1, parseInt(tripFormTravelers.value) || 1)
    };
    const id = tripFormId.value;
    if (id) {
      Storage.updateTrip(id, data);
      showToast('C\u0103l\u0103torie actualizat\u0103 \u2713');
    } else {
      const newTrip = Storage.createTrip(data);
      Storage.setActiveTripId(newTrip.id);
      showToast('C\u0103l\u0103torie creat\u0103 \u2713');
    }
    closeTripForm();
    closeTripsOverlay();
    updateHeaderChip();
    const active = document.querySelector('.screen.active');
    if (active) renderScreen(active.id);
  });

  newTripBtn.addEventListener('click', () => openTripForm(null));

  // ============================================================
  // EXPORT / IMPORT
  // ============================================================
  const exportTrip = (tripId) => {
    const trip = Storage.getTrips().find(t => t.id === tripId);
    if (!trip) return;
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = trip.name.replace(/[^a-z0-9]/gi, '_') + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  importTripBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data || !data.name) throw new Error('Invalid trip JSON');
        data.id = Storage.generateId();
        const trips = Storage.getTrips();
        trips.push(data);
        Storage.saveTrips(trips);
        Storage.setActiveTripId(data.id);
        renderTripsOverlay();
        updateHeaderChip();
        const active = document.querySelector('.screen.active');
        if (active) renderScreen(active.id);
        showToast('C\u0103l\u0103torie importat\u0103 \u2713');
      } catch (_) {
        showToast('Eroare: JSON invalid');
      }
    };
    reader.readAsText(file);
    importFileInput.value = '';
  });

  // ============================================================
  // DASHBOARD
  // ============================================================
  const renderDashboard = () => {
    const screen = document.getElementById('dashboard-screen');
    const trip   = Storage.getActiveTrip();
    if (!trip) {
      screen.innerHTML = '<p class="empty-state">Nicio c\u0103l\u0103torie activ\u0103. Apas\u0103 \u2708\ufe0f din header pentru a crea una.</p>';
      return;
    }

    const v = trip.vehicle || {};
    const metaCards = (trip.meta || []).map(m =>
      '<div class="info-card" data-meta-id="' + m.id + '">' +
        '<div class="info-card-actions">' +
          '<button class="icon-btn edit-meta-btn"   data-id="' + m.id + '" title="Editeaz\u0103">\u270f\ufe0f</button>' +
          '<button class="icon-btn delete-meta-btn" data-id="' + m.id + '" title="\u0218terge">\u00d7</button>' +
        '</div>' +
        '<h3>' + escapeHtml(m.icon) + ' ' + escapeHtml(m.label) + '</h3>' +
        '<p>' + escapeHtml(m.value) + '</p>' +
        '<span>' + escapeHtml(m.sub) + '</span>' +
      '</div>'
    ).join('');

    screen.innerHTML =
      '<div class="dashboard-layout">' +
        '<div class="dashboard-main-content">' +
          '<div class="content-card vehicle-card" id="vehicle-card">' +
            (v.imageUrl
              ? '<img src="' + escapeHtml(v.imageUrl) + '" alt="' + escapeHtml(v.name) + '">'
              : '<div class="vehicle-img-placeholder">\ud83d\ude90</div>') +
            '<div class="card-body">' +
              '<div class="card-body-header">' +
                '<h2>' + escapeHtml(v.name || 'Vehicul') + '</h2>' +
                '<button class="icon-btn edit-vehicle-btn" title="Editeaz\u0103 vehicul">\u270f\ufe0f</button>' +
              '</div>' +
              '<p>' + escapeHtml(v.description || '') + '</p>' +
            '</div>' +
            '<div class="vehicle-edit-form" id="vehicle-edit-form" style="display:none;">' +
              '<div class="form-group">' +
                '<label>Nume vehicul</label>' +
                '<input type="text" id="vehicle-name-input" class="form-input" value="' + escapeHtml(v.name || '') + '">' +
              '</div>' +
              '<div class="form-group">' +
                '<label>Descriere</label>' +
                '<input type="text" id="vehicle-desc-input" class="form-input" value="' + escapeHtml(v.description || '') + '">' +
              '</div>' +
              '<div class="form-group">' +
                '<label>URL imagine</label>' +
                '<input type="text" id="vehicle-img-input" class="form-input" value="' + escapeHtml(v.imageUrl || '') + '" placeholder="images/monster.png">' +
              '</div>' +
              '<div class="form-actions">' +
                '<button class="btn-secondary vehicle-edit-cancel">Anuleaz\u0103</button>' +
                '<button class="btn-primary  vehicle-edit-save">Salveaz\u0103</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<aside class="dashboard-sidebar">' +
          '<div class="info-grid">' +
            metaCards +
            '<div class="info-card info-card-add">' +
              '<button class="icon-btn add-meta-btn" title="Adaug\u0103 card">+</button>' +
              '<span>Card nou</span>' +
            '</div>' +
          '</div>' +
          '<div class="dashboard-footer-actions">' +
            '<button class="btn-secondary btn-full export-trip-btn">\u2b07\ufe0f Export c\u0103l\u0103torie</button>' +
          '</div>' +
        '</aside>' +
      '</div>';

    // Vehicle edit toggle
    const vEditForm  = screen.querySelector('#vehicle-edit-form');
    const vEditBtn   = screen.querySelector('.edit-vehicle-btn');
    screen.querySelector('.vehicle-edit-cancel').addEventListener('click', () => { vEditForm.style.display = 'none'; });
    vEditBtn.addEventListener('click', () => {
      vEditForm.style.display = vEditForm.style.display === 'none' ? 'block' : 'none';
    });
    screen.querySelector('.vehicle-edit-save').addEventListener('click', () => {
      const newVehicle = {
        name:        screen.querySelector('#vehicle-name-input').value.trim(),
        description: screen.querySelector('#vehicle-desc-input').value.trim(),
        imageUrl:    screen.querySelector('#vehicle-img-input').value.trim()
      };
      Storage.updateTrip(trip.id, { vehicle: newVehicle });
      showToast('Vehicul actualizat \u2713');
      renderDashboard();
    });

    // Meta card actions
    screen.querySelector('.add-meta-btn').addEventListener('click', () => openMetaForm(trip.id, null));
    screen.querySelectorAll('.edit-meta-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); openMetaForm(trip.id, btn.dataset.id); });
    });
    screen.querySelectorAll('.delete-meta-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newMeta = (trip.meta || []).filter(m => m.id !== btn.dataset.id);
        Storage.updateTrip(trip.id, { meta: newMeta });
        showToast('Card \u015fters \u2713');
        renderDashboard();
      });
    });

    screen.querySelector('.export-trip-btn').addEventListener('click', () => exportTrip(trip.id));
  };

  const openMetaForm = (tripId, metaId) => {
    const trip     = Storage.getActiveTrip();
    const existing = metaId ? (trip.meta || []).find(m => m.id === metaId) : null;
    const prev     = document.getElementById('meta-form-overlay');
    if (prev) prev.remove();

    const overlay     = document.createElement('div');
    overlay.id        = 'meta-form-overlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML =
      '<div class="modal-content" style="max-width:420px;">' +
        '<button class="modal-close-button" id="mf-close">\u00d7</button>' +
        '<h2>' + (existing ? 'Editeaz\u0103 card' : 'Card nou') + '</h2>' +
        '<div class="form-group"><label>Emoji / Icon</label>' +
          '<input type="text" id="mf-icon"  class="form-input" value="' + (existing ? escapeHtml(existing.icon  || '') : '') + '" placeholder="\ud83d\udcc5"></div>' +
        '<div class="form-group"><label>Label</label>' +
          '<input type="text" id="mf-label" class="form-input" value="' + (existing ? escapeHtml(existing.label || '') : '') + '" placeholder="Perioada"></div>' +
        '<div class="form-group"><label>Valoare</label>' +
          '<input type="text" id="mf-value" class="form-input" value="' + (existing ? escapeHtml(existing.value || '') : '') + '" placeholder="2 S\u0103pt."></div>' +
        '<div class="form-group"><label>Sub-titlu</label>' +
          '<input type="text" id="mf-sub"   class="form-input" value="' + (existing ? escapeHtml(existing.sub   || '') : '') + '" placeholder="Aug-Sep 2025"></div>' +
        '<div class="form-actions"><button id="mf-save" class="btn-primary btn-full">Salveaz\u0103</button></div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#mf-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#mf-save').addEventListener('click', () => {
      const icon  = overlay.querySelector('#mf-icon').value.trim();
      const label = overlay.querySelector('#mf-label').value.trim();
      const value = overlay.querySelector('#mf-value').value.trim();
      const sub   = overlay.querySelector('#mf-sub').value.trim();
      if (!label) { overlay.querySelector('#mf-label').focus(); return; }
      let meta = [...(trip.meta || [])];
      if (existing) {
        meta = meta.map(m => m.id === metaId ? Object.assign({}, m, { icon, label, value, sub }) : m);
      } else {
        meta.push({ id: Storage.generateId(), icon, label, value, sub });
      }
      Storage.updateTrip(tripId, { meta });
      overlay.remove();
      showToast('Card salvat \u2713');
      renderDashboard();
    });
  };

  // ============================================================
  // BUDGET
  // ============================================================
  const renderBudget = () => {
    const screen = document.getElementById('budget-screen');
    const trip   = Storage.getActiveTrip();
    if (!trip) { screen.innerHTML = '<p class="empty-state">Nicio c\u0103l\u0103torie activ\u0103.</p>'; return; }

    const budget    = trip.budget   || [];
    const travelers = trip.travelers || 1;
    const total     = budget.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const currency  = budget.length > 0 ? (budget[0].currency || '\u20ac') : '\u20ac';

    const rows = budget.map(item =>
      '<li class="budget-item" data-id="' + item.id + '">' +
        '<span class="budget-icon">' + escapeHtml(item.icon || '') + '</span>' +
        '<span class="budget-label">' + escapeHtml(item.label || '') + '</span>' +
        '<span class="budget-amount cost">' + item.amount + ' ' + escapeHtml(item.currency || '\u20ac') + '</span>' +
        '<div class="item-actions">' +
          '<button class="icon-btn budget-edit-btn"   data-id="' + item.id + '" title="Editeaz\u0103">\u270f\ufe0f</button>' +
          '<button class="icon-btn budget-delete-btn" data-id="' + item.id + '" title="\u0218terge">\u00d7</button>' +
        '</div>' +
      '</li>'
    ).join('');

    screen.innerHTML =
      '<div class="total-budget-card">' +
        '<h3>Total</h3>' +
        '<p id="total-cost">' + total.toFixed(0) + ' ' + currency + '</p>' +
        '<small>' + (travelers > 1 ? (total / travelers).toFixed(0) + ' ' + currency + ' / persoan\u0103' : '1 persoan\u0103') + '</small>' +
        '<div class="travelers-row">' +
          '<label for="travelers-input">Persoane:</label>' +
          '<input type="number" id="travelers-input" class="form-input-inline" value="' + travelers + '" min="1" max="99">' +
        '</div>' +
      '</div>' +
      '<ul class="budget-list" id="budget-list">' + rows + '</ul>' +
      '<button class="btn-secondary btn-full" id="add-budget-item-btn" style="margin-top:10px;">+ Adaug\u0103 cheltuial\u0103</button>';

    screen.querySelector('#travelers-input').addEventListener('change', (e) => {
      Storage.updateTrip(trip.id, { travelers: Math.max(1, parseInt(e.target.value) || 1) });
      renderBudget();
    });
    screen.querySelectorAll('.budget-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openBudgetForm(trip.id, btn.dataset.id));
    });
    screen.querySelectorAll('.budget-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newBudget = (trip.budget || []).filter(b => b.id !== btn.dataset.id);
        Storage.updateTrip(trip.id, { budget: newBudget });
        showToast('Cheltuial\u0103 \u015fters\u0103 \u2713');
        renderBudget();
      });
    });
    screen.querySelector('#add-budget-item-btn').addEventListener('click', () => openBudgetForm(trip.id, null));
  };

  const openBudgetForm = (tripId, itemId) => {
    const trip     = Storage.getActiveTrip();
    const existing = itemId ? (trip.budget || []).find(b => b.id === itemId) : null;
    const prev     = document.getElementById('budget-form-overlay');
    if (prev) prev.remove();

    const overlay     = document.createElement('div');
    overlay.id        = 'budget-form-overlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML =
      '<div class="modal-content" style="max-width:420px;">' +
        '<button class="modal-close-button" id="bf-close">\u00d7</button>' +
        '<h2>' + (existing ? 'Editeaz\u0103 cheltuial\u0103' : 'Cheltuial\u0103 nou\u0103') + '</h2>' +
        '<div class="form-group"><label>Icon (emoji)</label>' +
          '<input type="text" id="bf-icon"  class="form-input" value="' + (existing ? escapeHtml(existing.icon || '') : '') + '" placeholder="\u2708\ufe0f"></div>' +
        '<div class="form-group"><label>Descriere</label>' +
          '<input type="text" id="bf-label" class="form-input" value="' + (existing ? escapeHtml(existing.label || '') : '') + '" placeholder="Bilete de avion"></div>' +
        '<div class="form-row">' +
          '<div class="form-group"><label>Sum\u0103</label>' +
            '<input type="number" id="bf-amount" class="form-input" value="' + (existing ? existing.amount : '') + '" placeholder="500" min="0"></div>' +
          '<div class="form-group"><label>Moned\u0103</label>' +
            '<select id="bf-currency" class="form-input">' +
              '<option value="\u20ac"'  + ((!existing || existing.currency === '\u20ac') ? ' selected' : '') + '>\u20ac Euro</option>' +
              '<option value="$"'   + (existing && existing.currency === '$'   ? ' selected' : '') + '>$ USD</option>' +
              '<option value="\u00a3"'  + (existing && existing.currency === '\u00a3'   ? ' selected' : '') + '>\u00a3 GBP</option>' +
              '<option value="kr"'  + (existing && existing.currency === 'kr'  ? ' selected' : '') + '>kr SEK/NOK</option>' +
            '</select></div>' +
        '</div>' +
        '<div class="form-actions"><button id="bf-save" class="btn-primary btn-full">Salveaz\u0103</button></div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#bf-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#bf-save').addEventListener('click', () => {
      const icon     = overlay.querySelector('#bf-icon').value.trim();
      const label    = overlay.querySelector('#bf-label').value.trim();
      const amount   = parseFloat(overlay.querySelector('#bf-amount').value) || 0;
      const currency = overlay.querySelector('#bf-currency').value;
      if (!label) { overlay.querySelector('#bf-label').focus(); return; }
      let budget = [...(trip.budget || [])];
      if (existing) {
        budget = budget.map(b => b.id === itemId ? Object.assign({}, b, { icon, label, amount, currency }) : b);
      } else {
        budget.push({ id: Storage.generateId(), icon, label, amount, currency });
      }
      Storage.updateTrip(tripId, { budget });
      overlay.remove();
      showToast('Cheltuial\u0103 salvat\u0103 \u2713');
      renderBudget();
    });
  };

  // ============================================================
  // LOCATIONS
  // ============================================================
  const renderLocations = () => {
    const container = document.getElementById('location-list-container');
    const trip      = Storage.getActiveTrip();
    if (!trip) { container.innerHTML = '<p class="empty-state">Nicio c\u0103l\u0103torie activ\u0103.</p>'; return; }

    const locations = trip.locations || [];
    if (locations.length === 0) {
      container.innerHTML = '<p class="empty-state">Nicio loca\u021bie ad\u0103ugat\u0103. Apas\u0103 + pentru a ad\u0103uga prima loca\u021bie.</p>';
      return;
    }

    container.innerHTML = locations.map(loc => {
      const thumb = (loc.imageUrls && loc.imageUrls[0]) ? loc.imageUrls[0] : '';
      const desc  = loc.description ? loc.description.slice(0, 100) + (loc.description.length > 100 ? '\u2026' : '') : '';
      return (
        '<div class="location-card" data-loc-id="' + loc.id + '">' +
          (thumb ? '<img src="' + escapeHtml(thumb) + '" alt="' + escapeHtml(loc.name || '') + '" onerror="this.style.display=\'none\'">' : '') +
          '<div class="location-card-content">' +
            '<h3>' + escapeHtml(loc.name || '') + '</h3>' +
            '<p>' + escapeHtml(desc) + '</p>' +
            '<div class="location-card-actions">' +
              '<button class="btn-details loc-detail-btn" data-id="' + loc.id + '">Vezi Detalii</button>' +
              '<button class="icon-btn loc-edit-btn"   data-id="' + loc.id + '" title="Editeaz\u0103">\u270f\ufe0f</button>' +
              '<button class="icon-btn loc-delete-btn" data-id="' + loc.id + '" title="\u0218terge">\u00d7</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    container.querySelectorAll('.loc-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const loc = (trip.locations || []).find(l => l.id === btn.dataset.id);
        if (loc) openLocationDetailModal(loc);
      });
    });
    container.querySelectorAll('.loc-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); openLocationEditModal(btn.dataset.id); });
    });
    container.querySelectorAll('.loc-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('\u0218tergi aceast\u0103 loca\u021bie?')) {
          const newLocations = (trip.locations || []).filter(l => l.id !== btn.dataset.id);
          Storage.updateTrip(trip.id, { locations: newLocations });
          showToast('Loca\u021bie \u015fters\u0103 \u2713');
          renderLocations();
        }
      });
    });
  };

  // Location detail modal
  const openLocationDetailModal = (loc) => {
    modalLocationName.textContent        = loc.name        || '';
    modalLocationDescription.textContent = loc.description || 'Nicio descriere.';
    modalLocationDifficulty.textContent  = loc.difficulty  || 'N/A';
    modalLocationTips.textContent        = loc.tips        || 'N/A';
    modalMapIframe.src                   = loc.mapEmbedUrl || '';
    if (loc.coordinates) {
      modalLocationGmapsLink.href          = 'https://www.google.com/maps/search/?api=1&query=' + loc.coordinates;
      modalLocationGmapsLink.style.display = 'inline';
    } else {
      modalLocationGmapsLink.style.display = 'none';
    }
    setupCarousel(loc.imageUrls || []);
    locationModal.classList.add('active');
  };

  const closeLocationDetailModal = () => {
    locationModal.classList.remove('active');
    modalMapIframe.src            = '';
    modalCarouselSlides.innerHTML = '';
    modalCarouselDots.innerHTML   = '';
    currentSlides = [];
  };

  locDetailClose.addEventListener('click', closeLocationDetailModal);
  locationModal.addEventListener('click', (e) => { if (e.target === locationModal) closeLocationDetailModal(); });

  // Location edit modal
  const openLocationEditModal = (locId) => {
    const trip     = Storage.getActiveTrip();
    const existing = locId ? (trip.locations || []).find(l => l.id === locId) : null;
    locEditTitle.textContent = existing ? 'Editeaz\u0103 loca\u021bie' : 'Adaug\u0103 loca\u021bie';
    locEditName.value        = existing ? (existing.name        || '') : '';
    locEditDescription.value = existing ? (existing.description || '') : '';
    locEditDifficulty.value  = existing ? (existing.difficulty  || '') : '';
    locEditTips.value        = existing ? (existing.tips        || '') : '';
    locEditImages.value      = existing ? (existing.imageUrls   || []).join('\n') : '';
    locEditCoordinates.value = existing ? (existing.coordinates || '') : '';
    locEditMapUrl.value      = existing ? (existing.mapEmbedUrl || '') : '';
    locEditId.value          = locId || '';
    locationEditModal.classList.add('active');
  };

  const closeLocationEditModal = () => locationEditModal.classList.remove('active');

  locEditClose.addEventListener('click', closeLocationEditModal);
  locationEditModal.addEventListener('click', (e) => { if (e.target === locationEditModal) closeLocationEditModal(); });
  document.getElementById('add-location-btn').addEventListener('click', () => openLocationEditModal(null));

  locEditSave.addEventListener('click', () => {
    const trip = Storage.getActiveTrip();
    const name = locEditName.value.trim();
    if (!name) { locEditName.focus(); return; }
    const locData = {
      name,
      description: locEditDescription.value.trim(),
      difficulty:  locEditDifficulty.value.trim(),
      tips:        locEditTips.value.trim(),
      imageUrls:   locEditImages.value.split('\n').map(s => s.trim()).filter(Boolean),
      coordinates: locEditCoordinates.value.trim(),
      mapEmbedUrl: locEditMapUrl.value.trim()
    };
    const id = locEditId.value;
    let locations = [...(trip.locations || [])];
    if (id) {
      locations = locations.map(l => l.id === id ? Object.assign({}, l, locData) : l);
    } else {
      locations.push(Object.assign({ id: Storage.generateId() }, locData));
    }
    Storage.updateTrip(trip.id, { locations });
    closeLocationEditModal();
    showToast('Loca\u021bie salvat\u0103 \u2713');
    renderLocations();
  });

  // Carousel
  const setupCarousel = (imageUrls) => {
    modalCarouselSlides.innerHTML = '';
    modalCarouselDots.innerHTML   = '';
    currentSlides     = [];
    currentSlideIndex = 0;

    if (!imageUrls || imageUrls.length === 0) {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = '<div class="carousel-no-image">\ud83d\udcf7</div>';
      modalCarouselSlides.appendChild(slide);
      currentSlides.push(slide);
      updateCarousel();
      return;
    }
    imageUrls.forEach((url, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = '<img src="' + escapeHtml(url) + '" alt="Imagine ' + (i + 1) + '" loading="lazy">';
      modalCarouselSlides.appendChild(slide);
      currentSlides.push(slide);

      const dot = document.createElement('span');
      dot.className     = 'carousel-dot';
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      modalCarouselDots.appendChild(dot);
    });
    updateCarousel();
  };

  const updateCarousel = () => {
    if (!currentSlides.length) return;
    modalCarouselSlides.style.transform = 'translateX(-' + (currentSlideIndex * 100) + '%)';
    document.querySelectorAll('#modal-carousel .carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlideIndex);
    });
    const show = currentSlides.length > 1;
    modalCarouselPrev.style.display = show ? 'flex' : 'none';
    modalCarouselNext.style.display = show ? 'flex' : 'none';
    modalCarouselDots.style.display = show ? 'block' : 'none';
  };

  const nextSlide = () => { currentSlideIndex = (currentSlideIndex + 1) % currentSlides.length; updateCarousel(); };
  const prevSlide = () => { currentSlideIndex = (currentSlideIndex - 1 + currentSlides.length) % currentSlides.length; updateCarousel(); };
  const goToSlide = (i) => { currentSlideIndex = i; updateCarousel(); };
  modalCarouselPrev.addEventListener('click', prevSlide);
  modalCarouselNext.addEventListener('click', nextSlide);

  // ============================================================
  // ITINERARY
  // ============================================================
  const renderItinerary = () => {
    const screen = document.getElementById('itinerary-screen');
    const trip   = Storage.getActiveTrip();
    if (!trip) { screen.innerHTML = '<p class="empty-state">Nicio c\u0103l\u0103torie activ\u0103.</p>'; return; }

    const itinerary     = trip.itinerary || [];
    const locationNames = (trip.locations || []).map(l => l.name);

    const daysHtml = itinerary.map(day => {
      const eventsHtml = (day.events || []).map(ev =>
        '<li class="itinerary-event-list-item">' +
          '<span class="event-time">'        + escapeHtml(ev.time        || '') + '</span>' +
          '<span class="event-description">' + escapeHtml(ev.description || '') + '</span>' +
          '<span class="event-type-icon">'   + escapeHtml(ev.icon        || '') + '</span>' +
          '<div class="item-actions item-actions-compact">' +
            '<button class="icon-btn edit-event-btn"   data-day="' + day.id + '" data-event="' + ev.id + '" title="Editeaz\u0103">\u270f\ufe0f</button>' +
            '<button class="icon-btn delete-event-btn" data-day="' + day.id + '" data-event="' + ev.id + '" title="\u0218terge">\u00d7</button>' +
          '</div>' +
        '</li>'
      ).join('');

      return (
        '<div class="itinerary-day-card" data-day-id="' + day.id + '">' +
          '<div class="itinerary-day-header">' +
            '<h2>' + escapeHtml(day.date || '') + ' <span class="day-name">' + escapeHtml(day.dayName || '') + '</span></h2>' +
            '<button class="icon-btn delete-day-btn" data-day="' + day.id + '" title="\u0218terge ziua">\u00d7</button>' +
          '</div>' +
          '<ul class="itinerary-event-list">' + eventsHtml + '</ul>' +
          '<button class="btn-add-event" data-day="' + day.id + '">+ Eveniment</button>' +
        '</div>'
      );
    }).join('');

    screen.innerHTML = daysHtml + '<button class="btn-secondary btn-full" id="add-day-btn" style="margin-top:10px;">+ Adaug\u0103 zi</button>';

    screen.querySelectorAll('.delete-day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('\u0218tergi aceast\u0103 zi?')) {
          const newItinerary = (trip.itinerary || []).filter(d => d.id !== btn.dataset.day);
          Storage.updateTrip(trip.id, { itinerary: newItinerary });
          showToast('Zi \u015fters\u0103 \u2713');
          renderItinerary();
        }
      });
    });

    screen.querySelectorAll('.btn-add-event').forEach(btn => {
      btn.addEventListener('click', () => openEventForm(trip.id, btn.dataset.day, null, locationNames));
    });

    screen.querySelectorAll('.edit-event-btn').forEach(btn => {
      btn.addEventListener('click', () => openEventForm(trip.id, btn.dataset.day, btn.dataset.event, locationNames));
    });

    screen.querySelectorAll('.delete-event-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newItinerary = (trip.itinerary || []).map(d => {
          if (d.id !== btn.dataset.day) return d;
          return Object.assign({}, d, { events: (d.events || []).filter(ev => ev.id !== btn.dataset.event) });
        });
        Storage.updateTrip(trip.id, { itinerary: newItinerary });
        showToast('Eveniment \u015fters \u2713');
        renderItinerary();
      });
    });

    screen.querySelector('#add-day-btn').addEventListener('click', () => openDayForm(trip.id));
  };

  const openDayForm = (tripId) => {
    const prev = document.getElementById('day-form-overlay');
    if (prev) prev.remove();
    const overlay     = document.createElement('div');
    overlay.id        = 'day-form-overlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML =
      '<div class="modal-content" style="max-width:400px;">' +
        '<button class="modal-close-button" id="df-close">\u00d7</button>' +
        '<h2>Adaug\u0103 zi</h2>' +
        '<div class="form-group"><label>Data (ex: 19.08)</label>' +
          '<input type="text" id="df-date"    class="form-input" placeholder="19.08"></div>' +
        '<div class="form-group"><label>Ziua s\u0103pt\u0103m\u00e2nii</label>' +
          '<input type="text" id="df-dayname" class="form-input" placeholder="Mar\u021bi"></div>' +
        '<div class="form-actions"><button id="df-save" class="btn-primary btn-full">Adaug\u0103</button></div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#df-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#df-save').addEventListener('click', () => {
      const date    = overlay.querySelector('#df-date').value.trim();
      const dayName = overlay.querySelector('#df-dayname').value.trim();
      if (!date) { overlay.querySelector('#df-date').focus(); return; }
      const trip      = Storage.getActiveTrip();
      const itinerary = [...(trip.itinerary || []), { id: Storage.generateId(), date, dayName, events: [] }];
      Storage.updateTrip(tripId, { itinerary });
      overlay.remove();
      showToast('Zi ad\u0103ugat\u0103 \u2713');
      renderItinerary();
    });
  };

  const openEventForm = (tripId, dayId, eventId, locationNames) => {
    const trip      = Storage.getActiveTrip();
    const day       = (trip.itinerary || []).find(d => d.id === dayId);
    const existing  = eventId ? ((day && day.events) || []).find(ev => ev.id === eventId) : null;
    const prev      = document.getElementById('event-form-overlay');
    if (prev) prev.remove();

    const locOptions = ['', ...locationNames].map(n =>
      '<option value="' + escapeHtml(n) + '"' + (existing && existing.locationRef === n ? ' selected' : '') + '>' +
        (escapeHtml(n) || '\u2014 niciuna \u2014') +
      '</option>'
    ).join('');

    const overlay     = document.createElement('div');
    overlay.id        = 'event-form-overlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML =
      '<div class="modal-content" style="max-width:460px;">' +
        '<button class="modal-close-button" id="ef-close">\u00d7</button>' +
        '<h2>' + (existing ? 'Editeaz\u0103 eveniment' : 'Eveniment nou') + '</h2>' +
        '<div class="form-group"><label>Or\u0103</label>' +
          '<input type="text" id="ef-time" class="form-input" value="' + (existing ? escapeHtml(existing.time || '') : '') + '" placeholder="08:00"></div>' +
        '<div class="form-group"><label>Descriere</label>' +
          '<input type="text" id="ef-desc" class="form-input" value="' + (existing ? escapeHtml(existing.description || '') : '') + '" placeholder="Skogafoss Waterfall hike"></div>' +
        '<div class="form-group"><label>Icon (emoji)</label>' +
          '<input type="text" id="ef-icon" class="form-input" value="' + (existing ? escapeHtml(existing.icon || '') : '') + '" placeholder="\ud83c\udf04"></div>' +
        '<div class="form-group"><label>Loca\u021bie (op\u021bional)</label>' +
          '<select id="ef-locref" class="form-input">' + locOptions + '</select></div>' +
        '<div class="form-actions"><button id="ef-save" class="btn-primary btn-full">Salveaz\u0103</button></div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('#ef-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#ef-save').addEventListener('click', () => {
      const time        = overlay.querySelector('#ef-time').value.trim();
      const description = overlay.querySelector('#ef-desc').value.trim();
      const icon        = overlay.querySelector('#ef-icon').value.trim();
      const locationRef = overlay.querySelector('#ef-locref').value;
      if (!description) { overlay.querySelector('#ef-desc').focus(); return; }

      const newItinerary = (trip.itinerary || []).map(d => {
        if (d.id !== dayId) return d;
        let events = [...(d.events || [])];
        if (existing) {
          events = events.map(ev => ev.id === eventId ? Object.assign({}, ev, { time, description, icon, locationRef }) : ev);
        } else {
          events.push({ id: Storage.generateId(), time, description, icon, locationRef });
        }
        return Object.assign({}, d, { events });
      });
      Storage.updateTrip(tripId, { itinerary: newItinerary });
      overlay.remove();
      showToast('Eveniment salvat \u2713');
      renderItinerary();
    });
  };

  // ============================================================
  // CHECKLIST
  // ============================================================
  const renderChecklist = () => {
    const screen = document.getElementById('checklist-screen');
    const trip   = Storage.getActiveTrip();
    if (!trip) { screen.innerHTML = '<p class="empty-state">Nicio c\u0103l\u0103torie activ\u0103.</p>'; return; }

    const checklist = trip.checklist || [];
    const checked   = checklist.filter(c => c.checked).length;

    const categories = [];
    checklist.forEach(c => {
      const cat = c.category || 'General';
      if (!categories.includes(cat)) categories.push(cat);
    });

    const byCategory = categories.map(cat => {
      const items = checklist.filter(c => (c.category || 'General') === cat);
      const rows  = items.map(item =>
        '<li class="' + (item.checked ? 'checked' : '') + '" data-id="' + item.id + '">' +
          '<div class="checkbox">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
          '</div>' +
          '<span>' + escapeHtml(item.text) + '</span>' +
          '<button class="icon-btn delete-checklist-item" data-id="' + item.id + '" title="\u0218terge">\u00d7</button>' +
        '</li>'
      ).join('');
      return (
        '<div class="checklist-category">' +
          '<h4 class="checklist-category-label">' + escapeHtml(cat) + '</h4>' +
          '<ul class="checklist">' + rows + '</ul>' +
        '</div>'
      );
    }).join('');

    screen.innerHTML =
      '<div class="checklist-header">' +
        '<span class="checklist-progress">' + checked + ' / ' + checklist.length + ' bifate</span>' +
        '<div class="checklist-header-actions">' +
          '<button class="btn-secondary btn-sm" id="uncheck-all-btn">Debifez\u0103 tot</button>' +
          '<button class="btn-secondary btn-sm" id="delete-checked-btn">\u0218terge bifate</button>' +
        '</div>' +
      '</div>' +
      byCategory +
      '<div class="checklist-add-form">' +
        '<input type="text" id="new-checklist-text"     class="form-input" placeholder="Item nou\u2026">' +
        '<input type="text" id="new-checklist-category" class="form-input" placeholder="Categorie (op\u021bional)">' +
        '<button id="add-checklist-item-btn" class="btn-primary">+ Adaug\u0103</button>' +
      '</div>';

    // Toggle checked
    screen.querySelectorAll('.checklist li').forEach(li => {
      li.addEventListener('click', (e) => {
        if (e.target.closest('.delete-checklist-item')) return;
        const id      = li.dataset.id;
        const newList = (trip.checklist || []).map(c => c.id === id ? Object.assign({}, c, { checked: !c.checked }) : c);
        Storage.updateTrip(trip.id, { checklist: newList });
        renderChecklist();
      });
    });

    // Delete item
    screen.querySelectorAll('.delete-checklist-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newList = (trip.checklist || []).filter(c => c.id !== btn.dataset.id);
        Storage.updateTrip(trip.id, { checklist: newList });
        showToast('Item \u015fters \u2713');
        renderChecklist();
      });
    });

    screen.querySelector('#uncheck-all-btn').addEventListener('click', () => {
      const newList = (trip.checklist || []).map(c => Object.assign({}, c, { checked: false }));
      Storage.updateTrip(trip.id, { checklist: newList });
      renderChecklist();
    });

    screen.querySelector('#delete-checked-btn').addEventListener('click', () => {
      if (!confirm('\u0218tergi toate itemele bifate?')) return;
      const newList = (trip.checklist || []).filter(c => !c.checked);
      Storage.updateTrip(trip.id, { checklist: newList });
      showToast('Items bifate \u015fterse \u2713');
      renderChecklist();
    });

    const addBtn = screen.querySelector('#add-checklist-item-btn');
    addBtn.addEventListener('click', () => {
      const text     = screen.querySelector('#new-checklist-text').value.trim();
      const category = screen.querySelector('#new-checklist-category').value.trim() || 'General';
      if (!text) { screen.querySelector('#new-checklist-text').focus(); return; }
      const newList = [...(trip.checklist || []), { id: Storage.generateId(), text, checked: false, category }];
      Storage.updateTrip(trip.id, { checklist: newList });
      showToast('Item ad\u0103ugat \u2713');
      renderChecklist();
    });

    screen.querySelector('#new-checklist-text').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addBtn.click();
    });
  };

  // ============================================================
  // INIT
  // ============================================================
  updateHeaderChip();
  renderDashboard();
  console.log('Trip Planner initialized.');
});
