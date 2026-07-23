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
            row.style.flexWrap = 'nowrap';
            row.style.gap = 'var(--space-4)';
            row.style.padding = 'var(--space-3) var(--space-4)';

            const qty = parseInt(item.stockRaw || '0', 10);
            let stockIcon = '';
            let stockText = 'Уточнюйте';
            let stockAvailable = false;
            if (!isNaN(qty) && qty > 0) {
                stockText = `${qty} шт.`;
                stockAvailable = true;
                stockIcon = '<svg class="stock-check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            }

            const priceLabel = item.priceRaw ? `${item.priceRaw} грн/шт` : 'Ціна за запитом';
            let sizeLabel = (item.diameter || '').trim();
            if (sizeLabel && !String(sizeLabel).trim().startsWith('M')) {
                sizeLabel = `M${sizeLabel}`;
            }
            const lengthLabel = item.length ? `×${item.length}` : '';

            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--space-3); flex: 1; min-width: 0;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span class="size-name mono-text">${sizeLabel}${lengthLabel}</span>
                        <span class="std-label mono-text text-xs text-muted">${standardNum}</span>
                    </div>
                    <div class="strength-badge mono-text">${item.strengthClass}</div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0;">
                    <div class="stock-cell">
                        ${stockAvailable ? `<span class="stock-muted mono-text">${stockIcon}${stockText} · В наявності</span>` : `<span class="stock-neutral mono-text">${stockText}</span>`}
                    </div>
                    <span class="catalog-price mono-text">${priceLabel}</span>
                    <div class="qty-stepper">
                        <button class="qty-btn qty-minus" aria-label="Зменшити">−</button>
                        <input type="number" min="1" value="1" class="qty-input mono-text" aria-label="Кількість" style="min-width: 48px; width: 56px;">
                        <button class="qty-btn qty-plus" aria-label="Збільшити">+</button>
                    </div>
                    <button class="btn btn-primary btn-add-cart">
                        <svg class="cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        <span>Додати</span>
                    </button>
                </div>
            `;
            
            const btnAdd = row.querySelector('.btn-add-cart');
            const input = row.querySelector('.qty-input');
            const btnMinus = row.querySelector('.qty-minus');
            const btnPlus = row.querySelector('.qty-plus');
            
            const updateQty = (delta) => {
                let val = parseInt(input.value, 10) || 1;
                val = Math.max(1, val + delta);
                input.value = val;
            };
            
            btnAdd.addEventListener('click', () => {
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
            
            btnMinus.addEventListener('click', () => updateQty(-1));
            btnPlus.addEventListener('click', () => updateQty(1));
            input.addEventListener('change', () => {
                let val = parseInt(input.value, 10) || 1;
                if (val < 1) input.value = 1;
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
