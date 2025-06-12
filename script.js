document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM complet încărcat și parsat.");

    // --- Înregistrare Service Worker pentru PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js') // Asigură-te că calea este corectă
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
    
    // Itinerar
    const itineraryScreenContainer = document.getElementById('itinerary-screen');

    // Modal Locație
    const locationModal = document.getElementById('location-modal');
    const modalLocationName = document.getElementById('modal-location-name');
    // Carusel Modal
    const modalCarouselSlides = document.querySelector('#modal-carousel .carousel-slides');
    const modalCarouselDotsContainer = document.querySelector('#modal-carousel .carousel-dots');
    const modalCarouselPrevButton = document.querySelector('#modal-carousel .carousel-button.prev');
    const modalCarouselNextButton = document.querySelector('#modal-carousel .carousel-button.next');
    // Alte info modal
    const modalLocationDifficulty = document.getElementById('modal-location-difficulty');
    const modalLocationGmapsLink = document.getElementById('modal-location-gmaps-link'); // Actualizat
    const modalLocationDescription = document.getElementById('modal-location-description');
    const modalLocationTips = document.getElementById('modal-location-tips');
    const modalMapIframe = document.getElementById('modal-map-iframe');
    const modalCloseButton = document.querySelector('.modal-close-button');
    const locationCardsContainer = document.querySelector('#map-screen .location-list');

    let currentSlideIndex = 0;
    let currentSlides = [];


    // --- DATE ---

    // Date pentru Checklist
    const checklistItems = [
        'Bocanci de munte impermeabili', 'Geacă de ploaie și vânt', 'Pantaloni impermeabili',
        'Polar / Mid-layer', 'Haine termice (base layer)', 'Căciulă, mănuși, fular',
        'Aparat foto + obiective', 'Trepied', 'Baterii extra & carduri memorie',
        'Dronă (dacă e cazul)', 'Ochelari de soare', 'Costum de baie (pt. izvoare)',
        'Prosop cu uscare rapidă', 'Trusă de prim ajutor', 'Baterie externă (Power Bank)',
        'Frontală / Lanternă'
    ];
    let checkedState = {};

    // Date pentru Itinerar (COMPLETEAZĂ CU DATELE TALE!)
    const itineraryData = [
        {
            date: "19.08", dayName: "Marți", events: [
                { time: "15:50 - 18:30", description: "Budapest - Keflavik", type: "flight", icon: "✈️" }
            ]
        },
        {
            date: "20.08", dayName: "Miercuri", events: [
                { time: "08:00", description: "Pickup car - CampEasy", type: "car", icon: "🚗" },
                { time: "10:00", description: "Bonus / Kronan shopping (Selfoss)", type: "shopping", icon: "🛍️", locationRef: "Selfoss" },
                { time: "12:00", description: "Skogafoss Waterfall hike", type: "hike", icon: "🏞️", locationRef: "Skogafoss" },
                { time: "22:00", description: "Thakgil campsite", type: "campsite", icon: "🏕️", locationRef: "Thakgil" }
            ]
        },
        {
            date: "21.08", dayName: "Joi", events: [
                { time: "05:00", description: "Thakgil hike + campsite", type: "hike", icon: "🏞️", locationRef: "Thakgil" }
            ]
        },
        // --- ADAUGĂ RESTUL ZILELOR AICI ---
        // Exemplu pentru o zi ulterioară:
         {
            date: "22.08", dayName: "Vineri", events: [
                { time: "06:00", description: "Fjaðrárgljúfur", type: "hike", icon: "🏞️", locationRef: "Fjaðrárgljúfur" },
                { time: "10:00", description: "Entrance on F206 - Fagrifoss waterfall + Laki Craters sunset + sunrise", type: "drive", icon: "🚙", locationRef: "Laki Craters (Lakagígar)" }
            ]
        },
        {
            date: "23.08", dayName: "Sâmbătă", events: [
                { time: "05:00", description: "Laki sunrise", type: "photo", icon: "🌅", locationRef: "Laki Craters (Lakagígar)" },
                { time: "10:00", description: "Entrance F232 - Blafjallafoss - F210 Maelifell (no river crossing on F210 this route)", type: "drive", icon: "🚙", locationRef: "Maelifell" },
                { time: "20:00", description: "Axlafoss (return the same way, F210, F232, 208, 210, F210) - no river crossing this way)", type: "campsite", icon: "🏕️", locationRef: "Axlafoss" }
            ]
        },
        {
            date: "24.08", dayName: "Duminică", events: [
                { time: "05:00", description: "Axlafoss + Rauðibotn (F210 until Holmsa river - no crossing attempt) - parking lot at the beginning of Rauðibotn hike)", type: "hike", icon: "🏞️", locationRef: "Rauðibotn" },
                { time: "15:00", description: "Huldufoss (F208 South)", type: "hike", icon: "🏞️", locationRef: "Huldufoss" },
                { time: "17:00", description: "Ofaerufoss", type: "hike", icon: "🏞️", locationRef: "Ofaerufoss" },
                { time: "20:00", description: "Langisjor (campsite + sunset + sunrise)", type: "campsite", icon: "🏕️", locationRef: "Langisjor" }
            ]
        },
        {
            date: "25.08", dayName: "Luni", events: [
                { time: "05:00", description: "Langisjor", type: "photo", icon: "🌅", locationRef: "Langisjor" },
                { time: "08:00", description: "2-3h rest", type: "rest", icon: "😴" },
                { time: "11:00", description: "F208 South towards Landmannalaugar", type: "drive", icon: "🚙", locationRef: "Landmannalaugar" },
                { time: "22:00", description: "Rest campsite Landmannalaugar", type: "campsite", icon: "🏕️", locationRef: "Landmannalaugar" }
            ]
        },
        {
            date: "26.08", dayName: "Marți", events: [
                 { time: "Toată ziua", description: "Landmannalaugar (explorare, drumeții)", type: "hike", icon: "🏞️", locationRef: "Landmannalaugar" }
            ]
        },
        {
            date: "27.08", dayName: "Miercuri", events: [
                { time: "10:00", description: "Sigöldugljúfur", type: "hike", icon: "🏞️", locationRef: "Sigöldugljúfur" },
                { time: "14:00", description: "Haifoss (until after sunset)", type: "photo", icon: "🌅", locationRef: "Haifoss" },
                { time: "23:00", description: "Þjórsárdalur Camping Ground / Camping Ground Ferðaþjónustan Úthlíð", type: "campsite", icon: "🏕️" }
            ]
        },
        {
            date: "28.08", dayName: "Joi", events: [
                { time: "05:00", description: "Burarafoss", type: "photo", icon: "🏞️", locationRef: "Burarafoss" }, // Presupun că e Bruarfoss
                { time: "10:00", description: "Secret Lagoon", type: "relax", icon: "♨️" },
                { time: "12:00", description: "Camping Ground Ferðaþjónustan Úthlíð (clothes wash and rest)", type: "rest", icon: "🧼" },
                { time: "16:00", description: "Towards Hveravellir via F35", type: "drive", icon: "🚙", locationRef: "Hveravellir" },
                { time: "19:00", description: "Hveravellir (sunset, campsite, sunrise)", type: "campsite", icon: "🏕️", locationRef: "Hveravellir" }
            ]
        },
        {
            date: "29.08", dayName: "Vineri", events: [
                { time: "05:30", description: "Hveravellir sunrise", type: "photo", icon: "🌅", locationRef: "Hveravellir" },
                { time: "14:00", description: "Kerlingarfjoll (sunset, campsite, sunrise)", type: "campsite", icon: "🏕️", locationRef: "Kerlingarfjoll" }
            ]
        },
        {
            date: "30.08", dayName: "Sâmbătă", events: [
                { time: "05:30", description: "Kerlingarfjoll (sunrise)", type: "photo", icon: "🌅", locationRef: "Kerlingarfjoll" },
                { time: "09:00", description: "Rest campsite Kerlingarfjoll", type: "rest", icon: "😴", locationRef: "Kerlingarfjoll" },
                { time: "18:00", description: "Kerlingarfjoll (sunset)", type: "photo", icon: "🌅", locationRef: "Kerlingarfjoll" }
            ]
        },
        {
            date: "31.08", dayName: "Duminică", events: [
                { time: "05:30", description: "Kerlingarfjoll sunrise", type: "photo", icon: "🌅", locationRef: "Kerlingarfjoll" },
                { time: "11:00", description: "Leaving Kerlingarfjoll towards Selfoss town", type: "drive", icon: "🚙" },
                { time: "22:00", description: "Stokkseyri campsite", type: "campsite", icon: "🏕️" }
            ]
        },
        {
            date: "01.09", dayName: "Luni", events: [
                { time: "Dimineața", description: "Braided rivers (drone)", type: "drone", icon: "🚁" },
                { time: "22:00", description: "Gata free campsite", type: "campsite", icon: "🏕️" }
            ]
        },
        {
            date: "02.09", dayName: "Marți", events: [
                { time: "Dimineața", description: "??? (Activități neplanificate)", type: "unknown", icon: "❓" },
                { time: "13:00-14:00", description: "Campeasy return", type: "car", icon: "🚗" },
                { time: "19:00", description: "Flight to Budapest", type: "flight", icon: "✈️" }
            ]
        }
    ];


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
        if (!checklistContainer) {
            console.warn("Checklist container not found.");
            return;
        }
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

    // Funcții pentru Itinerar
    const renderItinerary = () => {
        if (!itineraryScreenContainer) {
            console.warn("Itinerary screen container not found.");
            return;
        }
        itineraryScreenContainer.innerHTML = ''; 

        if (!itineraryData || itineraryData.length === 0) {
            itineraryScreenContainer.innerHTML = "<p>Niciun itinerar disponibil.</p>";
            return;
        }

        itineraryData.forEach(day => {
            const dayCard = document.createElement('div');
            dayCard.className = 'itinerary-day-card';

            let dayHeaderHTML = `<h2>${day.date}`;
            if (day.dayName) {
                dayHeaderHTML += ` <span class="day-name">${day.dayName}</span>`;
            }
            dayHeaderHTML += `</h2>`;
            
            dayCard.innerHTML = `<div class="itinerary-day-header">${dayHeaderHTML}</div>`;

            const eventList = document.createElement('ul');
            eventList.className = 'itinerary-event-list';

            if (day.events && day.events.length > 0) {
                day.events.forEach(event => {
                    const eventItem = document.createElement('li');
                    let eventHTML = `<span class="event-time">${event.time}</span>
                                     <span class="event-description">${event.description}</span>`;
                    if (event.icon) {
                        eventHTML += `<span class="event-type-icon">${event.icon}</span>`;
                    }
                    eventItem.innerHTML = eventHTML;

                    if (event.locationRef) {
                        eventItem.style.cursor = "pointer";
                        eventItem.title = `Vezi detalii pentru ${event.locationRef}`; // Tooltip
                        eventItem.addEventListener('click', () => {
                            const targetLocationCard = document.querySelector(`.location-card[data-location-name*="${event.locationRef}"]`);
                            if (targetLocationCard) {
                                openLocationModal(targetLocationCard);
                            } else {
                                console.warn(`Nu s-a găsit un card de locație pentru ref: ${event.locationRef}. Încercare cu potrivire parțială a numelui.`);
                                // Încercare de potrivire mai flexibilă
                                const allLocationCards = document.querySelectorAll('.location-card');
                                let foundCard = null;
                                for(let card of allLocationCards){
                                    if(card.dataset.locationName && card.dataset.locationName.toLowerCase().includes(event.locationRef.toLowerCase())){
                                        foundCard = card;
                                        break;
                                    }
                                }
                                if(foundCard){
                                    openLocationModal(foundCard);
                                } else {
                                     console.error(`Niciun card de locație găsit pentru: ${event.locationRef}`);
                                }
                            }
                        });
                    }
                    eventList.appendChild(eventItem);
                });
            } else {
                eventList.innerHTML = "<li>Nicio activitate planificată pentru această zi.</li>";
            }
            dayCard.appendChild(eventList);
            itineraryScreenContainer.appendChild(dayCard);
        });
    };

    // Funcții pentru Carusel Foto
    const setupCarousel = (imageUrls) => {
        if (!modalCarouselSlides || !modalCarouselDotsContainer) return;
        
        modalCarouselSlides.innerHTML = '';
        modalCarouselDotsContainer.innerHTML = '';
        currentSlides = []; 
        currentSlideIndex = 0;

        if (!imageUrls || imageUrls.length === 0) {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            // Asigură-te că ai o imagine placeholder.png în folderul images sau schimbă calea
            slide.innerHTML = `<img src="images/placeholder.png" alt="Nicio imagine disponibilă">`; 
            modalCarouselSlides.appendChild(slide);
            currentSlides.push(slide);
            updateCarousel();
            return;
        }
        
        imageUrls.forEach((url, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${url}" alt="Imagine locație ${index + 1}" loading="lazy">`;
            modalCarouselSlides.appendChild(slide);
            currentSlides.push(slide);

            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            dot.dataset.index = index;
            dot.addEventListener('click', () => goToSlide(index));
            modalCarouselDotsContainer.appendChild(dot);
        });
        updateCarousel();
    };

    const updateCarousel = () => {
        if (!currentSlides || currentSlides.length === 0) return;
        modalCarouselSlides.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        
        document.querySelectorAll('#modal-carousel .carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlideIndex);
        });

        modalCarouselPrevButton.style.display = currentSlides.length > 1 ? 'flex' : 'none';
        modalCarouselNextButton.style.display = currentSlides.length > 1 ? 'flex' : 'none';
        modalCarouselDotsContainer.style.display = currentSlides.length > 1 ? 'block' : 'none';
    };

    const nextSlide = () => {
        if (!currentSlides || currentSlides.length === 0) return;
        currentSlideIndex = (currentSlideIndex + 1) % currentSlides.length;
        updateCarousel();
    };

    const prevSlide = () => {
        if (!currentSlides || currentSlides.length === 0) return;
        currentSlideIndex = (currentSlideIndex - 1 + currentSlides.length) % currentSlides.length;
        updateCarousel();
    };
    
    const goToSlide = (index) => {
        currentSlideIndex = index;
        updateCarousel();
    };


    // Funcții pentru Modal Locație
    const openLocationModal = (cardElement) => {
        if (!locationModal || !cardElement) return;

        const name = cardElement.dataset.locationName;
        let imagesJson = cardElement.dataset.locationImages;
        let imageUrls = [];
        try {
            if (imagesJson) {
                imageUrls = JSON.parse(imagesJson);
            }
        } catch (e) {
            console.error("Eroare la parsarea JSON pentru imagini:", e, ". Folosind imaginea principală ca fallback.");
            const mainImageSrc = cardElement.querySelector('img')?.src;
            if (mainImageSrc) imageUrls = [mainImageSrc];
        }
        
        const description = cardElement.dataset.locationDescription;
        const mapUrl = cardElement.dataset.mapEmbedUrl; 
        const difficulty = cardElement.dataset.locationDifficulty;
        const tips = cardElement.dataset.locationTips;
        const coordinates = cardElement.dataset.locationCoordinates; 

        modalLocationName.textContent = name || "Detalii Locație";
        
        setupCarousel(imageUrls); 

        modalLocationDescription.textContent = description || "Nicio descriere disponibilă.";
        
        if (modalMapIframe) {
            modalMapIframe.src = mapUrl || ""; 
        } else {
            console.warn("Elementul modalMapIframe nu a fost găsit.");
        }
        
        modalLocationDifficulty.textContent = difficulty || "N/A";
        modalLocationTips.textContent = tips || "N/A";
        
        if (coordinates && modalLocationGmapsLink) {
            const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
            modalLocationGmapsLink.href = gmapsLink;
            modalLocationGmapsLink.style.display = 'inline'; 
        } else if (modalLocationGmapsLink) {
            modalLocationGmapsLink.style.display = 'none'; 
        }

        locationModal.classList.add('active');
    };

    const closeLocationModal = () => {
        if (!locationModal) return;
        locationModal.classList.remove('active');
        if (modalMapIframe) modalMapIframe.src = ""; 
        if (modalCarouselSlides) modalCarouselSlides.innerHTML = ''; 
        if (modalCarouselDotsContainer) modalCarouselDotsContainer.innerHTML = '';
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

    // Modal Locație - Deschidere
    if (locationCardsContainer) {
        locationCardsContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.location-card');
            if (card) { 
                openLocationModal(card);
            }
        });
    }

    // Modal Locație - Închidere
    if (modalCloseButton) modalCloseButton.addEventListener('click', closeLocationModal);
    if (locationModal) {
        locationModal.addEventListener('click', (e) => {
            if (e.target === locationModal) closeLocationModal();
        });
    }

    // Carusel Modal - Butoane
    if(modalCarouselPrevButton) modalCarouselPrevButton.addEventListener('click', prevSlide);
    if(modalCarouselNextButton) modalCarouselNextButton.addEventListener('click', nextSlide);
    

    // --- INIȚIALIZARE ---
    renderChecklist(); 
    renderItinerary(); 
    console.log("Aplicația a fost inițializată.");
});