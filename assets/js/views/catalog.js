// assets/js/views/catalog.js
export async function renderCatalog(root) {
    root.innerHTML = `
        <div class="container" style="padding: var(--space-6) var(--space-4);">
            <h1 class="display-text">Каталог</h1>
            <p class="text-muted" style="margin-bottom: var(--space-6);">Актуальні категорії. Асортимент буде розширюватись.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-4);">
                <!-- TODO: Load this dynamically later -->
                <a href="#/catalog/bolty" class="card">
                    <div class="title-block">Категорія</div>
                    <h3>Болти</h3>
                </a>
                <a href="#/catalog/hvynty" class="card">
                    <div class="title-block">Категорія</div>
                    <h3>Гвинти</h3>
                </a>
                
                <div class="card" style="opacity: 0.5;" aria-disabled="true">
                    <div class="title-block">Незабаром</div>
                    <h3>Гайки</h3>
                </div>
                <div class="card" style="opacity: 0.5;" aria-disabled="true">
                    <div class="title-block">Незабаром</div>
                    <h3>Шайби кільця</h3>
                </div>
            </div>
        </div>
    `;
}
