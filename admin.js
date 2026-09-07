/* =========================================================
   COMPRA SPEED
   PANEL ADMINISTRADOR
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL = "https://wdmcwutfagjmvoooxqtq.supabase.co/rest/v1/";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbWN3dXRmYWdqbXZvb294cXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDAxMjEsImV4cCI6MjEwNDM3NjEyMX0.ok60WAQ6MdHBJKoX9anzREplV51w46SL5shdywKe8aY";


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
    document.getElementById(
        "loginSection"
    );

const adminSection =
    document.getElementById(
        "adminSection"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginError =
    document.getElementById(
        "loginError"
    );


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

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

    loginError.textContent = "";


    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY
    ) {

        loginError.textContent =
            "Configura SUPABASE_URL y SUPABASE_ANON_KEY en admin.js.";

        return;

    }


    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    try {

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


        if (!response.ok) {

            throw new Error(
                data.error_description ||
                data.msg ||
                "Email o contraseña incorrectos."
            );

        }


        session = data;


        localStorage.setItem(
            "compra_speed_admin_session",
            JSON.stringify(session)
        );


        showAdmin();

    }

    catch (error) {

        console.error(error);

        loginError.textContent =
            error.message;

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

    catch {

        localStorage.removeItem(
            "compra_speed_admin_session"
        );

    }

}


/* =========================================================
   MOSTRAR ADMIN
   ========================================================= */

async function showAdmin() {

    loginSection.style.display =
        "none";

    adminSection.style.display =
        "flex";


    await loadProducts();

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    document
        .getElementById("logoutButton")
        .addEventListener(
            "click",
            () => {

                session = null;

                localStorage.removeItem(
                    "compra_speed_admin_session"
                );

                adminSection.style.display =
                    "none";

                loginSection.style.display =
                    "flex";

            }
        );

}


/* =========================================================
   API HEADERS
   ========================================================= */

function authHeaders() {

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
                    headers:
                        authHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar los productos."
            );

        }


        adminProducts =
            await response.json();


        renderProductsTable();

        updateStats();

    }

    catch (error) {

        console.error(error);

        alert(
            "Error cargando productos: " +
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
            product => product.active
        ).length;


    const featured =
        adminProducts.filter(
            product => product.featured
        ).length;


    const out =
        adminProducts.filter(
            product =>
                Number(product.stock || 0) <= 0
        ).length;


    document.getElementById(
        "statTotal"
    ).textContent = total;


    document.getElementById(
        "statVisible"
    ).textContent = visible;


    document.getElementById(
        "statFeatured"
    ).textContent = featured;


    document.getElementById(
        "statOut"
    ).textContent = out;

}


/* =========================================================
   TABLA
   ========================================================= */

function renderProductsTable() {

    const table =
        document.getElementById(
            "productsTable"
        );


    table.innerHTML = "";


    adminProducts.forEach(product => {

        const row =
            document.createElement("tr");


        const image =
            product.image ||
            (
                Array.isArray(product.images) &&
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
                                🏷️ ${escapeHTML(product.badge)}
                            </small>
                          `
                        : ""
                }

            </td>


            <td>
                ${escapeHTML(product.category)}
            </td>


            <td>
                ${formatPrice(product.price)}
            </td>


            <td>
                ${Number(product.stock || 0)}
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
                        data-edit="${product.id}"
                    >
                        ✏️
                    </button>

                    <button
                        data-toggle="${product.id}"
                    >
                        👁️
                    </button>

                    <button
                        data-delete="${product.id}"
                        class="danger"
                    >
                        🗑️
                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);

    });


    table
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    editProduct(
                        button.dataset.edit
                    )
            );

        });


    table
        .querySelectorAll("[data-toggle]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    toggleProduct(
                        button.dataset.toggle
                    )
            );

        });


    table
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteProduct(
                        button.dataset.delete
                    )
            );

        });

}


/* =========================================================
   PUBLICAR / EDITAR
   ========================================================= */

function setupForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await saveProduct();

        }
    );


    document
        .getElementById(
            "productImages"
        )
        .addEventListener(
            "change",
            handleImages
        );


    document
        .getElementById(
            "cancelEdit"
        )
        .addEventListener(
            "click",
            resetForm
        );

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


function renderImagePreview() {

    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.innerHTML = "";


    selectedImages.forEach(
        file => {

            const url =
                URL.createObjectURL(file);


            const image =
                document.createElement("img");


            image.src = url;


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
                        file.type,

                    "x-upsert":
                        "false"

                },

                body: file
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


    message.textContent =
        "Guardando producto...";


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


                imageUrls.push(url);

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


        const allImages =
            [
                ...existingImages,
                ...imageUrls
            ];


        const payload = {

            name,

            price,

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
                error
            );

        }


        message.textContent =
            "✅ Producto guardado correctamente.";


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

        console.error(error);

        message.textContent =
            "❌ " +
            error.message;

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
        product.price || "";


    document.getElementById(
        "productOldPrice"
    ).value =
        product.old_price || "";


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


    document.getElementById(
        "formTitle"
    ).textContent =
        "Editar producto";


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


    preview.innerHTML = "";


    const images =
        editingProduct &&
        Array.isArray(
            editingProduct.images
        )
            ? editingProduct.images
            : [];


    images.forEach(url => {

        const image =
            document.createElement("img");


        image.src =
            url;


        preview.appendChild(
            image
        );

    });

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

            throw new Error(
                "No se pudo cambiar el estado."
            );

        }


        await loadProducts();

    }

    catch (error) {

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

            throw new Error(
                "No se pudo eliminar."
            );

        }


        await loadProducts();

    }

    catch (error) {

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


    document
        .getElementById(
            "productForm"
        )
        .reset();


    document.getElementById(
        "productId"
    ).value = "";


    document.getElementById(
        "productActive"
    ).checked = true;


    document.getElementById(
        "imagePreview"
    ).innerHTML = "";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Publicar producto";


    document.getElementById(
        "formMessage"
    ).textContent = "";

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


    select.innerHTML = "";


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


    container.innerHTML =
        CATEGORIES.map(
            category => `

                <div class="category-admin-card">

                    <span>
                        ${category.icon}
                    </span>

                    <strong>
                        ${escapeHTML(category.name)}
                    </strong>

                </div>

            `
        ).join("");

}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.page
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-go]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.go
                    );

                }
            );

        });

}


/* =========================================================
   MOSTRAR PÁGINA
   ========================================================= */

function showPage(page) {

    document
        .querySelectorAll(
            ".admin-page"
        )
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


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
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

}


/* =========================================================
   PRECIO
   ========================================================= */

function formatPrice(value) {

    return (
        Number(value || 0)
            .toLocaleString("es-CU")
        + " CUP"
    );

}


/* =========================================================
   ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
