// assets/js/blueprint-svg.js

export function renderBlueprint(container, standardSlug, dValue, lValue) {
    if (!container) return;

    let type = 'hex-bolt-partial';
    if (standardSlug === 'din-933') type = 'hex-bolt-full';
    if (standardSlug === 'din-912') type = 'socket-head-cap';

    const dText = dValue ? `⌀ ${dValue}` : '⌀ d';
    const lText = lValue ? `L ${lValue}` : 'L l';

    // Base SVG container
    const width = 400;
    const height = 150;
    
    let pathData = '';
    
    if (type === 'hex-bolt-partial' || type === 'hex-bolt-full') {
        pathData = `
            M 60,40 
            L 80,40 
            L 80,50 
            L 340,50 
            L 340,100 
            L 80,100 
            L 80,110 
            L 60,110 Z
            
            M 80,45 L 60,45
            M 80,105 L 60,105
        `;
        
        if (type === 'hex-bolt-partial') {
            pathData += `
                M 220,50 L 220,100
                M 225,50 L 225,100
                M 230,50 L 230,100
            `;
            for (let i = 240; i < 340; i += 10) {
                pathData += `M ${i},50 L ${i+5},100 `;
            }
        } else {
            for (let i = 90; i < 340; i += 10) {
                pathData += `M ${i},50 L ${i+5},100 `;
            }
        }
    } else if (type === 'socket-head-cap') {
        pathData = `
            M 50,30
            L 90,30
            L 90,50
            L 340,50
            L 340,100
            L 90,100
            L 90,120
            L 50,120 Z
            
            M 60,50 L 80,50 L 80,100 L 60,100 Z
        `;
        for (let i = 180; i < 340; i += 10) {
            pathData += `M ${i},50 L ${i+5},100 `;
        }
    }

    const html = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="max-width: 500px; display: block; margin: 0 auto; color: var(--line);">
            <!-- Drawing paths -->
            <path class="blueprint-path draw-in" d="${pathData}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            
            <!-- Dimension line L -->
            <path d="M 80,20 L 340,20" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 2" />
            <path d="M 80,10 L 80,40" fill="none" stroke="currentColor" stroke-width="1" />
            <path d="M 340,10 L 340,40" fill="none" stroke="currentColor" stroke-width="1" />
            <path d="M 80,20 L 85,17 L 85,23 Z" fill="currentColor" />
            <path d="M 340,20 L 335,17 L 335,23 Z" fill="currentColor" />
            
            <!-- Dimension text L -->
            <text x="210" y="14" fill="currentColor" font-family="'IBM Plex Mono', monospace" font-size="12" text-anchor="middle" class="dim-text" style="transition: opacity 0.2s ease;">${lText}</text>
            
            <!-- Dimension line D -->
            <path d="M 360,50 L 360,100" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 2" />
            <path d="M 340,50 L 370,50" fill="none" stroke="currentColor" stroke-width="1" />
            <path d="M 340,100 L 370,100" fill="none" stroke="currentColor" stroke-width="1" />
            <path d="M 360,50 L 357,55 L 363,55 Z" fill="currentColor" />
            <path d="M 360,100 L 357,95 L 363,95 Z" fill="currentColor" />
            
            <!-- Dimension text D -->
            <text x="365" y="79" fill="currentColor" font-family="'IBM Plex Mono', monospace" font-size="12" dominant-baseline="middle" class="dim-text" style="transition: opacity 0.2s ease;">${dText}</text>
        </svg>
    `;

    // Only inject SVG completely if missing, otherwise crossfade the text labels to avoid re-triggering path animation
    const existing = container.querySelector('svg');
    if (existing && !container.hasAttribute('data-initial-drawn')) {
        // First draw already happened but standard might have changed, wait, let's just replace if standard changes
        // Actually, if standard is the same, just update texts.
        if (container.getAttribute('data-standard') === standardSlug) {
            const texts = container.querySelectorAll('.dim-text');
            if (texts.length === 2) {
                texts[0].style.opacity = '0';
                texts[1].style.opacity = '0';
                setTimeout(() => {
                    texts[0].textContent = lText;
                    texts[1].textContent = dText;
                    texts[0].style.opacity = '1';
                    texts[1].style.opacity = '1';
                }, 200);
            }
            return;
        }
    }
    
    container.setAttribute('data-standard', standardSlug);
    container.innerHTML = html;
    container.setAttribute('data-initial-drawn', 'true');
}
