'use strict';

const Storage = (() => {
  const KEYS = {
    TRIPS: 'tripPlanner_trips',
    ACTIVE_ID: 'tripPlanner_activeTripId'
  };

  const generateId = () => {
    try { return crypto.randomUUID(); }
    catch (e) { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
  };

  const DEFAULT_TRIP = {
    id: 'iceland-2025',
    name: 'Aventura Islanda 2025',
    startDate: '2025-08-19',
    endDate: '2025-09-02',
    travelers: 2,
    vehicle: {
      name: 'MONSTER-ul',
      description: 'Mercedes Sprinter 4x4 modificat. Căruța noastră.',
      imageUrl: 'images/monster.png'
    },
    meta: [
      { id: 'm1', icon: '📅', label: 'Perioada', value: '2 Săpt.', sub: 'Aug-Sep 2025' },
      { id: 'm2', icon: '🌋', label: 'Aventură', value: 'MAXIM', sub: 'Nivel epic' },
      { id: 'm3', icon: '📸', label: 'Foto', value: 'MAXIM+', sub: 'Pregătiți cardurile' }
    ],
    budget: [
      { id: 'b1', icon: '✈️', label: 'Bilete de Avion', amount: 500, currency: '€' },
      { id: 'b2', icon: '🚐', label: 'Închiriere MONSTER', amount: 935, currency: '€' },
      { id: 'b3', icon: '⛽', label: 'Motorină "Monster"', amount: 150, currency: '€' },
      { id: 'b4', icon: '🏕️', label: 'Camping', amount: 100, currency: '€' },
      { id: 'b5', icon: '🍞', label: 'Mâncare', amount: 150, currency: '€' }
    ],
    locations: [
      {
        id: 'loc1',
        name: 'Landmannalaugar',
        imageUrls: ['images/landmannalaugar1.jpg', 'images/landmannalaugar2.jpg', 'images/landmannalaugar3.jpg'],
        description: 'Inima colorată a Islandei. Munți de riolit, cratere vulcanice, lacuri glaciare și izvoare termale. Un paradis pentru fotografi și aventurieri.',
        difficulty: 'Drumeție Medie / Off-road',
        tips: 'Lumină excelentă la apus. Necesită bocanci buni.',
        coordinates: '63.9909,-19.0629',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54019.50189958002!2d-19.091030648632808!3d63.989999999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48d11459933170c7%3A0x81270a5e7029903e!2sLandmannalaugar!5e0!3m2!1sen!2sro!4v1678886400000!5m2!1sen!2sro'
      },
      {
        id: 'loc2',
        name: 'Laki Craters (Lakagígar)',
        imageUrls: ['images/laki_craters.jpeg', 'images/laki_craters2.jpg'],
        description: 'Un peisaj apocaliptic și magnific. O înșiruire de peste 130 de cratere formate într-o erupție masivă. Vom explora zona și canioanele din apropiere.',
        difficulty: 'Off-road / Drumeție Ușoară',
        tips: 'Ideal pentru fotografie panoramică. Atenție la vânt.',
        coordinates: '64.0667,-18.2333',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d86206.00100000001!2d-18.299999999999997!3d64.06666699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48d05b5a00000001%3A0x9a5c000000000000!2sLakag%C3%ADgar!5e0!3m2!1sen!2sro!4v1678886500000!5m2!1sen!2sro'
      }
    ],
    itinerary: [
      { id: 'day1', date: '19.08', dayName: 'Marți', events: [
        { id: 'e1', time: '15:50 - 18:30', description: 'Budapest - Keflavik', icon: '✈️', locationRef: '' }
      ]},
      { id: 'day2', date: '20.08', dayName: 'Miercuri', events: [
        { id: 'e2', time: '08:00', description: 'Pickup car - CampEasy', icon: '🚗', locationRef: '' },
        { id: 'e3', time: '10:00', description: 'Bonus / Kronan shopping (Selfoss)', icon: '🛍️', locationRef: '' },
        { id: 'e4', time: '12:00', description: 'Skogafoss Waterfall hike', icon: '🏞️', locationRef: '' },
        { id: 'e5', time: '22:00', description: 'Thakgil campsite', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day3', date: '21.08', dayName: 'Joi', events: [
        { id: 'e6', time: '05:00', description: 'Thakgil hike + campsite', icon: '🏞️', locationRef: '' }
      ]},
      { id: 'day4', date: '22.08', dayName: 'Vineri', events: [
        { id: 'e7', time: '06:00', description: 'Fjaðrárgljúfur', icon: '🏞️', locationRef: '' },
        { id: 'e8', time: '10:00', description: 'Entrance on F206 - Fagrifoss waterfall + Laki Craters sunset + sunrise', icon: '🚙', locationRef: 'Laki Craters (Lakagígar)' }
      ]},
      { id: 'day5', date: '23.08', dayName: 'Sâmbătă', events: [
        { id: 'e9', time: '05:00', description: 'Laki sunrise', icon: '🌅', locationRef: 'Laki Craters (Lakagígar)' },
        { id: 'e10', time: '10:00', description: 'Entrance F232 - Blafjallafoss - F210 Maelifell (no river crossing on F210 this route)', icon: '🚙', locationRef: '' },
        { id: 'e11', time: '20:00', description: 'Axlafoss (return the same way, F210, F232, 208, 210, F210) - no river crossing this way', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day6', date: '24.08', dayName: 'Duminică', events: [
        { id: 'e12', time: '05:00', description: 'Axlafoss + Rauðibotn (F210 until Holmsa river - no crossing attempt)', icon: '🏞️', locationRef: '' },
        { id: 'e13', time: '15:00', description: 'Huldufoss (F208 South)', icon: '🏞️', locationRef: '' },
        { id: 'e14', time: '17:00', description: 'Ofaerufoss', icon: '🏞️', locationRef: '' },
        { id: 'e15', time: '20:00', description: 'Langisjor (campsite + sunset + sunrise)', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day7', date: '25.08', dayName: 'Luni', events: [
        { id: 'e16', time: '05:00', description: 'Langisjor', icon: '🌅', locationRef: '' },
        { id: 'e17', time: '08:00', description: '2-3h rest', icon: '😴', locationRef: '' },
        { id: 'e18', time: '11:00', description: 'F208 South towards Landmannalaugar', icon: '🚙', locationRef: 'Landmannalaugar' },
        { id: 'e19', time: '22:00', description: 'Rest campsite Landmannalaugar', icon: '🏕️', locationRef: 'Landmannalaugar' }
      ]},
      { id: 'day8', date: '26.08', dayName: 'Marți', events: [
        { id: 'e20', time: 'Toată ziua', description: 'Landmannalaugar (explorare, drumeții)', icon: '🏞️', locationRef: 'Landmannalaugar' }
      ]},
      { id: 'day9', date: '27.08', dayName: 'Miercuri', events: [
        { id: 'e21', time: '10:00', description: 'Sigöldugljúfur', icon: '🏞️', locationRef: '' },
        { id: 'e22', time: '14:00', description: 'Haifoss (until after sunset)', icon: '🌅', locationRef: '' },
        { id: 'e23', time: '23:00', description: 'Þjórsárdalur Camping Ground / Camping Ground Ferðaþjónustan Úthlíð', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day10', date: '28.08', dayName: 'Joi', events: [
        { id: 'e24', time: '05:00', description: 'Burarafoss', icon: '🏞️', locationRef: '' },
        { id: 'e25', time: '10:00', description: 'Secret Lagoon', icon: '♨️', locationRef: '' },
        { id: 'e26', time: '12:00', description: 'Camping Ground Ferðaþjónustan Úthlíð (clothes wash and rest)', icon: '🧼', locationRef: '' },
        { id: 'e27', time: '16:00', description: 'Towards Hveravellir via F35', icon: '🚙', locationRef: '' },
        { id: 'e28', time: '19:00', description: 'Hveravellir (sunset, campsite, sunrise)', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day11', date: '29.08', dayName: 'Vineri', events: [
        { id: 'e29', time: '05:30', description: 'Hveravellir sunrise', icon: '🌅', locationRef: '' },
        { id: 'e30', time: '14:00', description: 'Kerlingarfjoll (sunset, campsite, sunrise)', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day12', date: '30.08', dayName: 'Sâmbătă', events: [
        { id: 'e31', time: '05:30', description: 'Kerlingarfjoll (sunrise)', icon: '🌅', locationRef: '' },
        { id: 'e32', time: '09:00', description: 'Rest campsite Kerlingarfjoll', icon: '😴', locationRef: '' },
        { id: 'e33', time: '18:00', description: 'Kerlingarfjoll (sunset)', icon: '🌅', locationRef: '' }
      ]},
      { id: 'day13', date: '31.08', dayName: 'Duminică', events: [
        { id: 'e34', time: '05:30', description: 'Kerlingarfjoll sunrise', icon: '🌅', locationRef: '' },
        { id: 'e35', time: '11:00', description: 'Leaving Kerlingarfjoll towards Selfoss town', icon: '🚙', locationRef: '' },
        { id: 'e36', time: '22:00', description: 'Stokkseyri campsite', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day14', date: '01.09', dayName: 'Luni', events: [
        { id: 'e37', time: 'Dimineața', description: 'Braided rivers (drone)', icon: '🚁', locationRef: '' },
        { id: 'e38', time: '22:00', description: 'Gata free campsite', icon: '🏕️', locationRef: '' }
      ]},
      { id: 'day15', date: '02.09', dayName: 'Marți', events: [
        { id: 'e39', time: 'Dimineața', description: '??? (Activități neplanificate)', icon: '❓', locationRef: '' },
        { id: 'e40', time: '13:00-14:00', description: 'Campeasy return', icon: '🚗', locationRef: '' },
        { id: 'e41', time: '19:00', description: 'Flight to Budapest', icon: '✈️', locationRef: '' }
      ]}
    ],
    checklist: [
      { id: 'c1',  text: 'Bocanci de munte impermeabili',    checked: false, category: 'Echipament' },
      { id: 'c2',  text: 'Geacă de ploaie și vânt',          checked: false, category: 'Echipament' },
      { id: 'c3',  text: 'Pantaloni impermeabili',            checked: false, category: 'Echipament' },
      { id: 'c4',  text: 'Polar / Mid-layer',                 checked: false, category: 'Echipament' },
      { id: 'c5',  text: 'Haine termice (base layer)',        checked: false, category: 'Echipament' },
      { id: 'c6',  text: 'Căciulă, mănuși, fular',           checked: false, category: 'Echipament' },
      { id: 'c7',  text: 'Aparat foto + obiective',           checked: false, category: 'Foto' },
      { id: 'c8',  text: 'Trepied',                           checked: false, category: 'Foto' },
      { id: 'c9',  text: 'Baterii extra & carduri memorie',   checked: false, category: 'Foto' },
      { id: 'c10', text: 'Dronă (dacă e cazul)',              checked: false, category: 'Foto' },
      { id: 'c11', text: 'Ochelari de soare',                 checked: false, category: 'Echipament' },
      { id: 'c12', text: 'Costum de baie (pt. izvoare)',      checked: false, category: 'Echipament' },
      { id: 'c13', text: 'Prosop cu uscare rapidă',           checked: false, category: 'Echipament' },
      { id: 'c14', text: 'Trusă de prim ajutor',              checked: false, category: 'Siguranță' },
      { id: 'c15', text: 'Baterie externă (Power Bank)',       checked: false, category: 'Electronice' },
      { id: 'c16', text: 'Frontală / Lanternă',               checked: false, category: 'Siguranță' }
    ]
  };

  const getTrips = () => {
    try {
      const raw = localStorage.getItem(KEYS.TRIPS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* fall through to seed */ }
    const trips = [DEFAULT_TRIP];
    saveTrips(trips);
    return trips;
  };

  const saveTrips = (trips) => {
    localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
  };

  const getActiveTripId = () => {
    return localStorage.getItem(KEYS.ACTIVE_ID) || DEFAULT_TRIP.id;
  };

  const setActiveTripId = (id) => {
    localStorage.setItem(KEYS.ACTIVE_ID, id);
  };

  const getActiveTrip = () => {
    const trips = getTrips();
    const id = getActiveTripId();
    return trips.find(t => t.id === id) || trips[0] || null;
  };

  const updateTrip = (id, partialUpdate) => {
    const trips = getTrips();
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) return null;
    trips[idx] = { ...trips[idx], ...partialUpdate };
    saveTrips(trips);
    return trips[idx];
  };

  const deleteTrip = (id) => {
    let trips = getTrips();
    trips = trips.filter(t => t.id !== id);
    saveTrips(trips);
    if (getActiveTripId() === id) {
      setActiveTripId(trips[0] ? trips[0].id : '');
    }
    return trips;
  };

  const createTrip = (data) => {
    const trips = getTrips();
    const newTrip = {
      id: generateId(),
      name: 'New Trip',
      startDate: '',
      endDate: '',
      travelers: 1,
      vehicle: { name: '', description: '', imageUrl: '' },
      meta: [],
      budget: [],
      locations: [],
      itinerary: [],
      checklist: [],
      ...data
    };
    trips.push(newTrip);
    saveTrips(trips);
    return newTrip;
  };

  return {
    generateId,
    getTrips,
    saveTrips,
    getActiveTripId,
    setActiveTripId,
    getActiveTrip,
    updateTrip,
    deleteTrip,
    createTrip
  };
})();
