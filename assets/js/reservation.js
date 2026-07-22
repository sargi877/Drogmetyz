// assets/js/reservation.js

const CART_KEY = 'drogmetyz-cart';
const RESERVATION_FORM_BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeV94UYXHXEn7tpIzV5VlpOlenR7VJ_ynhSTIt8gon8FvNx5g/viewform?usp=publish-editor"; // TODO(owner)
const FORM_FIELD_IDS = {
    name: "entry.REPLACE_ME", // TODO(owner)
    itemsSummary: "entry.REPLACE_ME" // TODO(owner)
};

let cart = [];

// Cursor-follow lighting effect for hero banner
const attachCursorLight = (root = document) => {
    const hero = root.querySelector('.hero');
    if (!hero) return;
    
    const update = (e) => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--mouse-x', `${x}%`);
        hero.style.setProperty('--mouse-y', `${y}%`);
    };
    
    hero.addEventListener('mousemove', update);
    hero.addEventListener('touchmove', (e) => {
        if (e.touches.length) update(e.touches[0]);
    }, { passive: true });
};

export function initReservation() {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch(e) {}
    }
    
    // Bind global drawer toggles
    const toggleBtn = document.getElementById('reservation-toggle');
    const closeBtn = document.getElementById('close-drawer');
    const drawerOverlay = document.getElementById('reservation-drawer');
    const drawer = drawerOverlay.querySelector('.drawer');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            renderCart();
            drawerOverlay.classList.add('open');
            drawerOverlay.setAttribute('aria-hidden', 'false');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeDrawer());
    }

    drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) closeDrawer();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawerOverlay.classList.contains('open')) {
            closeDrawer();
        }
    });

    // Copy is now mandatory and integrated into submit flow
    document.getElementById('submit-reservation')?.addEventListener('click', submitReservation);
    
    // Initial attach for cursor lighting
    attachCursorLight();
    
    // Re-attach after route changes
    const observer = new MutationObserver(() => attachCursorLight(document));
    observer.observe(document.getElementById('app-root'), { childList: true, subtree: true });

    updateBadge();
}

function closeDrawer() {
    const drawerOverlay = document.getElementById('reservation-drawer');
    drawerOverlay.classList.remove('open');
    drawerOverlay.setAttribute('aria-hidden', 'true');
    document.getElementById('drawer-note').textContent = '';
}

export function addToReservation(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty += item.qty;
    } else {
        cart.push(item);
    }
    saveCart();
    renderCart();
    
    const drawerOverlay = document.getElementById('reservation-drawer');
    drawerOverlay.classList.add('open');
    drawerOverlay.setAttribute('aria-hidden', 'false');
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadge();
}

function updateBadge() {
    const badge = document.getElementById('reservation-badge');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
}

function updateTotal() {
    const totalEl = document.getElementById('reservation-total');
    if (!totalEl) return;

    let sum = 0;
    let allPricesKnown = true;

    cart.forEach(item => {
        if (item.price) {
            const p = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) {
                sum += p * item.qty;
            } else {
                allPricesKnown = false;
            }
        } else {
            allPricesKnown = false;
        }
    });

    if (allPricesKnown && sum > 0) {
        totalEl.textContent = `Сума — ${sum.toFixed(2)} грн`;
    } else {
        totalEl.textContent = 'Сума — уточнюється';
    }

    totalEl.classList.add('highlight');
    setTimeout(() => totalEl.classList.remove('highlight'), 300);
}

function renderCart() {
    const container = document.getElementById('reservation-items');
    const totalEl = document.getElementById('reservation-total');
    if (!container || !totalEl) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-muted mono-text" style="text-align:center; padding-top: var(--space-6);">Бронювання порожнє.</p>';
        totalEl.textContent = 'Сума — 0 грн';
        return;
    }

    container.innerHTML = '';
    let allPricesKnown = true;
    let sum = 0;

    cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'reservation-item';
        row.dataset.index = index;

        let priceLabel = 'Ціна за запитом';
        if (item.price) {
            const p = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) {
                sum += p * item.qty;
                priceLabel = `${item.price} грн/шт`;
            } else {
                allPricesKnown = false;
            }
        } else {
            allPricesKnown = false;
        }

        const sizeLabel = `${item.diameter}×${item.length}`;

        row.innerHTML = `
            <div class="reservation-item-row">
                <div class="reservation-item-info">
                    <div class="reservation-item-name">${item.standard}</div>
                    <div class="reservation-item-meta">${sizeLabel} · Кл.${item.strengthClass}</div>
                    <div class="reservation-item-price">${priceLabel}</div>
                </div>
                <div class="reservation-item-actions">
                    <div class="qty-stepper">
                        <button class="qty-btn qty-minus" aria-label="Зменшити" data-index="${index}">−</button>
                        <input type="number" min="1" value="${item.qty}" class="qty-input qty-edit mono-text" aria-label="Кількість" data-index="${index}">
                        <button class="qty-btn qty-plus" aria-label="Збільшити" data-index="${index}">+</button>
                    </div>
                    <button class="icon-btn remove-btn" aria-label="Видалити" data-index="${index}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
        `;

        const input = row.querySelector('.qty-edit');
        input.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val > 0) {
                cart[index].qty = val;
                saveCart();
                updateTotal();
            } else {
                e.target.value = item.qty;
            }
        });

        const rmBtn = row.querySelector('.remove-btn');
        rmBtn.addEventListener('click', () => {
            row.classList.add('removing');
            setTimeout(() => {
                cart.splice(index, 1);
                saveCart();
                renderCart();
            }, 250);
        });

        const minusBtn = row.querySelector('.qty-minus');
        const plusBtn = row.querySelector('.qty-plus');

        minusBtn.addEventListener('click', () => {
            let val = parseInt(input.value, 10) || 1;
            val = Math.max(1, val - 1);
            input.value = val;
            cart[index].qty = val;
            saveCart();
            updateTotal();
        });

        plusBtn.addEventListener('click', () => {
            let val = parseInt(input.value, 10) || 1;
            val = val + 1;
            input.value = val;
            cart[index].qty = val;
            saveCart();
            updateTotal();
        });

        container.appendChild(row);
    });

    if (allPricesKnown) {
        totalEl.textContent = `Сума — ${sum.toFixed(2)} грн`;
    } else {
        totalEl.textContent = 'Сума — уточнюється';
    }
}

function generateSummaryText() {
    if (cart.length === 0) return "Бронювання порожнє.";
    let text = "Бронювання Drogmetyz:\n\n";
    let sum = 0;
    let allPricesKnown = true;

    cart.forEach((item, i) => {
        const size = `${item.diameter}×${item.length}`;
        let priceLine = '';
        if (item.price) {
            const p = parseFloat(item.price.replace(/[^0-9.]/g, ''));
            if (!isNaN(p)) {
                sum += p * item.qty;
                priceLine = ` — ${item.qty} шт × ${item.price} грн/шт`;
            } else {
                allPricesKnown = false;
                priceLine = ` — ${item.qty} шт (ціна за запитом)`;
            }
        } else {
            allPricesKnown = false;
            priceLine = ` — ${item.qty} шт (ціна за запитом)`;
        }
        text += `${i+1}. ${item.standard} (${size}) Кл.${item.strengthClass}${priceLine}\n`;
    });

    if (allPricesKnown && sum > 0) {
        text += `\nЗагальна сума: ${sum.toFixed(2)} грн`;
    } else {
        text += `\nЗагальна сума: уточнюється`;
    }
    return text;
}

function submitReservation() {
    if (cart.length === 0) return;

    const summary = generateSummaryText();

    navigator.clipboard.writeText(summary).then(() => {
        const note = document.getElementById('drawer-note');
        if (note) {
            note.textContent = 'Скопійовано! Відкриваю форму...';
            note.classList.add('copy-success');
        }

        setTimeout(() => {
            let url = RESERVATION_FORM_BASE_URL;
            if (!url.includes("REPLACE_ME") && !FORM_FIELD_IDS.itemsSummary.includes("REPLACE_ME")) {
                const sep = url.includes('?') ? '&' : '?';
                url += `${sep}${FORM_FIELD_IDS.itemsSummary}=${encodeURIComponent(summary)}`;
            }
            window.open(url, '_blank');
            if (note) {
                note.textContent = 'Форма відкрилась у новій вкладці. Заповніть її, і ми зв\'яжемось для підтвердження.';
                setTimeout(() => {
                    note.textContent = '';
                    note.classList.remove('copy-success');
                }, 4000);
            }
        }, 800);
    }).catch(() => {
        const note = document.getElementById('drawer-note');
        if (note) {
            note.textContent = 'Помилка копіювання. Спробуйте ще раз.';
        }
    });
}
