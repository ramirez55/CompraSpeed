document.addEventListener('DOMContentLoaded', () => {
    // Configuración del Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Carga de Ajustes e Historial Local
    let settings = JSON.parse(localStorage.getItem('cs_settings')) || { exchangeRate: 320, defaultCurrency: 'USD' };
    let currentCurrency = settings.defaultCurrency;

    let products = JSON.parse(localStorage.getItem('cs_products')) || [
        { id: 1, name: 'iPhone 15', category: 'Tecnología', price: 800, currency: 'USD', oldPrice: 900, stock: 5, badge: 'Nuevo', active: true, featured: true, description: 'Excelente estado, importado.' },
        { id: 2, name: 'Perfume Elegance', category: 'Perfumes', price: 3200, currency: 'CUP', oldPrice: 4000, stock: 10, badge: 'Oferta', active: true, featured: false, description: 'Fragancia duradera 100ml.' }
    ];

    let cart = JSON.parse(localStorage.getItem('cs_cart')) || [];
    let selectedCategory = 'all';

    // Selector de Moneda
    const currencyToggle = document.getElementById('currencyToggle');
    if (currencyToggle) {
        currencyToggle.value = currentCurrency;
        currencyToggle.addEventListener('change', (e) => {
            currentCurrency = e.target.value;
            renderProducts();
            renderCart();
        });
    }

    // Calculadora / Conversor de Monedas
    function formatPrice(amount, baseCurrency) {
        if (!amount || isNaN(amount)) return '';
        let converted = amount;
        if (baseCurrency === 'USD' && currentCurrency === 'CUP') {
            converted = amount * settings.exchangeRate;
        } else if (baseCurrency === 'CUP' && currentCurrency === 'USD') {
            converted = amount / settings.exchangeRate;
        }
        return `${currentCurrency} $${converted.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Renderizar Categorías en la Tienda
    function renderCategories() {
        const categoriesContainer = document.getElementById('categories');
        if (!categoriesContainer) return;

        const categories = ['all', ...new Set(products.map(p => p.category))];
        categoriesContainer.innerHTML = categories.map(cat => `
            <button class="category-btn ${cat === selectedCategory ? 'active' : ''}" data-category="${cat}">
                ${cat === 'all' ? 'Todos' : cat}
            </button>
        `).join('');

        categoriesContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedCategory = btn.getAttribute('data-category');
                renderCategories();
                renderProducts();
            });
        });
    }

    // Renderizar Tarjetas de Productos
    function renderProducts() {
        const grid = document.getElementById('productsGrid');
        const empty = document.getElementById('emptyProducts');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');

        if (!grid) return;

        let filtered = products.filter(p => p.active);

        // Filtrado por Categoría
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Búsqueda por Texto
        if (searchInput && searchInput.value.trim() !== '') {
            const query = searchInput.value.toLowerCase().trim();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
        }

        // Ordenación
        if (sortSelect) {
            const val = sortSelect.value;
            if (val === 'az') filtered.sort((a, b) => a.name.localeCompare(b.name));
            if (val === 'za') filtered.sort((a, b) => b.name.localeCompare(a.name));
            if (val === 'price-low') filtered.sort((a, b) => a.price - b.price);
            if (val === 'price-high') filtered.sort((a, b) => b.price - a.price);
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }

        if (empty) empty.style.display = 'none';

        grid.innerHTML = filtered.map(p => `
            <div class="product-card">
                ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                <h3>${p.name}</h3>
                <p class="category">${p.category}</p>
                <div class="prices">
                    <span class="price">${formatPrice(p.price, p.currency)}</span>
                    ${p.oldPrice ? `<span class="old-price" style="text-decoration:line-through; font-size:0.8em; color:#888;">${formatPrice(p.oldPrice, p.currency)}</span>` : ''}
                </div>
                <button onclick="addToCart(${p.id})" class="btn" ${p.stock <= 0 ? 'disabled' : ''}>
                    ${p.stock > 0 ? '🛒 Añadir al Carrito' : 'Agotado'}
                </button>
            </div>
        `).join('');
    }

    // Eventos de Filtro y Búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', renderProducts);

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', renderProducts);

    // Carrito de Compras
    window.addToCart = function(id) {
        const prod = products.find(p => p.id === id);
        if (!prod) return;

        const item = cart.find(i => i.id === id);
        if (item) {
            item.qty++;
        } else {
            cart.push({ ...prod, qty: 1 });
        }
        updateCart();
    };

    function updateCart() {
        localStorage.setItem('cs_cart', JSON.stringify(cart));
        const cartCount = document.getElementById('cartCount');
        if (cartCount) cartCount.textContent = cart.reduce((acc, i) => acc + i.qty, 0);
    }

    function renderCart() {
        const cartBody = document.getElementById('cartBody');
        if (!cartBody) return;

        if (cart.length === 0) {
            cartBody.innerHTML = '<p>El carrito está vacío.</p>';
            return;
        }

        let total = 0;
        let html = '<ul class="cart-list">';
        cart.forEach(item => {
            let itemPrice = item.price;
            if (item.currency === 'USD' && currentCurrency === 'CUP') itemPrice *= settings.exchangeRate;
            if (item.currency === 'CUP' && currentCurrency === 'USD') itemPrice /= settings.exchangeRate;

            const subtotal = itemPrice * item.qty;
            total += subtotal;

            html += `
                <li style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>x${item.qty}</small>
                    </div>
                    <div>
                        ${currentCurrency} $${subtotal.toFixed(2)}
                    </div>
                </li>
            `;
        });

        const waMessage = encodeURIComponent(`Hola COMPRA SPEED, quiero realizar este pedido:\n` + cart.map(i => `- ${i.name} x${i.qty}`).join('\n') + `\nTotal estimado: ${currentCurrency} $${total.toFixed(2)}`);
        
        html += `</ul>
            <hr>
            <p><strong>Total: ${currentCurrency} $${total.toFixed(2)}</strong></p>
            <a href="https://wa.me/5354560076?text=${waMessage}" target="_blank" class="btn" style="display:block; text-align:center; margin-top:15px;">💬 Realizar Pedido por WhatsApp</a>
        `;
        cartBody.innerHTML = html;
    }

    // Modal Carrito
    const openCartBtn = document.getElementById('openCart');
    const closeCartBtn = document.getElementById('closeCart');
    const cartModal = document.getElementById('cartModal');

    if (openCartBtn && cartModal) {
        openCartBtn.addEventListener('click', () => {
            renderCart();
            cartModal.style.display = 'block';
        });
    }

    if (closeCartBtn && cartModal) {
        closeCartBtn.addEventListener('click', () => {
            cartModal.style.display = 'none';
        });
    }

    // Inicialización de la Tienda
    renderCategories();
    renderProducts();
    updateCart();
});
