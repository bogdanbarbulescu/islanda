document.addEventListener('DOMContentLoaded', () => {
    // --- Înregistrare Service Worker pentru PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Error', err));
    }

    // --- BAZA DE DATE PENTRU IMAGINI ---
    const locationImages = {
        'landmannalaugar': ['https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800', 'https://images.unsplash.com/photo-1540390769625-2fc3f8b1f5c5?w=800', 'https://images.unsplash.com/photo-1616518163723-9964213a5191?w=800'],
        'laki-craters': ['https://images.unsplash.com/photo-1534279539332-d34a8a142814?w=800', 'https://images.unsplash.com/photo-1632369991393-9671f7536128?w=800', 'https://images.unsplash.com/photo-1551423997-dd9e5a0a9b52?w=800'],
        'kerlingarfjoll': ['https://images.unsplash.com/photo-1617190534649-d8c4234a2d34?w=800', 'https://images.unsplash.com/photo-1617190534649-d8c4234a2d34?w=800', 'https://images.unsplash.com/photo-1617190534649-d8c4234a2d34?w=800'],
        // Adaugă aici restul locațiilor cu array-urile lor de imagini
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
    const checklistItems = [ 'Bocanci de munte impermeabili', /* ... restul listei ... */ ];
    let checkedState = {};

    // --- Funcții Navigație Aplicație ---
    const switchScreen = (targetScreenId, newTitle) => { /* ... codul existent ... */ };
    
    // --- Funcții Checklist ---
    const renderChecklist = () => { /* ... codul existent ... */ };
    const saveCheckedState = () => { /* ... codul existent ... */ };
    const loadCheckedState = () => { /* ... codul existent ... */ };

    // --- FUNCȚII NOI PENTRU GALERIE ---
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
        if (currentImages.length === 0) return; // Nu deschide modala dacă nu există imagini
        
        showImage(0);
        modal.classList.add('active');
    };

    const closeModal = () => {
        modal.classList.remove('active');
    };

    // --- Evenimente ---
    navButtons.forEach(button => { /* ... codul existent ... */ });
    checklistContainer.addEventListener('click', (e) => { /* ... codul existent ... */ });

    // NOU: Event listener pentru click pe locații (delegare)
    mapScreen.addEventListener('click', (e) => {
        const locationCard = e.target.closest('.location-card[data-location-id]');
        if (locationCard) {
            const locationId = locationCard.dataset.locationId;
            openModal(locationId);
        }
    });

    // NOU: Event listeners pentru modal
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { // Închide doar dacă se dă click pe fundal
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
