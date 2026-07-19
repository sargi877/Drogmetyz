// assets/js/reservation.js

const CART_KEY = 'drogmetyz-cart';
const RESERVATION_FORM_BASE_URL = "https://forms.gle/REPLACE_ME"; // TODO(owner)
const FORM_FIELD_IDS = {
    name: "entry.REPLACE_ME", // TODO(owner)
    itemsSummary: "entry.REPLACE_ME" // TODO(owner)
};

let cart = [];

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

    document.getElementById('submit-reservation')?.addEventListener('click', submitReservation);
    document.getElementById('copy-reservation')?.addEventListener('click', copyReservation);

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
        row.style.borderBottom = '1px solid var(--border)';
        row.style.padding = 'var(--space-3) 0';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.gap = 'var(--space-2)';

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

        row.innerHTML = `
            <div style="flex:1;">
                <div class="mono-text text-sm" style="font-weight: 500;">${item.standard}</div>
                <div class="mono-text text-xs text-muted">⌀${item.diameter} L${item.length} Кл.${item.strengthClass}</div>
                <div class="mono-text text-xs" style="margin-top: 4px;">${priceLabel}</div>
            </div>
            <div style="display:flex; align-items: center; gap: var(--space-2);">
                <input type="number" min="1" value="${item.qty}" class="qty-edit mono-text" style="width:50px; padding:4px; border:1px solid var(--border); border-radius:4px; text-align:center; background: var(--bg); color: var(--text);" aria-label="Кількість">
                <button class="icon-btn remove-btn" aria-label="Видалити" style="color: var(--stock-out); width: 32px; height: 32px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `;

        const input = row.querySelector('.qty-edit');
        input.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            if (val > 0) {
                cart[index].qty = val;
                saveCart();
                renderCart();
            } else {
                e.target.value = item.qty;
            }
        });

        const rmBtn = row.querySelector('.remove-btn');
        rmBtn.addEventListener('click', () => {
            cart.splice(index, 1);
            saveCart();
            renderCart();
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
    cart.forEach((item, i) => {
        text += `${i+1}. ${item.standard}, ⌀${item.diameter} L${item.length} Кл.${item.strengthClass} — ${item.qty} шт\n`;
    });
    return text;
}

function submitReservation() {
    if (cart.length === 0) return;
    
    let url = RESERVATION_FORM_BASE_URL;
    const summary = generateSummaryText();
    
    if (!url.includes("REPLACE_ME") && !FORM_FIELD_IDS.itemsSummary.includes("REPLACE_ME")) {
        const sep = url.includes('?') ? '&' : '?';
        url += `${sep}${FORM_FIELD_IDS.itemsSummary}=${encodeURIComponent(summary)}`;
    }
    
    window.open(url, '_blank');
    document.getElementById('drawer-note').textContent = 'Форма відкрилась у новій вкладці. Заповніть її, і ми зв\'яжемось для підтвердження.';
}

function copyReservation() {
    if (cart.length === 0) return;
    const summary = generateSummaryText();
    navigator.clipboard.writeText(summary).then(() => {
        document.getElementById('drawer-note').textContent = 'Список скопійовано в буфер обміну!';
        setTimeout(() => {
            document.getElementById('drawer-note').textContent = '';
        }, 3000);
    }).catch(() => {
        document.getElementById('drawer-note').textContent = 'Помилка копіювання.';
    });
}
