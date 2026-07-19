// assets/js/views/about.js
export async function renderAbout(root) {
    root.innerHTML = `
        <div class="container" style="padding: var(--space-6) var(--space-4); max-width: 800px;">
            <h1 class="display-text">Про нас</h1>
            
            <div class="card" style="margin-top: var(--space-6);">
                <div class="title-block">ХТО МИ</div>
                <h2 style="font-size: var(--text-lg);">Місцевий магазин кріплення</h2>
                <p>Drogmetyz — це невеликий бізнес, створений для тих, хто цінує точність і надійність. Ми спеціалізуємось на високоякісному кріпленні за стандартами DIN, ISO та ГОСТ. Наш пріоритет — особисте спілкування та підбір деталей, які підходять з першого разу.</p>
                
                <h3 style="font-size: var(--text-base); margin-top: var(--space-4);">Чому в нас?</h3>
                <ul style="padding-left: var(--space-4);">
                    <li>Реальна наявність — якщо деталь є в каталозі, вона є на складі.</li>
                    <li>Особиста перевірка — ви оглядаєте товар перед оплатою.</li>
                    <li>Гнучкість — завжди готові підказати альтернативу.</li>
                </ul>
            </div>
        </div>
    `;
}
