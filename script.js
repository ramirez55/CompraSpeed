/* =========================================================
   COMPRA SPEED
   CATÁLOGO + CARRITO + SUPABASE
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const WHATSAPP = "5354560076";

const SUPABASE_URL = "";

const SUPABASE_ANON_KEY = "";


/* =========================================================
   CATEGORÍAS
   ========================================================= */

const CATEGORIES = [

    {
        name: "Todos",
        icon: "✨"
    },

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
   PRODUCTOS LOCALES DE RESPALDO
   ========================================================= */

const LOCAL_PRODUCTS = [

    {
        id: 1,

        name: "Producto de ejemplo",

        price: 0,

        old_price: null,

        category: "Tecnología",

        image: "",

        images: [],

        description:
            "Agrega tus productos desde el panel de administración.",

        stock: 0,

        active: true,

        featured: false,

        badge: "",

        created_at: new Date().toISOString()
    },


    {
        id: 2,

        name: "Bonabel Agua Orquideas",

        price: 1700,

        old_price: null,

        category: "Perfumes",

        image: "productos/Bonabel.jpg",

        images: [
            "productos/Bonabel.jpg"
        ],

        description:
            "Bonabel Agua Orquideas.",

        stock: 10,

        active: true,

        featured: true,

        badge: "Popular",

        created_at: new Date().toISOString()
    }

];


/* =========================================================
   ESTADO
   ========================================================= */

let products = [];

let currentCategory = "Todos";

let searchTerm = "";

let sortMode = "default";

let cart = loadCart();


/* =========================================================
   DOM
   ========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const categoriesContainer =
    document.getElementById("categories");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const emptyProducts =
    document.getElementById("emptyProducts");

const productModal =
    document.getElementById("productModal");

const productDetails =
    document.getElementById("productDetails");

const cartModal =
    document.getElementById("cartModal");

const cartBody =
    document.getElementById("cartBody");

const cartCount =
    document.getElementById("cartCount");


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        renderCategories();

        setupEvents();

        await loadProducts();

        updateCartCount();

        renderCart();

        const year =
            document.getElementById("year");

        if (year) {
            year.textContent =
                new Date().getFullYear();
        }

    }
);


/* =========================================================
   CARGAR PRODUCTOS
   ========================================================= */

async function loadProducts() {

    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY
    ) {

        products = LOCAL_PRODUCTS;

        renderProducts();

        return;
    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=created_at.desc`,
                {
                    headers: {
                        apikey: SUPABASE_ANON_KEY,

                        Authorization:
                            `Bearer ${SUPABASE_ANON_KEY}`
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar los productos."
            );

        }


        const data =
            await response.json();


        products =
            Array.isArray(data)
                ? data
                : LOCAL_PRODUCTS;


    }

    catch (error) {

        console.error(error);

        products =
            LOCAL_PRODUCTS;

    }


    renderProducts();

}


/* =========================================================
   CATEGORÍAS
   ========================================================= */

function renderCategories() {

    categoriesContainer.innerHTML = "";

    CATEGORIES.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            "category-button";

        if (
            category.name === currentCategory
        ) {

            button.classList.add("active");

        }


        button.innerHTML =
            `${category.icon} ${category.name}`;


        button.addEventListener(
            "click",
            () => {

                currentCategory =
                    category.name;

                renderCategories();

                renderProducts();

            }
        );


        categoriesContainer.appendChild(button);

    });

}


/* =========================================================
   FILTRAR PRODUCTOS
   ========================================================= */

function getFilteredProducts() {

    let result =
        [...products];


    if (
        currentCategory !== "Todos"
    ) {

        result =
            result.filter(
                product =>
                    product.category ===
                    currentCategory
            );

    }


    if (searchTerm) {

        const search =
            searchTerm.toLowerCase();


        result =
            result.filter(product => {

                return (

                    String(
                        product.name || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        product.description || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        product.category || ""
                    )
                        .toLowerCase()
                        .includes(search)

                );

            });

    }


    switch (sortMode) {

        case "az":

            result.sort(
                (a, b) =>
                    String(a.name)
                        .localeCompare(
                            String(b.name),
                            "es"
                        )
            );

            break;


        case "za":

            result.sort(
                (a, b) =>
                    String(b.name)
                        .localeCompare(
                            String(a.name),
                            "es"
                        )
            );

            break;


        case "price-low":

            result.sort(
                (a, b) =>
                    Number(a.price || 0) -
                    Number(b.price || 0)
            );

            break;


        case "price-high":

            result.sort(
                (a, b) =>
                    Number(b.price || 0) -
                    Number(a.price || 0)
            );

            break;


        case "newest":

            result.sort(
                (a, b) =>
                    new Date(b.created_at || 0) -
                    new Date(a.created_at || 0)
            );

            break;

    }


    return result;

}


/* =========================================================
   RENDER PRODUCTOS
   ========================================================= */

function renderProducts() {

    const filtered =
        getFilteredProducts();


    productsGrid.innerHTML = "";


    if (!filtered.length) {

        emptyProducts.style.display =
            "block";

        return;

    }


    emptyProducts.style.display =
        "none";


    filtered.forEach(product => {

        productsGrid.appendChild(
            createProductCard(product)
        );

    });

}


/* =========================================================
   CARD
   ========================================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "product-card";


    const image =
        getProductImage(product);


    const stock =
        Number(product.stock || 0);


    const outOfStock =
        stock <= 0;


    const price =
        formatPrice(product.price);


    const oldPrice =
        product.old_price
            ? formatPrice(product.old_price)
            : "";


    const badge =
        product.badge
            ? `
                <span class="product-badge">
                    ${escapeHTML(product.badge)}
                </span>
              `
            : "";


    card.innerHTML = `

        <div class="product-image">

            ${image
                ? `
                    <img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(product.name)}"
                        loading="lazy"
                    >
                  `
                : `
                    <div class="no-image">
                        🛍️
                    </div>
                  `
            }

            ${badge}

        </div>


        <div class="product-info">

            <small>
                ${escapeHTML(product.category || "Otros")}
            </small>

            <h3>
                ${escapeHTML(product.name || "Producto")}
            </h3>

            ${
                product.description
                    ? `
                        <p>
                            ${escapeHTML(
                                product.description
                            )}
                        </p>
                      `
                    : ""
            }


            <div class="product-price">

                ${
                    oldPrice
                        ? `
                            <del>
                                ${oldPrice}
                            </del>
                          `
                        : ""
                }

                <strong>
                    ${price}
                </strong>

            </div>


            <div class="stock">

                ${
                    outOfStock
                        ? "❌ Agotado"
                        : `📦 Disponible: ${stock}`
                }

            </div>


            <div class="product-actions">

                <button
                    class="btn-view"
                    type="button"
                    data-action="view"
                >
                    👁️ Ver
                </button>


                <button
                    class="btn-cart"
                    type="button"
                    data-action="cart"
                    ${outOfStock ? "disabled" : ""}
                >
                    🛒
                </button>


                <button
                    class="btn-whatsapp"
                    type="button"
                    data-action="whatsapp"
                >
                    💬
                </button>

            </div>

        </div>

    `;


    const viewButton =
        card.querySelector(
            '[data-action="view"]'
        );


    const cartButton =
        card.querySelector(
            '[data-action="cart"]'
        );


    const whatsappButton =
        card.querySelector(
            '[data-action="whatsapp"]'
        );


    viewButton.addEventListener(
        "click",
        () => openProduct(product)
    );


    if (cartButton) {

        cartButton.addEventListener(
            "click",
            () => addToCart(product)
        );

    }


    whatsappButton.addEventListener(
        "click",
        () => sendProductWhatsApp(product)
    );


    return card;

}


/* =========================================================
   IMAGEN
   ========================================================= */

function getProductImage(product) {

    if (product.image) {
        return product.image;
    }


    if (
        Array.isArray(product.images) &&
        product.images.length
    ) {

        return product.images[0];

    }


    return "";

}


/* =========================================================
   MODAL PRODUCTO
   ========================================================= */

function openProduct(product) {

    const image =
        getProductImage(product);


    const stock =
        Number(product.stock || 0);


    productDetails.innerHTML = `

        <div class="product-detail">

            <div class="product-detail-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(product.name)}"
                            >
                          `
                        : `
                            <div class="no-image">
                                🛍️
                            </div>
                          `
                }

            </div>


            <div class="product-detail-info">

                <span>
                    ${escapeHTML(product.category || "Otros")}
                </span>


                <h2>
                    ${escapeHTML(product.name)}
                </h2>


                ${
                    product.description
                        ? `
                            <p>
                                ${escapeHTML(
                                    product.description
                                )}
                            </p>
                          `
                        : ""
                }


                <div class="detail-price">

                    ${
                        product.old_price
                            ? `
                                <del>
                                    ${formatPrice(
                                        product.old_price
                                    )}
                                </del>
                              `
                            : ""
                    }

                    <strong>
                        ${formatPrice(product.price)}
                    </strong>

                </div>


                <p>
                    ${
                        stock > 0
                            ? `📦 Disponible: ${stock}`
                            : "❌ Producto agotado"
                    }
                </p>


                <div class="detail-actions">

                    <button
                        id="detailCart"
                        type="button"
                        ${stock <= 0 ? "disabled" : ""}
                    >
                        🛒 Añadir al carrito
                    </button>


                    <button
                        id="detailWhatsApp"
                        type="button"
                    >
                        💬 Pedir por WhatsApp
                    </button>

                </div>

            </div>

        </div>

    `;


    const detailCart =
        document.getElementById("detailCart");


    const detailWhatsApp =
        document.getElementById(
            "detailWhatsApp"
        );


    if (detailCart) {

        detailCart.addEventListener(
            "click",
            () => {

                addToCart(product);

                closeProduct();

            }
        );

    }


    detailWhatsApp.addEventListener(
        "click",
        () => sendProductWhatsApp(product)
    );


    productModal.classList.add("show");

    productModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   CERRAR PRODUCTO
   ========================================================= */

function closeProduct() {

    productModal.classList.remove("show");

    productModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   WHATSAPP PRODUCTO
   ========================================================= */

function sendProductWhatsApp(product) {

    const message =

        `Hola COMPRA SPEED 👋%0A%0A` +

        `Estoy interesado en:%0A` +

        `🛍️ ${product.name}%0A` +

        `📂 Categoría: ${product.category || "Otros"}%0A` +

        `💰 Precio: ${formatPrice(product.price)}%0A%0A` +

        `¿Está disponible?`;



    window.open(
        `https://wa.me/${WHATSAPP}?text=${message}`,
        "_blank"
    );

}


/* =========================================================
   CARRITO
   ========================================================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                "compra_speed_cart"
            );


        return saved
            ? JSON.parse(saved)
            : [];

    }

    catch {

        return [];

    }

}


/* =========================================================
   GUARDAR CARRITO
   ========================================================= */

function saveCart() {

    localStorage.setItem(
        "compra_speed_cart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   AGREGAR
   ========================================================= */

function addToCart(product) {

    const existing =
        cart.find(
            item =>
                String(item.id) ===
                String(product.id)
        );


    if (existing) {

        existing.quantity += 1;

    }

    else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price || 0),

            image: getProductImage(product),

            quantity: 1

        });

    }


    saveCart();

    updateCartCount();

    renderCart();

    showToast(
        "Producto añadido al carrito 🛒"
    );

}


/* =========================================================
   CANTIDAD
   ========================================================= */

function changeQuantity(id, amount) {

    const item =
        cart.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

    }


    saveCart();

    updateCartCount();

    renderCart();

}


/* =========================================================
   ELIMINAR
   ========================================================= */

function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveCart();

    updateCartCount();

    renderCart();

}


/* =========================================================
   CONTADOR
   ========================================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );


    cartCount.textContent =
        count;

}


/* =========================================================
   RENDER CARRITO
   ========================================================= */

function renderCart() {

    if (!cart.length) {

        cartBody.innerHTML = `

            <div class="empty-cart">

                <div>
                    🛒
                </div>

                <h3>
                    Tu carrito está vacío
                </h3>

                <p>
                    Añade productos para comenzar.
                </p>

            </div>

        `;

        return;

    }


    let total = 0;


    const itemsHTML =
        cart.map(item => {

            const subtotal =
                Number(item.price) *
                Number(item.quantity);


            total += subtotal;


            return `

                <div class="cart-item">

                    ${
                        item.image
                            ? `
                                <img
                                    src="${escapeAttribute(item.image)}"
                                    alt="${escapeAttribute(item.name)}"
                                >
                              `
                            : `
                                <div class="cart-no-image">
                                    🛍️
                                </div>
                              `
                    }


                    <div class="cart-item-info">

                        <h4>
                            ${escapeHTML(item.name)}
                        </h4>

                        <strong>
                            ${formatPrice(item.price)}
                        </strong>


                        <div class="cart-quantity">

                            <button
                                type="button"
                                data-minus="${escapeAttribute(item.id)}"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                type="button"
                                data-plus="${escapeAttribute(item.id)}"
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="remove-cart"
                        data-remove="${escapeAttribute(item.id)}"
                    >
                        🗑️
                    </button>

                </div>

            `;

        }).join("");


    cartBody.innerHTML = `

        <div class="cart-list">

            ${itemsHTML}

        </div>


        <div class="cart-total">

            <span>
                Total
            </span>

            <strong>
                ${formatPrice(total)}
            </strong>

        </div>


        <button
            id="sendCart"
            class="send-cart"
            type="button"
        >
            💬 Enviar pedido por WhatsApp
        </button>

    `;


    cartBody
        .querySelectorAll("[data-minus]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    changeQuantity(
                        button.dataset.minus,
                        -1
                    )
            );

        });


    cartBody
        .querySelectorAll("[data-plus]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    changeQuantity(
                        button.dataset.plus,
                        1
                    )
            );

        });


    cartBody
        .querySelectorAll("[data-remove]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    removeFromCart(
                        button.dataset.remove
                    )
            );

        });


    document
        .getElementById("sendCart")
        .addEventListener(
            "click",
            sendCart
        );

}


/* =========================================================
   ENVIAR CARRITO
   ========================================================= */

function sendCart() {

    if (!cart.length) return;


    let message =
        "Hola COMPRA SPEED 👋%0A%0A" +
        "Quiero realizar este pedido:%0A%0A";


    let total = 0;


    cart.forEach(item => {

        const subtotal =
            Number(item.price) *
            Number(item.quantity);


        total += subtotal;


        message +=
            `🛍️ ${item.name}%0A` +

            `Cantidad: ${item.quantity}%0A` +

            `Precio: ${formatPrice(item.price)}%0A` +

            `Subtotal: ${formatPrice(subtotal)}%0A%0A`;

    });


    message +=
        `💰 TOTAL: ${formatPrice(total)}%0A%0A` +

        "¿Podrían confirmarme disponibilidad?";


    window.open(
        `https://wa.me/${WHATSAPP}?text=${message}`,
        "_blank"
    );

}


/* =========================================================
   MODAL CARRITO
   ========================================================= */

function openCart() {

    renderCart();

    cartModal.classList.add("show");

    cartModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeCart() {

    cartModal.classList.remove("show");

    cartModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    searchInput.addEventListener(
        "input",
        event => {

            searchTerm =
                event.target.value.trim();

            renderProducts();

        }
    );


    sortSelect.addEventListener(
        "change",
        event => {

            sortMode =
                event.target.value;

            renderProducts();

        }
    );


    document
        .getElementById("openCart")
        .addEventListener(
            "click",
            openCart
        );


    document
        .getElementById("closeCart")
        .addEventListener(
            "click",
            closeCart
        );


    document
        .getElementById("closeModal")
        .addEventListener(
            "click",
            closeProduct
        );


    document
        .getElementById("modalOverlay")
        .addEventListener(
            "click",
            closeProduct
        );


    document
        .getElementById("cartOverlay")
        .addEventListener(
            "click",
            closeCart
        );


    document
        .getElementById("menuToggle")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("navMenu")
                    .classList.toggle("show");

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeProduct();

                closeCart();

            }

        }
    );

}


/* =========================================================
   UTILIDADES
   ========================================================= */

function formatPrice(value) {

    const number =
        Number(value || 0);


    return (
        number.toLocaleString(
            "es-CU"
        ) + " CUP"
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const old =
        document.querySelector(
            ".cs-toast"
        );


    if (old) {
        old.remove();
    }


    const toast =
        document.createElement("div");


    toast.className =
        "cs-toast";


    toast.textContent =
        message;


    document.body.appendChild(toast);


    setTimeout(
        () => toast.classList.add("show"),
        10
    );


    setTimeout(
        () => {

            toast.classList.remove("show");

            setTimeout(
                () => toast.remove(),
                300
            );

        },
        2500
    );

}
