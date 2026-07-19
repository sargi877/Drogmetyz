// assets/js/views/standard.js
import { fetchCatalogData } from '../data.js';
import { unslugifyCategory, slugifyStandard } from '../slugify.js';
import { renderBlueprint } from '../blueprint-svg.js';
import { addToReservation } from '../reservation.js';

export async function renderStandard(root, categorySlug, standardSlug) {
    const rawCategory = unslugifyCategory(categorySlug);
    
    root.innerHTML = `
        <div class="container" style="padding: var(--space-6) var(--space-4);">
            <nav class="mono-text text-sm text-muted" style="margin-bottom: var(--space-4);">
                <a href="#/">Головна</a> / <a href="#/catalog">Каталог</a> / <a href="#/catalog/${categorySlug}">${rawCategory}</a> / <span id="breadcrumb-standard">${standardSlug}</span>
            </nav>
            <h1 id="page-title" class="display-text" style="font-size: var(--text-2xl);">${standardSlug.toUpperCase()}</h1>
            
            <div style="margin-top: var(--space-6); min-height: 200px; display: flex; justify-content: center;" id="blueprint-container">
                <!-- SVG injected here later -->
            </div>

            <div style="margin-top: var(--space-6);">
                <div class="filter-bar" style="display: flex; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-4); padding: var(--space-4); background: var(--surface-2); border-radius: var(--radius-md); border: 1px solid var(--border);">
                    <div style="flex: 1; min-width: 150px;">
                        <label class="text-xs text-muted mono-text" style="display:block; margin-bottom: 4px;">Діаметр (d)</label>
                        <select id="filter-d" style="width:100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg); color: var(--text);"></select>
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <label class="text-xs text-muted mono-text" style="display:block; margin-bottom: 4px;">Довжина (l)</label>
                        <select id="filter-l" style="width:100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg); color: var(--text);"></select>
                    </div>
                    <div style="flex: 1; min-width: 150px;">
                        <label class="text-xs text-muted mono-text" style="display:block; margin-bottom: 4px;">Клас міцності</label>
                        <select id="filter-c" style="width:100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg); color: var(--text);"></select>
                    </div>
                    <div style="display: flex; align-items: flex-end;">
                        <button id="reset-filters" class="btn btn-secondary">Скинути фільтри</button>
                    </div>
                </div>

                <div id="size-grid" style="display: flex; flex-direction: column; gap: var(--space-2);">
                    <p>Завантаження...</p>
                </div>
            </div>
        </div>
    `;

    const data = await fetchCatalogData();
    const allItems = data.filter(d => d.category === rawCategory);
    
    let targetStandardRaw = '';
    const standardItems = allItems.filter(d => {
        if (slugifyStandard(d.standardRaw) === standardSlug) {
            targetStandardRaw = d.standardRaw;
            return true;
        }
        return false;
    });

    if (standardItems.length === 0) {
        document.getElementById('size-grid').innerHTML = '<p>Товарів не знайдено.</p>';
        return;
    }

    const match = targetStandardRaw.match(/^(DIN|ISO|ГОСТ)\s+([\d-]+)/i);
    const standardNum = match ? `${match[1]} ${match[2]}` : standardSlug;
    document.getElementById('breadcrumb-standard').textContent = standardNum;
    document.getElementById('page-title').textContent = targetStandardRaw;

    let filters = { d: '', l: '', c: '' };

    function getUnique(arr, key) {
        const set = new Set(arr.map(a => a[key]).filter(v => v !== ''));
        return Array.from(set).sort((a, b) => {
            if(typeof a === 'number') return a - b;
            const na = parseFloat(a.toString().replace(/[^0-9.]/g, ''));
            const nb = parseFloat(b.toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.localeCompare(b);
        });
    }

    const dSelect = document.getElementById('filter-d');
    const lSelect = document.getElementById('filter-l');
    const cSelect = document.getElementById('filter-c');
    
    function populateSelect(selectEl, values, selected) {
        selectEl.innerHTML = '<option value="">Усі</option>';
        values.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            if (v.toString() === selected.toString()) opt.selected = true;
            selectEl.appendChild(opt);
        });
    }

    function renderGrid() {
        const matching = standardItems.filter(item => {
            if (filters.d && item.diameter !== filters.d) return false;
            if (filters.l && item.length.toString() !== filters.l.toString()) return false;
            if (filters.c && item.strengthClass !== filters.c) return false;
            return true;
        });

        populateSelect(dSelect, getUnique(standardItems, 'diameter'), filters.d);
        populateSelect(lSelect, getUnique(standardItems, 'length'), filters.l);
        populateSelect(cSelect, getUnique(standardItems, 'strengthClass'), filters.c);

        const grid = document.getElementById('size-grid');
        grid.innerHTML = '';
        if (matching.length === 0) {
            grid.innerHTML = `
                <div class="card" style="text-align: center; padding: var(--space-6);">
                    <p>Такого поєднання немає в каталозі — спробуйте інші параметри.</p>
                    <button class="btn btn-secondary reset-btn-local" style="margin-top: var(--space-4);">Скинути фільтри</button>
                </div>`;
            const localReset = grid.querySelector('.reset-btn-local');
            if (localReset) {
                localReset.addEventListener('click', () => {
                    filters = { d: '', l: '', c: '' };
                    renderGrid();
                });
            }
            // Clear blueprint sizes
            renderBlueprint(document.getElementById('blueprint-container'), standardSlug, '', '');
            return;
        }

        matching.forEach(item => {
            const row = document.createElement('div');
            row.className = 'card';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.flexWrap = 'wrap';
            row.style.gap = 'var(--space-4)';
            row.style.padding = 'var(--space-3) var(--space-4)';

            let stockClass = 'status-neutral';
            let stockLabel = item.stockRaw || 'Уточнюйте';
            const sLower = stockLabel.toLowerCase();
            if (sLower.includes('в наявності')) stockClass = 'status-ok';
            else if (sLower.includes('обмежено')) stockClass = 'status-low';
            else if (sLower.includes('немає')) stockClass = 'status-out';

            const priceLabel = item.priceRaw ? `${item.priceRaw} грн/шт` : 'Ціна за запитом';

            row.innerHTML = `
                <div style="flex: 1; min-width: 200px; display: flex; gap: var(--space-4); align-items: center;">
                    <div class="mono-text" style="font-weight: 500;">
                        ${item.diameter ? `⌀${item.diameter}` : ''} 
                        ${item.length ? `L${item.length}` : ''}
                    </div>
                    <div class="mono-text text-sm text-muted">Кл. ${item.strengthClass}</div>
                </div>
                <div style="display: flex; gap: var(--space-4); align-items: center; flex-wrap: wrap;">
                    <span class="status-badge ${stockClass}">${stockLabel}</span>
                    <span class="mono-text" style="min-width: 120px; text-align: right;">${priceLabel}</span>
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <input type="number" min="1" value="1" class="qty-input mono-text" style="width: 60px; padding: 4px; border: 1px solid var(--border); background: var(--bg); color: var(--text); border-radius: 4px; text-align: center;" aria-label="Кількість">
                        <button class="btn btn-primary btn-add">Додати</button>
                    </div>
                </div>
            `;
            
            const btn = row.querySelector('.btn-add');
            const input = row.querySelector('.qty-input');
            btn.addEventListener('click', () => {
                const qty = parseInt(input.value, 10) || 1;
                addToReservation({
                    id: item.id,
                    standard: standardNum,
                    diameter: item.diameter,
                    length: item.length,
                    strengthClass: item.strengthClass,
                    price: item.priceRaw,
                    qty: qty
                });
            });

            grid.appendChild(row);
        });

        // Update blueprint
        renderBlueprint(document.getElementById('blueprint-container'), standardSlug, filters.d || matching[0].diameter, filters.l || matching[0].length);
    }

    document.getElementById('filter-d').addEventListener('change', e => { filters.d = e.target.value; renderGrid(); });
    document.getElementById('filter-l').addEventListener('change', e => { filters.l = e.target.value; renderGrid(); });
    document.getElementById('filter-c').addEventListener('change', e => { filters.c = e.target.value; renderGrid(); });
    document.getElementById('reset-filters').addEventListener('click', () => {
        filters = { d: '', l: '', c: '' };
        renderGrid();
    });

    renderGrid();
}
