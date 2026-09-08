document.addEventListener('DOMContentLoaded', () => {
    let settings = JSON.parse(localStorage.getItem('cs_settings')) || { exchangeRate: 320, defaultCurrency: 'USD' };
    let products = JSON.parse(localStorage.getItem('cs_products')) || [];
    let currentBase64Image = '';

    const buttons = document.querySelectorAll('.sidebar-button, [data-go]');
    const pages = document.querySelectorAll('.admin-page');

    function navigateTo(pageId) {
        buttons.forEach(b => b.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));

        const activeBtn = document.querySelector(`.sidebar-button[data-page="${pageId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        const activePage = document.getElementById(`page-${pageId}`);
        if (activePage) activePage.classList.add('active');
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.getAttribute('data-page') || btn.getAttribute('data-go');
            if (pageId) navigateTo(pageId);
        });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminSection').style.display = 'flex';
            renderDashboard();
            renderTable();
        });
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            document.getElementById('adminSection').style.display = 'none';
            document.getElementById('loginSection').style.display = 'flex';
        });
    }

    // Convertir imagen a Base64 optimizando tamaño
    const imageInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    currentBase64Image = evt.target.result;
                    if (imagePreview) {
                        imagePreview.innerHTML = `<img src="${currentBase64Image}" style="width:100px; height:100px; object-fit:cover; border-radius:8px; margin-top:10px;">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const rateInput = document.getElementById('exchangeRate');
    const currencySelect = document.getElementById('defaultCurrency');
    const settingsForm = document.getElementById('settingsForm');

    if (rateInput && currencySelect) {
        rateInput.value = settings.exchangeRate;
        currencySelect.value = settings.defaultCurrency;

        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            settings.exchangeRate = parseFloat(rateInput.value);
            settings.defaultCurrency = currencySelect.value;

            localStorage.setItem('cs_settings', JSON.stringify(settings));
            const msg = document.getElementById('settingsMessage');
            msg.textContent = '¡Configuración guardada correctamente!';
            msg.style.color = 'green';
        });
    }

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const editId = document.getElementById('productId').value;
            let finalImage = currentBase64Image;

            if (editId && !currentBase64Image) {
                const existingProduct = products.find(p => p.id === parseInt(editId));
                if (existingProduct) finalImage = existingProduct.image || '';
            }

            const productData = {
                id: editId ? parseInt(editId) : Date.now(),
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                price: parseFloat(document.getElementById('productPrice').value),
                currency: document.getElementById('productCurrency').value,
                oldPrice: parseFloat(document.getElementById('productOldPrice').value) || null,
                stock: parseInt(document.getElementById('productStock').value),
                badge: document.getElementById('productBadge').value,
                description: document.getElementById('productDescription').value,
                active: document.getElementById('productActive').checked,
                featured: document.getElementById('productFeatured').checked,
                image: finalImage
            };

            if (editId) {
                const index = products.findIndex(p => p.id === parseInt(editId));
                if (index !== -1) products[index] = productData;
            } else {
                products.push(productData);
            }

            localStorage.setItem('cs_products', JSON.stringify(products));
            resetForm();
            renderDashboard();
            renderTable();
            navigateTo('products');
        });
    }

    function resetForm() {
        if (!productForm) return;
        productForm.reset();
        currentBase64Image = '';
        if (imagePreview) imagePreview.innerHTML = '';
        document.getElementById('productId').value = '';
        document.getElementById('formTitle').textContent = 'Publicar producto';
        document.getElementById('cancelEdit').style.display = 'none';
    }

    document.getElementById('cancelEdit')?.addEventListener('click', resetForm);

    function renderDashboard() {
        document.getElementById('statTotal').textContent = products.length;
        document.getElementById('statVisible').textContent = products.filter(p => p.active).length;
        document.getElementById('statFeatured').textContent = products.filter(p => p.featured).length;
        document.getElementById('statOut').textContent = products.filter(p => p.stock <= 0).length;
    }

    function renderTable() {
        const tableBody = document.getElementById('productsTable');
        if (!tableBody) return;

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No hay productos disponibles.</td></tr>';
            return;
        }

        tableBody.innerHTML = products.map(p => {
            const hasImage = p.image && p.image.trim() !== '';
            const imgHtml = hasImage 
                ? `<img src="${p.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">` 
                : '📦';

            return `
                <tr>
                    <td>${imgHtml}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td>$${p.price.toFixed(2)} (${p.currency})</td>
                    <td>${p.stock}</td>
                    <td>${p.active ? '🟢 Visible' : '🔴 Oculto'}</td>
                    <td>
                        <button onclick="editProduct(${p.id})">✏️</button>
                        <button onclick="deleteProduct(${p.id})">❌</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.editProduct = function(id) {
        const p = products.find(prod => prod.id === id);
        if (!p) return;

        document.getElementById('productId').value = p.id;
        document.getElementById('productName').value = p.name;
        document.getElementById('productCategory').value = p.category;
        document.getElementById('productPrice').value = p.price;
        document.getElementById('productCurrency').value = p.currency;
        document.getElementById('productOldPrice').value = p.oldPrice || '';
        document.getElementById('productStock').value = p.stock;
        document.getElementById('productBadge').value = p.badge || '';
        document.getElementById('productDescription').value = p.description || '';
        document.getElementById('productActive').checked = p.active;
        document.getElementById('productFeatured').checked = p.featured;

        currentBase64Image = p.image || '';
        if (imagePreview && p.image) {
            imagePreview.innerHTML = `<img src="${p.image}" style="width:100px; height:100px; object-fit:cover; border-radius:8px; margin-top:10px;">`;
        } else if (imagePreview) {
            imagePreview.innerHTML = '';
        }

        document.getElementById('formTitle').textContent = 'Editar producto';
        document.getElementById('cancelEdit').style.display = 'inline-block';
        navigateTo('publish');
    };

    window.deleteProduct = function(id) {
        if (confirm('¿Eliminar este producto permanentemente?')) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('cs_products', JSON.stringify(products));
            renderDashboard();
            renderTable();
        }
    };
});
