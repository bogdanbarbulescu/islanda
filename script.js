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

    // --- BAZA DE DATE PENTRU IMAGINI ---
    const locationImages = {
        'landmannalaugar': [
            'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800',
            'https://images.unsplash.com/photo-1540390769625-2fc3f8b1f5c5?w=800',
            'https://images.unsplash.com/photo-1616518163723-9964213a5191?w=800'
        ],
        'laki-craters': [
            'https://images.unsplash.com/photo-1534279539332-d34a8a142814?w=800',
            'https://images.unsplash.com/photo-1551423997-dd9e5a0a9b52?w=800',
            'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800'
        ],
        'kerlingarfjoll': [
            'https://images.unsplash.com/photo-1617190534649-d8c4234a2d34?w=800',
            'https://images.unsplash.com/photo-1604278361252-227e58308194?w=800',
            'https://images.unsplash.com/photo-1617190534603-d8c4234a2d34?w=800'
        ],
        'axlafoss': [
            'https://images.unsplash.com/photo-1547733994-9e3b51861a43?w=800',
            'https://images.unsplash.com/photo-1569917983435-31398c16781e?w=800',
            'https://images.unsplash.com/photo-1431036101494-69a3621d0b29?w=800'
        ],
        'blafjallafoss': [
            'https://images.unsplash.com/photo-1604789232362-3867562bec98?w=800',
            'https://images.unsplash.com/photo-1558987101-73d49e42914a?w=800',
            'https://images.unsplash.com/photo-1598283721052-a2283833889a?w=800'
        ],
        'maelifell': [
            'https://images.unsplash.com/photo-1633267290933-2336c175852a?w=800',
            'https://images.unsplash.com/photo-1588696632332-5b1a5336e9b7?w=800',
            'https://images.unsplash.com/photo-1588696632332-5b1a5336e9b7?w=800'
        ],
        'raudibotn': [
            'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800',
            'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800',
            'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800'
        ],
        'thakgil': [
            'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=800',
            'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=800',
            'https://images.unsplash.com/photo-1579487785973-74d2ca7abdd5?w=800'
        ],
        'waterfall-hike': [
            'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800',
            'https://images.unsplash.com/photo-1535546204542-5237f20c3957?w=800',
            'https://images.unsplash.com/photo-1547733994-9e3b51861a43?w=800'
        ],
        'langisjor': [
            'https://images.unsplash.com/photo-1628359441744-53746736c244?w=800',
            'https://images.unsplash.com/photo-1628359441744-53746736c244?w=800',
            'https://images.unsplash.com/photo-1628359441744-53746736c244?w=800'
        ],
        'braided-rivers': [
            'https://images.unsplash.com/photo-1553667818-57fb44116c53?w=800',
            'https://images.unsplash.com/photo-1553667818-57fb44116c53?w=800',
            'https://images.unsplash.com/photo-1553667818-57fb44116c53?w=800'
        ]
    };

    // --- Variabile DOM ---
    const navButtons = document.querySelectorAll('.nav-button');
    const screens = document.querySelectorAll('.screen');
    const headerTitle = document.getElementById('header-title');
    const checklistContainer = document.querySelector('.checklist');
    const mapScreen = document.getElementById('map-screen');

    // --- Variabile DOM pentru Modal ---
    const modal = document.getElementById('gallery-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const galleryImage = document.getElementById('gallery-image');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    const galleryCounter = document.getElementById('gallery-counter');

    // --- Variabile de stare pentru Galerie ---
    let currentImages = [];
    let currentImageIndex = 0;

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

    // --- Funcții Navigație Aplicație ---
    const switchScreen = (targetScreenId, newTitle) => {
        const currentActiveScreen = document.querySelector('.screen.active');
        const targetScreen = document.getElementById(targetScreenId);
        
        if (currentActiveScreen === targetScreen) return;

        if(currentActiveScreen) {
            currentActiveScreen.classList.add('exit-left');
            currentActiveScreen.classList.remove('active');
        }

        setTimeout(() => {
            screens.forEach(s => {
                s.classList.remove('active', 'exit-left');
            });
            
            if (targetScreen) {
                targetScreen.classList.add('active');
            }
        }, 150);

        headerTitle.textContent = newTitle;

        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.screen === targetScreenId);
        });
    };
    
    // --- Funcții Checklist ---
    const renderChecklist = () => {
        checklistContainer.innerHTML = '';
        loadCheckedState();
        
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
        if (savedState) {
            checkedState = JSON.parse(savedState);
        }
    };

    // --- Funcții pentru Galerie ---
    const showImage = (index) => {
        galleryImage.src = currentImages[index];
        galleryCounter.textContent = `${index + 1} / ${currentImages.length}`;
        currentImageIndex = index;
    };

    const nextImage = () => {
        const newIndex = (currentImageIndex + 1) % currentImages.length;
        showImage(newIndex);
    };

    const prevImage = () => {
        const newIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        showImage(newIndex);
    };

    const openModal = (locationId) => {
        currentImages = locationImages[locationId] || [];
        if (currentImages.length === 0) return;
        
        showImage(0);
        modal.classList.add('active');
    };

    const closeModal = () => {
        modal.classList.remove('active');
    };

    // --- Evenimente ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetScreenId = button.dataset.screen;
            const newTitle = button.dataset.title;
            switchScreen(targetScreenId, newTitle);
        });
    });

    checklistContainer.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');
        if (listItem) {
            const index = listItem.dataset.index;
            listItem.classList.toggle('checked');
            checkedState[index] = listItem.classList.contains('checked');
            saveCheckedState();
        }
    });

    mapScreen.addEventListener('click', (e) => {
        const locationCard = e.target.closest('.location-card[data-location-id]');
        if (locationCard) {
            const locationId = locationCard.dataset.locationId;
            openModal(locationId);
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    document.addEventListener('keydown', (e) => {
        if (modal.classList.contains('active')) {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeModal();
        }
    });

    // --- Inițializare ---
    renderChecklist();
});
