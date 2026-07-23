// assets/js/views/category.js
import { fetchCatalogData } from '../data.js';
import { slugifyCategory, unslugifyCategory, slugifyStandard } from '../slugify.js';

export async function renderCategory(root, categorySlug) {
    const rawCategory = unslugifyCategory(categorySlug);
    
    root.innerHTML = `
        <div class="container" style="padding: var(--space-6) var(--space-4);">
            <nav class="mono-text text-sm text-muted" style="margin-bottom: var(--space-4);">
                <a href="#/">Головна</a> / <a href="#/catalog">Каталог</a> / <span>${rawCategory}</span>
            </nav>
            <h1 class="display-text">Категорія: ${rawCategory}</h1>
            
            <div id="category-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-top: var(--space-6);">
                <p>Завантаження...</p>
            </div>
        </div>
    `;

    const data = await fetchCatalogData();
    const items = data.filter(d => d.category === rawCategory);
    
    if (items.length === 0) {
        document.getElementById('category-grid').innerHTML = '<p>В цій категорії поки немає товарів.</p>';
        return;
    }

    const standardsMap = new Map();
    items.forEach(item => {
        if (!standardsMap.has(item.standardRaw)) {
            standardsMap.set(item.standardRaw, {
                standardRaw: item.standardRaw,
                count: 0,
                classes: new Set()
            });
        }
        const st = standardsMap.get(item.standardRaw);
        st.count++;
        if (item.strengthClass) st.classes.add(item.strengthClass);
    });

    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    
    for (const st of standardsMap.values()) {
        const slug = slugifyStandard(st.standardRaw);
        const card = document.createElement('a');
        card.href = `#/catalog/${categorySlug}/${slug}`;
        card.className = 'card';
        
        let classText = st.classes.size > 0 ? `· ${st.classes.size} клас${st.classes.size > 1 ? 'и' : ''}` : '';
        const match = st.standardRaw.match(/^(DIN|ISO|ГОСТ)\s+([\d-]+)\s*\((.*)\)/i);
        let standardNum = st.standardRaw;
        let desc = '';
        if (match) {
            standardNum = `${match[1]} ${match[2]}`;
            desc = match[3];
        }

        card.innerHTML = `
            <div class="title-block">${standardNum} ${classText}</div>
            <h3 style="margin-bottom: var(--space-2);">${standardNum}</h3>
            <p class="text-sm text-muted">${desc}</p>
            <p class="mono-text text-xs" style="margin-top: var(--space-3); margin-bottom: 0;">${st.count} розмірів</p>
        `;
        grid.appendChild(card);
    }
}
