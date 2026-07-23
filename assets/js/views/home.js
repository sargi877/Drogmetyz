// assets/js/views/home.js

const HEADLINES = [
    "Кріплення, яке підходить з першого разу",
    "Надійне кріплення для ваших ідей",
    "Точність у кожному міліметрі стандарту",
    "Метизи, на які можна покластися",
    "Коли потрібен правильний крок різьби",
    "Справжня міцність без зайвих слів",
    "Залізна точність для будь-якої задачі",
    "Кріплення від професіоналів для професіоналів",
    "Якість, перевірена кожним обертом"
];

export async function renderHome(root) {
    const headline = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
    
    root.innerHTML = `
        <section class="hero bg-graph-paper" style="padding: var(--space-8) 0; border-bottom: 1px solid var(--border);">
            <div class="container">
                <div class="hero-layout">
                    <div class="hero-text">
                        <h1 class="display-text" style="font-size: var(--text-3xl); max-width: 600px;">${headline}</h1>
                        <p style="font-size: var(--text-lg); max-width: 500px; color: var(--text-muted);">Резервуйте деталі онлайн, забирайте особисто. Працюємо з точністю за стандартом.</p>
                        <a href="#/catalog" class="btn btn-primary" style="margin-top: var(--space-4); font-size: var(--text-base);">Перейти до каталогу</a>
                    </div>
                    <div class="hero-image-wrap">
                        <img src="assets/images/bolt.png" alt="Кріплення" class="hero-bolt-img" width="800" height="800">
                    </div>
                </div>
            </div>
        </section>
        <section style="padding: var(--space-6) 0;">
            <div class="container">
                <h2 class="display-text">Як це працює</h2>
                <div class="home-grid">
                    <div class="card">
                        <div class="title-block">КРОК 1</div>
                        <h3>Оберіть деталь і кількість</h3>
                        <p class="text-sm text-muted">Використовуйте зручний каталог для пошуку за стандартом, розміром та класом міцності.</p>
                    </div>
                    <div class="card">
                        <div class="title-block">КРОК 2</div>
                        <h3>Забронюйте</h3>
                        <p class="text-sm text-muted">Додайте до бронювання та відправте нам список, щоб ми відклали ваше замовлення.</p>
                    </div>
                    <div class="card">
                        <div class="title-block">КРОК 3</div>
                        <h3>Заберіть і оплатіть особисто</h3>
                        <p class="text-sm text-muted">Приїдьте, огляньте та завершіть угоду на місці. Без передоплат онлайн.</p>
                    </div>
                </div>
            </div>
        </section>
        <section style="padding: 0 0 var(--space-6) 0;">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-4);">
                    <h2 class="display-text" style="margin: 0;">Популярні категорії</h2>
                    <a href="#/catalog" class="mono-text text-sm" style="color: var(--line);">Увесь каталог &rarr;</a>
                </div>
                <div class="home-grid">
                    <a href="#/catalog/bolty" class="card">
                        <div class="title-block">Категорія</div>
                        <h3>Болти</h3>
                        <p class="mono-text text-xs text-muted">DIN 931, DIN 933</p>
                    </a>
                    <a href="#/catalog/hvynty" class="card">
                        <div class="title-block">Категорія</div>
                        <h3>Гвинти</h3>
                        <p class="mono-text text-xs text-muted">DIN 912</p>
                    </a>
                </div>
            </div>
        </section>
    `;
}
