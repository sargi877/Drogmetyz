// assets/js/main.js
import { initTheme } from './theme.js';
import { handleRoute } from './router.js';
import { initReservation } from './reservation.js';

// Setup router listener
window.addEventListener('hashchange', handleRoute);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initReservation();
    handleRoute();
});
