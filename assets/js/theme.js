// assets/js/theme.js

const THEME_KEY = 'drogmetyz-theme';

export function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Determine initial theme
    let savedTheme = localStorage.getItem(THEME_KEY);
    if (!savedTheme) {
        savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    setTheme(savedTheme);

    // Bind click
    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
}
