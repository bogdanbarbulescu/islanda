document.addEventListener('DOMContentLoaded', () => {
    // --- Înregistrare Service Worker pentru PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker înregistrat cu succes:', registration);
            })
            .catch(error => {
                console.log('Eroare la înregistrarea Service Worker:', error);
            });
    }

    // --- Variabile DOM ---
    const navButtons = document.querySelectorAll('.nav-button');
    const screens = document.querySelectorAll('.screen');
    const headerTitle = document.getElementById('header-title');
    const checklistContainer = document.querySelector('.checklist');
    
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

    // Funcția de navigare între ecrane
    const switchScreen = (targetScreenId, newTitle) => {
        // Obține ecranul activ curent
        const currentActiveScreen = document.querySelector('.screen.active');
        const targetScreen = document.getElementById(targetScreenId);
        
        if (currentActiveScreen === targetScreen) return; // Nu face nimic dacă ecranul e deja activ

        // Animație de ieșire pentru ecranul curent
        if(currentActiveScreen) {
            currentActiveScreen.classList.add('exit-left');
            currentActiveScreen.classList.remove('active');
        }

        // Ascunde toate ecranele după animație
        setTimeout(() => {
            screens.forEach(s => {
                s.classList.remove('active', 'exit-left');
            });
            
            // Afișează noul ecran cu animație de intrare
            if (targetScreen) {
                targetScreen.classList.add('active');
            }
        }, 150); // Jumătate din durata tranziției CSS

        // Actualizează titlul din header
        headerTitle.textContent = newTitle;

        // Actualizează starea activă a butoanelor de navigație
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === targetScreenId);
        });
    };
    
    // Funcția pentru a genera lista de checklist
    const renderChecklist = () => {
        checklistContainer.innerHTML = ''; // Golește lista existentă
        loadCheckedState(); // Încarcă starea din localStorage
        
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

    // Funcția pentru a salva starea bifelor în localStorage
    const saveCheckedState = () => {
        localStorage.setItem('icelandChecklistState', JSON.stringify(checkedState));
    };

    // Funcția pentru a încărca starea bifelor din localStorage
    const loadCheckedState = () => {
        const savedState = localStorage.getItem('icelandChecklistState');
        if (savedState) {
            checkedState = JSON.parse(savedState);
        }
    };

    // --- Evenimente ---

    // Event listener pentru butoanele de navigație
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreenId = button.dataset.screen;
            const newTitle = button.dataset.title;
            switchScreen(targetScreenId, newTitle);
        });
    });

    // Event listener pentru click pe elementele din checklist (delegare de eveniment)
    checklistContainer.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (listItem) {
            const index = listItem.dataset.index;
            listItem.classList.toggle('checked');
            // Actualizează starea
            checkedState[index] = listItem.classList.contains('checked');
            saveCheckedState(); // Salvează noua stare
        }
    });

    // --- Inițializare ---
    renderChecklist(); // Generează checklist-ul la încărcare
});
