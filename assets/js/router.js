// assets/js/router.js
import { renderHome } from './views/home.js';
import { renderCatalog } from './views/catalog.js';
import { renderCategory } from './views/category.js';
import { renderStandard } from './views/standard.js';
import { renderAbout } from './views/about.js';

const routes = [
    { pattern: /^\/?$/, render: renderHome },
    { pattern: /^\/catalog\/?$/, render: renderCatalog },
    { pattern: /^\/catalog\/([a-z0-9-]+)\/?$/, render: (root, cat) => renderCategory(root, cat) },
    { pattern: /^\/catalog\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/, render: (root, cat, std) => renderStandard(root, cat, std) },
    { pattern: /^\/about\/?$/, render: renderAbout },
];

export async function handleRoute() {
    const root = document.getElementById('app-root');
    let hash = window.location.hash.slice(1) || '/';

    // Clear and remove fade class to re-trigger
    root.classList.remove('fade-in');
    
    // slight delay to ensure reflow
    void root.offsetWidth; 
    
    let matched = false;
    for (const route of routes) {
        const match = hash.match(route.pattern);
        if (match) {
            matched = true;
            const args = match.slice(1);
            root.innerHTML = '';
            try {
                await route.render(root, ...args);
            } catch (err) {
                console.error("Render error:", err);
                root.innerHTML = '<div class="container" style="padding: var(--space-6) var(--space-4);"><p>Помилка завантаження сторінки.</p></div>';
            }
            break;
        }
    }

    if (!matched) {
        root.innerHTML = '<div class="container" style="padding: var(--space-6) var(--space-4);"><h1 class="display-text">404</h1><p>Сторінку не знайдено.</p><a href="#/" class="btn btn-primary">На головну</a></div>';
    }

    root.classList.add('fade-in');
    window.scrollTo(0, 0);
    
    // Active Nav Update
    document.querySelectorAll('.primary-nav a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').slice(1);
        if (hash === href || (hash.startsWith('/catalog') && href === '/catalog')) {
            link.classList.add('active');
        }
    });
}
