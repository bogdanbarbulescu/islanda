document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM complet încărcat și parsat.");

    // --- Înregistrare Service Worker pentru PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker înregistrat cu succes:', registration);
            })
            .catch(error => {
                console.error('Eroare la înregistrarea Service Worker:', error);
            });
    }

    // --- Variabile DOM Globale ---
    const navButtons = document.querySelectorAll('.nav-button');
    const screens = document.querySelectorAll('.screen');
    const headerTitle = document.getElementById('header-title');
    
    // Checklist
    const checklistContainer = document.querySelector('#checklist-screen .checklist'); 
    
    // Modal Locație
    const locationModal = document.getElementById('location-modal');
    const modalLocationName = document.getElementById('modal-location-name');
    const modalLocationImage = document.getElementById('modal-location-image');
    const modalLocationDescription = document.getElementById('modal-location-description');
    const modalMapIframe = document.getElementById('modal-map-iframe');
    const modalCloseButton = document.querySelector('.modal-close-button');
    const locationCardsContainer = document.querySelector('#map-screen .location-list');


    // --- Date pentru Checklist ---
    const checklistItems = [
        'Bocanci de munte impermeabili', 'Geacă de ploaie și vânt', 'Pantaloni impermeabili',
        'Polar / Mid-layer', 'Haine termice (base layer)', 'Căciulă, mănuși, fular',
        'Aparat foto + obiective', 'Trepied', 'Baterii extra & carduri memorie',
        'Dronă (dacă e cazul)', 'Ochelari de soare', 'Costum de baie (pt. izvoare)',
        'Prosop cu uscare rapidă', 'Trusă de prim ajutor', 'Baterie externă (Power Bank)',
        'Frontală / Lanternă'
    ];
    let checkedState = {};

    // --- FUNCȚII ---

    // Funcția de navigare între ecrane
    const switchScreen = (targetScreenId, newTitle) => {
        const currentActiveScreen = document.querySelector('.screen.active');
        const targetScreen = document.getElementById(targetScreenId);
        
        if (currentActiveScreen === targetScreen) return;

        if(currentActiveScreen) {
            currentActiveScreen.classList.add('exit-left');
            setTimeout(() => currentActiveScreen.classList.remove('active'), 0);
        }

        if (targetScreen) {
            setTimeout(() => {
                screens.forEach(s => {
                    if (s.id !== targetScreenId) s.classList.remove('active', 'exit-left');
                });
                targetScreen.classList.remove('exit-left');
                targetScreen.classList.add('active');
            }, 150); 
        }
        headerTitle.textContent = newTitle;
        navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === targetScreenId));
    };
    
    // Funcții pentru Checklist
    const renderChecklist = () => {
        if (!checklistContainer) return;
        checklistContainer.innerHTML = '';
        loadCheckedState();
        if (!checklistItems || checklistItems.length === 0) {
            checklistContainer.innerHTML = "<li>Niciun element în checklist.</li>";
            return;
        }
        checklistItems.forEach((item, index) => {
            const isChecked = checkedState[index] || false;
            const li = document.createElement('li');
            li.dataset.index = index;
            li.className = isChecked ? 'checked' : '';
            li.innerHTML = `
                <div class="checkbox">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <span>${item}</span>
            `;
            checklistContainer.appendChild(li);
        });
    };

    const saveCheckedState = () => {
        localStorage.setItem('icelandChecklistState', JSON.stringify(checkedState));
    };

    const loadCheckedState = () => {
        const savedState = localStorage.getItem('icelandChecklistState');
        checkedState = savedState ? JSON.parse(savedState) : {};
    };

    // Funcții pentru Modal Locație
    const openLocationModal = (cardElement) => {
        if (!locationModal || !cardElement) return;

        const name = cardElement.dataset.locationName;
        const image = cardElement.dataset.locationImage;
        const description = cardElement.dataset.locationDescription;
        const mapUrl = cardElement.dataset.mapEmbedUrl;

        modalLocationName.textContent = name || "Detalii Locație";
        modalLocationImage.src = image || "";
        modalLocationImage.alt = name || "Imagine Locație";
        modalLocationDescription.textContent = description || "Nicio descriere disponibilă.";
        modalMapIframe.src = mapUrl || ""; // Important: Setează sursa iframe-ului

        locationModal.classList.add('active');
    };

    const closeLocationModal = () => {
        if (!locationModal) return;
        locationModal.classList.remove('active');
        // Opțional: Oprește încărcarea iframe-ului pentru a economisi resurse
        modalMapIframe.src = ""; 
    };

    // --- EVENIMENTE ---

    // Navigație principală
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchScreen(button.dataset.screen, button.dataset.title);
        });
    });

    // Checklist
    if (checklistContainer) {
        checklistContainer.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (listItem) {
                const index = listItem.dataset.index;
                listItem.classList.toggle('checked');
                checkedState[index] = listItem.classList.contains('checked');
                saveCheckedState();
            }
        });
    }

    // Modal Locație - Deschidere (delegare de eveniment pe containerul listei)
    if (locationCardsContainer) {
        locationCardsContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.location-card');
            // Verificăm dacă click-ul a fost pe card sau pe butonul din interiorul cardului
            if (card && (e.target.classList.contains('btn-details') || e.target.closest('.location-card-content'))) {
                openLocationModal(card);
            } else if (card) { // Dacă s-a dat click direct pe card (nu pe buton)
                 openLocationModal(card);
            }
        });
    }

    // Modal Locație - Închidere
    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', closeLocationModal);
    }
    if (locationModal) {
        // Închide modalul dacă se dă click pe overlay (în afara conținutului modalului)
        locationModal.addEventListener('click', (e) => {
            if (e.target === locationModal) { // Verifică dacă click-ul a fost direct pe overlay
                closeLocationModal();
            }
        });
    }
    

    // --- INIȚIALIZARE ---
    renderChecklist(); 
    console.log("Aplicația a fost inițializată.");
});