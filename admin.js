/* =========================================================
   COMPRA SPEED
   PANEL ADMINISTRADOR
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://wdmcwutfagjmvoooxqtq.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_BWm-UjX3_XQzko8jhInLbg_duQuRuCd";


/* =========================================================
   ESTADO
   ========================================================= */

let session = null;

let adminProducts = [];

let selectedImages = [];

let editingProduct = null;


/* =========================================================
   CATEGORÍAS
   ========================================================= */

const CATEGORIES = [

    {
        name: "Perfumes",
        icon: "🌸"
    },

    {
        name: "Cuidado personal",
        icon: "🧴"
    },

    {
        name: "Tecnología",
        icon: "🎧"
    },

    {
        name: "Ropa y calzado",
        icon: "👟"
    },

    {
        name: "Deportes",
        icon: "🏋️"
    },

    {
        name: "Bebés",
        icon: "🍼"
    },

    {
        name: "Higiene",
        icon: "🧼"
    },

    {
        name: "Electrodomésticos",
        icon: "🏠"
    },

    {
        name: "Otros",
        icon: "📦"
    }

];


/* =========================================================
   DOM
   ========================================================= */

const loginSection =
    document.getElementById("loginSection");

const adminSection =
    document.getElementById("adminSection");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCategorySelect();

        renderAdminCategories();

        setupNavigation();

        setupForm();

        setupLogin();

        setupLogout();

        loadStoredSession();

    }
);


/* =========================================================
   LOGIN
   ========================================================= */

function setupLogin() {

    if (!loginForm) {
        console.error("No existe #loginForm en admin.html");
        return;
    }

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await login();

        }
    );

}


/* =========================================================
   LOGIN SUPABASE
   ========================================================= */

async function login() {

    if (loginError) {
        loginError.textContent = "";
    }


    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY
    ) {

        showLoginError(
            "Falta configurar Supabase."
        );

        return;

    }


    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");


    if (!emailInput || !passwordInput) {

        showLoginError(
            "No se encontraron los campos de login."
        );

        return;

    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showLoginError(
            "Escribe tu correo y contraseña."
        );

        return;

    }


    try {

        setLoginLoading(true);


        const response =
            await fetch(
                `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
                {
                    method: "POST",

                    headers: {
                        apikey:
                            SUPABASE_ANON_KEY,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Respuesta Supabase:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error_description ||
                data.msg ||
                data.message ||
                "Correo o contraseña incorrectos."
            );

        }


        if (!data.access_token) {

            throw new Error(
                "Supabase no devolvió un token de acceso."
            );

        }


        session = data;


        localStorage.setItem(
            "compra_speed_admin_session",
            JSON.stringify(session)
        );


        await showAdmin();

    }

    catch (error) {

        console.error(
            "ERROR LOGIN:",
            error
        );


        showLoginError(
            error.message ||
            "No se pudo iniciar sesión."
        );

    }

    finally {

        setLoginLoading(false);

    }

}


/* =========================================================
   ERROR LOGIN
   ========================================================= */

function showLoginError(message) {

    if (loginError) {

        loginError.textContent =
            message;

    }

}


/* =========================================================
   ESTADO BOTÓN LOGIN
   ========================================================= */

function setLoginLoading(loading) {

    const button =
        loginForm
            ? loginForm.querySelector(
                'button[type="submit"]'
            )
            : null;


    if (!button) return;


    if (loading) {

        button.disabled = true;

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            "Iniciando sesión...";

    }

    else {

        button.disabled = false;

        button.textContent =
            button.dataset.originalText ||
            "Iniciar sesión";

    }

}


/* =========================================================
   SESIÓN GUARDADA
   ========================================================= */

function loadStoredSession() {

    try {

        const saved =
            localStorage.getItem(
                "compra_speed_admin_session"
            );


        if (!saved) return;


        session =
            JSON.parse(saved);


        if (
            session &&
            session.access_token
        ) {

            showAdmin();

        }

    }

    catch (error) {

        console.error(
            "Sesión guardada inválida:",
            error
        );


        localStorage.removeItem(
            "compra_speed_admin_session"
        );

    }

}


/* =========================================================
   MOSTRAR ADMIN
   ========================================================= */

async function showAdmin() {

    if (loginSection) {

        loginSection.style.display =
            "none";

    }


    if (adminSection) {

        adminSection.style.display =
            "flex";

    }


    await loadProducts();

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) return;


    logoutButton.addEventListener(
        "click",
        () => {

            session = null;


            localStorage.removeItem(
                "compra_speed_admin_session"
            );


            if (adminSection) {

                adminSection.style.display =
                    "none";

            }


            if (loginSection) {

                loginSection.style.display =
                    "flex";

            }

        }
    );

}


/* =========================================================
   API HEADERS
   ========================================================= */

function authHeaders() {

    if (
        !session ||
        !session.access_token
    ) {

        throw new Error(
            "Sesión no válida. Inicia sesión nuevamente."
        );

    }


    return {

        apikey:
            SUPABASE_ANON_KEY,

        Authorization:
            `Bearer ${session.access_token}`,

        "Content-Type":
            "application/json"

    };

}


/* =========================================================
   CARGAR PRODUCTOS
   ========================================================= */

async function loadProducts() {

    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
                {
                    method: "GET",

                    headers:
                        authHeaders()

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "No se pudieron cargar los productos."
            );

        }


        adminProducts =
            await response.json();


        renderProductsTable();

        updateStats();

    }

    catch (error) {

        console.error(
            "ERROR PRODUCTOS:",
            error
        );


        alert(
            "Error cargando productos:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {

    const total =
        adminProducts.length;


    const visible =
        adminProducts.filter(
            product =>
                product.active
        ).length;


    const featured =
        adminProducts.filter(
            product =>
                product.featured
        ).length;


    const out =
        adminProducts.filter(
            product =>
                Number(product.stock || 0) <= 0
        ).length;


    const statTotal =
        document.getElementById(
            "statTotal"
        );


    const statVisible =
        document.getElementById(
            "statVisible"
        );


    const statFeatured =
        document.getElementById(
            "statFeatured"
        );


    const statOut =
        document.getElementById(
            "statOut"
        );


    if (statTotal) {
        statTotal.textContent =
            total;
    }


    if (statVisible) {
        statVisible.textContent =
            visible;
    }


    if (statFeatured) {
        statFeatured.textContent =
            featured;
    }


    if (statOut) {
        statOut.textContent =
            out;
    }

}


/* =========================================================
   TABLA
   ========================================================= */

function renderProductsTable() {

    const table =
        document.getElementById(
            "productsTable"
        );


    if (!table) return;


    table.innerHTML = "";


    adminProducts.forEach(
        product => {

            const row =
                document.createElement(
                    "tr"
                );


            const image =
                product.image ||
                (
                    Array.isArray(
                        product.images
                    ) &&
                    product.images.length
                        ? product.images[0]
                        : ""
                );


            row.innerHTML = `

                <td>

                    ${
                        image
                            ? `
                                <img
                                    class="table-image"
                                    src="${escapeAttribute(image)}"
                                    alt=""
                                >
                              `
                            : "🛍️"
                    }

                </td>


                <td>

                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>

                    ${
                        product.badge
                            ? `
                                <small>
                                    🏷️
                                    ${escapeHTML(product.badge)}
                                </small>
                              `
                            : ""
                    }

                </td>


                <td>
                    ${escapeHTML(product.category)}
                </td>


                <td>
                    ${formatPrice(
                        product.price,
                        product.currency
                    )}
                </td>


                <td>
                    ${Number(
                        product.stock || 0
                    )}
                </td>


                <td>

                    ${
                        product.active
                            ? `
                                <span class="status active">
                                    Visible
                                </span>
                              `
                            : `
                                <span class="status inactive">
                                    Oculto
                                </span>
                              `
                    }

                </td>


                <td>

                    <div class="table-actions">

                        <button
                            data-edit="${escapeAttribute(product.id)}"
                            type="button"
                        >
                            ✏️
                        </button>

                        <button
                            data-toggle="${escapeAttribute(product.id)}"
                            type="button"
                        >
                            👁️
                        </button>

                        <button
                            data-delete="${escapeAttribute(product.id)}"
                            class="danger"
                            type="button"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );


    table
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        editProduct(
                            button.dataset.edit
                        )
                );

            }
        );


    table
        .querySelectorAll(
            "[data-toggle]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        toggleProduct(
                            button.dataset.toggle
                        )
                );

            }
        );


    table
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        deleteProduct(
                            button.dataset.delete
                        )
                );

            }
        );

}


/* =========================================================
   PUBLICAR / EDITAR
   ========================================================= */

function setupForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await saveProduct();

        }
    );


    const imageInput =
        document.getElementById(
            "productImages"
        );


    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleImages
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelEdit"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            resetForm
        );

    }

}


/* =========================================================
   IMÁGENES
   ========================================================= */

function handleImages(event) {

    selectedImages =
        Array.from(
            event.target.files || []
        );


    renderImagePreview();

}


/* =========================================================
   PREVISUALIZAR IMÁGENES
   ========================================================= */

function renderImagePreview() {

    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!preview) return;


    preview.innerHTML = "";


    selectedImages.forEach(
        file => {

            const url =
                URL.createObjectURL(
                    file
                );


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                url;


            preview.appendChild(
                image
            );

        }
    );

}


/* =========================================================
   SUBIR IMAGEN
   ========================================================= */

async function uploadImage(file) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const filename =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;


    const path =
        filename;


    const response =
        await fetch(
            `${SUPABASE_URL}/storage/v1/object/productos/${path}`,
            {
                method: "POST",

                headers: {

                    apikey:
                        SUPABASE_ANON_KEY,

                    Authorization:
                        `Bearer ${session.access_token}`,

                    "Content-Type":
                        file.type || "application/octet-stream",

                    "x-upsert":
                        "false"

                },

                body:
                    file

            }
        );


    if (!response.ok) {

        const error =
            await response.text();


        throw new Error(
            "Error subiendo imagen: " +
            error
        );

    }


    return (
        `${SUPABASE_URL}/storage/v1/object/public/productos/${path}`
    );

}


/* =========================================================
   GUARDAR PRODUCTO
   ========================================================= */

async function saveProduct() {

    const message =
        document.getElementById(
            "formMessage"
        );


    if (message) {

        message.textContent =
            "Guardando producto...";

    }


    try {

        const id =
            document.getElementById(
                "productId"
            ).value;


        const name =
            document.getElementById(
                "productName"
            ).value.trim();


        const category =
            document.getElementById(
                "productCategory"
            ).value;


        const price =
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            );


        const currencyElement =
            document.getElementById(
                "productCurrency"
            );


        const currency =
            currencyElement
                ? currencyElement.value
                : "USD";


        const oldPriceValue =
            document.getElementById(
                "productOldPrice"
            ).value;


        const oldPrice =
            oldPriceValue
                ? Number(oldPriceValue)
                : null;


        const stock =
            Number(
                document.getElementById(
                    "productStock"
                ).value
            );


        const description =
            document.getElementById(
                "productDescription"
            ).value.trim();


        const badge =
            document.getElementById(
                "productBadge"
            ).value;


        const active =
            document.getElementById(
                "productActive"
            ).checked;


        const featured =
            document.getElementById(
                "productFeatured"
            ).checked;


        let imageUrls = [];


        if (selectedImages.length) {

            for (
                const image
                of selectedImages
            ) {

                const url =
                    await uploadImage(
                        image
                    );


                imageUrls.push(
                    url
                );

            }

        }


        let existingImages = [];


        if (
            editingProduct &&
            Array.isArray(
                editingProduct.images
            )
        ) {

            existingImages =
                editingProduct.images;

        }


        const allImages = [
            ...existingImages,
            ...imageUrls
        ];


        const payload = {

            name,

            price,

            currency,

            old_price:
                oldPrice,

            category,

            image:
                allImages[0] || null,

            images:
                allImages,

            description,

            stock,

            active,

            featured,

            badge

        };


        let response;


        if (id) {

            response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
                    {
                        method: "PATCH",

                        headers:
                            authHeaders(),

                        body:
                            JSON.stringify(
                                payload
                            )

                    }
                );

        }

        else {

            response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/products`,
                    {
                        method: "POST",

                        headers: {

                            ...authHeaders(),

                            Prefer:
                                "return=representation"

                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }
                );

        }


        if (!response.ok) {

            const error =
                await response.text();


            throw new Error(
                error ||
                "No se pudo guardar el producto."
            );

        }


        if (message) {

            message.textContent =
                "✅ Producto guardado correctamente.";

        }


        resetForm();


        await loadProducts();


        setTimeout(
            () => {

                showPage(
                    "products"
                );

            },
            700
        );

    }

    catch (error) {

        console.error(
            "ERROR GUARDANDO PRODUCTO:",
            error
        );


        if (message) {

            message.textContent =
                "❌ " +
                error.message;

        }

    }

}


/* =========================================================
   EDITAR
   ========================================================= */

function editProduct(id) {

    const product =
        adminProducts.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) return;


    editingProduct =
        product;


    document.getElementById(
        "productId"
    ).value =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productCategory"
    ).value =
        product.category || "Otros";


    document.getElementById(
        "productPrice"
    ).value =
        product.price ?? "";


    const currencyElement =
        document.getElementById(
            "productCurrency"
        );


    if (currencyElement) {

        currencyElement.value =
            product.currency || "USD";

    }


    document.getElementById(
        "productOldPrice"
    ).value =
        product.old_price ?? "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock ?? 0;


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productBadge"
    ).value =
        product.badge || "";


    document.getElementById(
        "productActive"
    ).checked =
        product.active !== false;


    document.getElementById(
        "productFeatured"
    ).checked =
        product.featured === true;


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    if (formTitle) {

        formTitle.textContent =
            "Editar producto";

    }


    selectedImages = [];


    renderExistingImages();


    showPage(
        "publish"
    );

}


/* =========================================================
   IMÁGENES EXISTENTES
   ========================================================= */

function renderExistingImages() {

    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (!preview) return;


    preview.innerHTML = "";


    const images =
        editingProduct &&
        Array.isArray(
            editingProduct.images
        )
            ? editingProduct.images
            : [];


    images.forEach(
        url => {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                url;


            preview.appendChild(
                image
            );

        }
    );

}


/* =========================================================
   MOSTRAR / OCULTAR
   ========================================================= */

async function toggleProduct(id) {

    const product =
        adminProducts.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) return;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
                {
                    method: "PATCH",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            active:
                                !product.active
                        })

                }
            );


        if (!response.ok) {

            const error =
                await response.text();


            throw new Error(
                error ||
                "No se pudo cambiar el estado."
            );

        }


        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


/* =========================================================
   ELIMINAR
   ========================================================= */

async function deleteProduct(id) {

    const product =
        adminProducts.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) return;


    const confirmed =
        confirm(
            `¿Eliminar "${product.name}"?`
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
                {
                    method: "DELETE",

                    headers:
                        authHeaders()

                }
            );


        if (!response.ok) {

            const error =
                await response.text();


            throw new Error(
                error ||
                "No se pudo eliminar."
            );

        }


        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetForm() {

    editingProduct =
        null;

    selectedImages =
        [];


    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {

        form.reset();

    }


    const productId =
        document.getElementById(
            "productId"
        );


    if (productId) {

        productId.value =
            "";

    }


    const productActive =
        document.getElementById(
            "productActive"
        );


    if (productActive) {

        productActive.checked =
            true;

    }


    const productCurrency =
        document.getElementById(
            "productCurrency"
        );


    if (productCurrency) {

        productCurrency.value =
            "USD";

    }


    const imagePreview =
        document.getElementById(
            "imagePreview"
        );


    if (imagePreview) {

        imagePreview.innerHTML =
            "";

    }


    const formTitle =
        document.getElementById(
            "formTitle"
        );


    if (formTitle) {

        formTitle.textContent =
            "Publicar producto";

    }


    const formMessage =
        document.getElementById(
            "formMessage"
        );


    if (formMessage) {

        formMessage.textContent =
            "";

    }

}


/* =========================================================
   SELECT CATEGORÍAS
   ========================================================= */

function renderCategorySelect() {

    const select =
        document.getElementById(
            "productCategory"
        );


    if (!select) return;


    select.innerHTML =
        "";


    CATEGORIES.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.name;


            option.textContent =
                `${category.icon} ${category.name}`;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   CATEGORÍAS ADMIN
   ========================================================= */

function renderAdminCategories() {

    const container =
        document.getElementById(
            "categoriesAdmin"
        );


    if (!container) return;


    container.innerHTML =
        CATEGORIES
            .map(
                category => `

                    <div class="category-admin-card">

                        <span>
                            ${category.icon}
                        </span>

                        <strong>
                            ${escapeHTML(
                                category.name
                            )}
                        </strong>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showPage(
                            button.dataset.page
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-go]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showPage(
                            button.dataset.go
                        );

                    }
                );

            }
        );

}


/* =========================================================
   MOSTRAR PÁGINA
   ========================================================= */

function showPage(page) {

    document
        .querySelectorAll(
            ".admin-page"
        )
        .forEach(
            section => {

                section.classList.remove(
                    "active"
                );

            }
        );


    const target =
        document.getElementById(
            `page-${page}`
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".sidebar-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.page === page
                );

            }
        );

}


/* =========================================================
   PRECIO
   ========================================================= */

function formatPrice(
    value,
    currency = "USD"
) {

    const money =
        Number(value || 0)
            .toLocaleString(
                "es-CU",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


    return `${money} ${currency || "USD"}`;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}
