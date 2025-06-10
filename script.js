document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM complet încărcat și parsat.");

    // --- Înregistrare Service Worker pentru PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js') // Asigură-te că calea este corectă pentru GitHub Pages dacă e într-un subfolder
            .then(registration => {
                console.log('Service Worker înregistrat cu succes:', registration);
            })
            .catch(error => {
                console.error('Eroare la înregistrarea Service Worker:', error);
            });
    }

    // --- Variabile DOM ---
    const navButtons = document.querySelectorAll('.nav-button');
    const screens = document.querySelectorAll('.screen');
    const headerTitle = document.getElementById('header-title');
    
    // MODIFICAT: Selector mai specific și logare
    const checklistContainer = document.querySelector('#checklist-screen .checklist'); 
    console.log("Selector pentru checklistContainer:", checklistContainer ? "Găsit" : "NU A FOST GĂSIT!");
    if (!checklistContainer) {
        console.error("Elementul <ul class='checklist'> din interiorul #checklist-screen nu a fost găsit. Verifică HTML-ul.");
    }
    
    // --- Date pentru Checklist ---
    const checklistItems = [
        'Bocanci de munte impermeabili',
        'Geacă de ploaie și vânt',
        'Pantaloni impermeabili',
        'Polar / Mid-layer',
        'Haine termice (base layer)',
        'Căciulă, mănuși, fular',
        'Aparat foto + obiective',
        'Trepied',
        'Baterii extra & carduri memorie',
        'Dronă (dacă e cazul)',
        'Ochelari de soare',
        'Costum de baie (pt. izvoare)',
        'Prosop cu uscare rapidă',
        'Trusă de prim ajutor',
        'Baterie externă (Power Bank)',
        'Frontală / Lanternă'
    ];
    let checkedState = {};

    // --- Funcții ---

    const switchScreen = (targetScreenId, newTitle) => {
        console.log(`Comutare către ecran: ${targetScreenId}, Titlu: ${newTitle}`);
        const currentActiveScreen = document.querySelector('.screen.active');
        const targetScreen = document.getElementById(targetScreenId);
        
        if (currentActiveScreen === targetScreen) {
            console.log("Ecranul este deja activ.");
            return;
        }

        if(currentActiveScreen) {
            currentActiveScreen.classList.add('exit-left');
            // Eliminăm 'active' după o mică întârziere pentru a permite animației de ieșire să ruleze
            // Dar pentru a evita conflicte, o eliminăm mai întâi din vizibilitate
            setTimeout(() => {
                currentActiveScreen.classList.remove('active');
            }, 0); // Sau o valoare mică dacă animația de ieșire depinde de 'active'
        }

        // Ascunde toate ecranele (ca fallback, deși animația ar trebui să gestioneze asta)
        // screens.forEach(s => s.classList.remove('active', 'exit-left')); // Comentat temporar pentru a vedea efectul

        if (targetScreen) {
            // Adaugă 'active' după o mică întârziere pentru a permite animației de intrare să fie vizibilă
            setTimeout(() => {
                // Asigură-te că toate celelalte ecrane nu sunt active
                screens.forEach(s => {
                    if (s.id !== targetScreenId) {
                        s.classList.remove('active', 'exit-left');
                    }
                });
                targetScreen.classList.remove('exit-left'); // În caz că a rămas de la o tranziție anterioară
                targetScreen.classList.add('active');
                console.log(`Ecranul ${targetScreenId} este acum activ.`);
            }, 150); // Sincronizat cu durata tranziției CSS
        } else {
            console.error(`Ecranul țintă cu ID-ul '${targetScreenId}' nu a fost găsit.`);
        }

        headerTitle.textContent = newTitle;

        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === targetScreenId);
        });
    };
    
    const renderChecklist = () => {
        console.log("--- Început renderChecklist ---");

        if (!checklistContainer) {
            console.error("renderChecklist: checklistContainer este null. Funcția se oprește.");
            return;
        }
        console.log("renderChecklist: checklistContainer este valid.");

        checklistContainer.innerHTML = ''; // Golește lista existentă
        console.log("renderChecklist: Lista a fost golită.");
        
        loadCheckedState(); // Încarcă starea din localStorage
        console.log("renderChecklist: Starea bifelor a fost încărcată:", checkedState);
        
        if (!checklistItems || checklistItems.length === 0) {
            console.warn("renderChecklist: Array-ul checklistItems este gol sau nedefinit.");
            checklistContainer.innerHTML = "<li>Niciun element în checklist.</li>";
            return;
        }
        console.log("renderChecklist: Se vor randa următoarele elemente:", checklistItems);

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
        console.log("--- Sfârșit renderChecklist ---");
    };

    const saveCheckedState = () => {
        localStorage.setItem('icelandChecklistState', JSON.stringify(checkedState));
        console.log("Starea bifelor a fost salvată în localStorage.");
    };

    const loadCheckedState = () => {
        const savedState = localStorage.getItem('icelandChecklistState');
        if (savedState) {
            checkedState = JSON.parse(savedState);
        } else {
            checkedState = {}; // Asigură-te că este un obiect gol dacă nu există nimic salvat
        }
    };

    // --- Evenimente ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreenId = button.dataset.screen;
            const newTitle = button.dataset.title;
            switchScreen(targetScreenId, newTitle);
        });
    });

    if (checklistContainer) { // Adaugă event listener doar dacă containerul există
        checklistContainer.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (listItem) {
                const index = listItem.dataset.index;
                listItem.classList.toggle('checked');
                checkedState[index] = listItem.classList.contains('checked');
                saveCheckedState();
            }
        });
    } else {
        console.warn("Event listener pentru checklist nu a fost adăugat deoarece checklistContainer este null.");
    }

    // --- Inițializare ---
    console.log("Se apelează renderChecklist() la inițializare...");
    renderChecklist(); 
});
