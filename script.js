/* =========================================================
   COMPRA SPEED
   CATÁLOGO + CARRITO + SUPABASE
   ========================================================= */

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const WHATSAPP = "5354560076";

const SUPABASE_URL =
    "https://wdmcwutfagjmvoooxqtq.supabase.co";

/*
   IMPORTANTE:
   Pega aquí tu Publishable Key / anon public key.

   Supabase:
   Settings → API → Publishable key
*/
const SUPABASE_ANON_KEY =
    "sb_publishable_BWm-UjX3_XQzko8jhInLbg_duQuRuCd";


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
   ELEMENTOS DEL DOM
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

const navMenu =
    document.getElementById("navMenu");

const menuToggle =
    document.getElementById("menuToggle");


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
   CARGAR PRODUCTOS DESDE SUPABASE
   ========================================================= */

async function loadProducts() {

    /*
       Si todavía no se ha puesto la key,
       usamos productos locales.
    */

    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY ||
        SUPABASE_ANON_KEY ===
        "PEGA_AQUI_TU_PUBLISHABLE_KEY"
    ) {

        console.warn(
            "Supabase no está configurado. Usando productos locales."
        );

        products = LOCAL_PRODUCTS;

        renderProducts();

        return;
    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=created_at.desc`,
                {
                    method: "GET",

                    headers: {
                        apikey:
                            SUPABASE_ANON_KEY,

                        Authorization:
                            `Bearer ${SUPABASE_ANON_KEY}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Error Supabase:",
                errorText
            );

            throw new Error(
                "No se pudieron cargar los productos."
            );
        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            products = data;

        } else {

            products = LOCAL_PRODUCTS;
        }


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        /*
           Si Supabase falla,
           mostramos los productos locales.
        */

        products = LOCAL_PRODUCTS;
    }


    renderProducts();
}


/* =========================================================
   CATEGORÍAS
   ========================================================= */

function renderCategories() {

    if (!categoriesContainer) {
        return;
    }


    categoriesContainer.innerHTML = "";


    CATEGORIES.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            /*
               Compatible con el HTML/CSS
            */

            button.className =
                "category-button";


            if (
                category.name ===
                currentCategory
            ) {

                button.classList.add(
                    "active"
                );
            }


            button.type = "button";


            button.innerHTML = `
                <span class="category-icon">
                    ${category.icon}
                </span>

                <span>
                    ${escapeHTML(category.name)}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    currentCategory =
                        category.name;

                    renderCategories();

                    renderProducts();
                }
            );


            categoriesContainer.appendChild(
                button
            );
        }
    );
}


/* =========================================================
   FILTRAR PRODUCTOS
   ========================================================= */

function getFilteredProducts() {

    let result =
        [...products];


    /*
       FILTRO POR CATEGORÍA
    */

    if (
        currentCategory !==
        "Todos"
    ) {

        result =
            result.filter(
                product =>
                    String(
                        product.category || ""
                    ) === currentCategory
            );
    }


    /*
       BUSCADOR
    */

    if (searchTerm) {

        const search =
            searchTerm.toLowerCase();


        result =
            result.filter(
                product => {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const category =
                        String(
                            product.category || ""
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        description.includes(search) ||
                        category.includes(search)
                    );
                }
            );
    }


    /*
       ORDENAMIENTO
    */

    switch (sortMode) {

        case "az":

            result.sort(
                (a, b) =>
                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        ),
                        "es"
                    )
            );

            break;


        case "za":

            result.sort(
                (a, b) =>
                    String(
                        b.name || ""
                    ).localeCompare(
                        String(
                            a.name || ""
                        ),
                        "es"
                    )
            );

            break;


        case "price-low":

            result.sort(
                (a, b) =>
                    Number(
                        a.price || 0
                    ) -
                    Number(
                        b.price || 0
                    )
            );

            break;


        case "price-high":

            result.sort(
                (a, b) =>
                    Number(
                        b.price || 0
                    ) -
                    Number(
                        a.price || 0
                    )
            );

            break;


        case "newest":

            result.sort(
                (a, b) =>
                    new Date(
                        b.created_at || 0
                    ) -
                    new Date(
                        a.created_at || 0
                    )
            );

            break;
    }


    return result;
}


/* =========================================================
   MOSTRAR PRODUCTOS
   ========================================================= */

function renderProducts() {

    if (!productsGrid) {
        return;
    }


    const filtered =
        getFilteredProducts();


    productsGrid.innerHTML = "";


    if (!filtered.length) {

        if (emptyProducts) {

            emptyProducts.style.display =
                "block";
        }

        return;
    }


    if (emptyProducts) {

        emptyProducts.style.display =
            "none";
    }


    filtered.forEach(
        product => {

            productsGrid.appendChild(
                createProductCard(product)
            );
        }
    );
}


/* =========================================================
   CREAR TARJETA DE PRODUCTO
   ========================================================= */

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    const image =
        getProductImage(product);


    const stock =
        Number(
            product.stock || 0
        );


    const outOfStock =
        stock <= 0;


    const price =
        formatPrice(
            product.price
        );


    const oldPrice =
        product.old_price
            ? formatPrice(
                product.old_price
            )
            : "";


    const badge =
        product.badge
            ? `
                <span class="product-badge">
                    ${escapeHTML(
                        product.badge
                    )}
                </span>
              `
            : "";


    card.innerHTML = `

        <div class="product-image">

            ${
                image
                    ? `
                        <img
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(product.name || "Producto")}"
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
                ${escapeHTML(
                    product.category ||
                    "Otros"
                )}
            </small>


            <h3>
                ${escapeHTML(
                    product.name ||
                    "Producto"
                )}
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
                    ${
                        outOfStock
                            ? "disabled"
                            : ""
                    }
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


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () =>
                openProduct(product)
        );
    }


    if (cartButton) {

        cartButton.addEventListener(
            "click",
            () =>
                addToCart(product)
        );
    }


    if (whatsappButton) {

        whatsappButton.addEventListener(
            "click",
            () =>
                sendProductWhatsApp(
                    product
                )
        );
    }


    return card;
}


/* =========================================================
   OBTENER IMAGEN
   ========================================================= */

function getProductImage(product) {

    if (
        product &&
        product.image
    ) {

        return product.image;
    }


    if (
        product &&
        Array.isArray(
            product.images
        ) &&
        product.images.length
    ) {

        return product.images[0];
    }


    return "";
}


/* =========================================================
   MODAL DE PRODUCTO
   ========================================================= */

function openProduct(product) {

    if (!productModal ||
        !productDetails) {

        return;
    }


    const image =
        getProductImage(product);


    const stock =
        Number(
            product.stock || 0
        );


    productDetails.innerHTML = `

        <div class="product-detail">


            <div class="product-detail-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(product.name || "Producto")}"
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
                    ${escapeHTML(
                        product.category ||
                        "Otros"
                    )}
                </span>


                <h2>
                    ${escapeHTML(
                        product.name ||
                        "Producto"
                    )}
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
                        ${formatPrice(
                            product.price
                        )}
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
                        ${
                            stock <= 0
                                ? "disabled"
                                : ""
                        }
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
        document.getElementById(
            "detailCart"
        );


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


    if (detailWhatsApp) {

        detailWhatsApp.addEventListener(
            "click",
            () =>
                sendProductWhatsApp(
                    product
                )
        );
    }


    productModal.classList.add(
        "open"
    );


    productModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );
}


/* =========================================================
   CERRAR MODAL PRODUCTO
   ========================================================= */

function closeProduct() {

    if (!productModal) {
        return;
    }


    productModal.classList.remove(
        "open"
    );


    productModal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !cartModal ||
        !cartModal.classList.contains(
            "open"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );
    }
}


/* =========================================================
   WHATSAPP PRODUCTO
   ========================================================= */

function sendProductWhatsApp(
    product
) {

    const message =
        `Hola COMPRA SPEED 👋

Estoy interesado en:

🛍️ ${product.name || "Producto"}

📂 Categoría:
${product.category || "Otros"}

💰 Precio:
${formatPrice(product.price)}

¿Está disponible?`;


    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            message
        )}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
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


        if (!saved) {
            return [];
        }


        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];


    } catch (error) {

        console.error(
            "Error cargando carrito:",
            error
        );

        return [];
    }
}


/* =========================================================
   GUARDAR CARRITO
   ========================================================= */

function saveCart() {

    try {

        localStorage.setItem(
            "compra_speed_cart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "No se pudo guardar el carrito:",
            error
        );
    }
}


/* =========================================================
   AÑADIR AL CARRITO
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

    } else {

        cart.push({

            id: product.id,

            name:
                product.name ||
                "Producto",

            price:
                Number(
                    product.price || 0
                ),

            image:
                getProductImage(
                    product
                ),

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
   CAMBIAR CANTIDAD
   ========================================================= */

function changeQuantity(
    id,
    amount
) {

    const item =
        cart.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!item) {
        return;
    }


    item.quantity += amount;


    if (
        item.quantity <= 0
    ) {

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
   ELIMINAR PRODUCTO
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

    showToast(
        "Producto eliminado 🗑️"
    );
}


/* =========================================================
   CONTADOR CARRITO
   ========================================================= */

function updateCartCount() {

    if (!cartCount) {
        return;
    }


    const count =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    cartCount.textContent =
        count;
}


/* =========================================================
   MOSTRAR CARRITO
   ========================================================= */

function renderCart() {

    if (!cartBody) {
        return;
    }


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
        cart.map(
            item => {

                const subtotal =
                    Number(
                        item.price || 0
                    ) *
                    Number(
                        item.quantity || 0
                    );


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
                                ${escapeHTML(
                                    item.name
                                )}
                            </h4>


                            <strong>
                                ${formatPrice(
                                    item.price
                                )}
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
                            aria-label="Eliminar"
                        >
                            🗑️
                        </button>

                    </div>
                `;
            }
        ).join("");


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
        .querySelectorAll(
            "[data-minus]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        changeQuantity(
                            button.dataset.minus,
                            -1
                        )
                );
            }
        );


    cartBody
        .querySelectorAll(
            "[data-plus]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        changeQuantity(
                            button.dataset.plus,
                            1
                        )
                );
            }
        );


    cartBody
        .querySelectorAll(
            "[data-remove]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        removeFromCart(
                            button.dataset.remove
                        )
                );
            }
        );


    const sendCartButton =
        document.getElementById(
            "sendCart"
        );


    if (sendCartButton) {

        sendCartButton.addEventListener(
            "click",
            sendCart
        );
    }
}


/* =========================================================
   ENVIAR CARRITO POR WHATSAPP
   ========================================================= */

function sendCart() {

    if (!cart.length) {
        return;
    }


    let message =
        `Hola COMPRA SPEED 👋

Quiero realizar este pedido:

`;


    let total = 0;


    cart.forEach(
        item => {

            const subtotal =
                Number(
                    item.price || 0
                ) *
                Number(
                    item.quantity || 0
                );


            total += subtotal;


            message +=
                `🛍️ ${item.name}
Cantidad: ${item.quantity}
Precio: ${formatPrice(item.price)}
Subtotal: ${formatPrice(subtotal)}

`;
        }
    );


    message +=
        `💰 TOTAL: ${formatPrice(total)}

¿Podrían confirmarme disponibilidad?`;


    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            message
        )}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   ABRIR CARRITO
   ========================================================= */

function openCart() {

    if (!cartModal) {
        return;
    }


    renderCart();


    cartModal.classList.add(
        "open"
    );


    cartModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );
}


/* =========================================================
   CERRAR CARRITO
   ========================================================= */

function closeCart() {

    if (!cartModal) {
        return;
    }


    cartModal.classList.remove(
        "open"
    );


    cartModal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !productModal ||
        !productModal.classList.contains(
            "open"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );
    }
}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {

    /*
       BUSCADOR
    */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            event => {

                searchTerm =
                    event.target.value
                        .trim();

                renderProducts();
            }
        );
    }


    /*
       ORDENAMIENTO
    */

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            event => {

                sortMode =
                    event.target.value;

                renderProducts();
            }
        );
    }


    /*
       ABRIR CARRITO
    */

    const openCartButton =
        document.getElementById(
            "openCart"
        );


    if (openCartButton) {

        openCartButton.addEventListener(
            "click",
            openCart
        );
    }


    /*
       CERRAR CARRITO
    */

    const closeCartButton =
        document.getElementById(
            "closeCart"
        );


    if (closeCartButton) {

        closeCartButton.addEventListener(
            "click",
            closeCart
        );
    }


    /*
       CERRAR PRODUCTO
    */

    const closeModalButton =
        document.getElementById(
            "closeModal"
        );


    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeProduct
        );
    }


    /*
       OVERLAY PRODUCTO
    */

    const modalOverlay =
        document.getElementById(
            "modalOverlay"
        );


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeProduct
        );
    }


    /*
       OVERLAY CARRITO
    */

    const cartOverlay =
        document.getElementById(
            "cartOverlay"
        );


    if (cartOverlay) {

        cartOverlay.addEventListener(
            "click",
            closeCart
        );
    }


    /*
       MENÚ MÓVIL
    */

    if (
        menuToggle &&
        navMenu
    ) {

        menuToggle.addEventListener(
            "click",
            () => {

                navMenu.classList.toggle(
                    "active"
                );

                const expanded =
                    navMenu.classList.contains(
                        "active"
                    );

                menuToggle.setAttribute(
                    "aria-expanded",
                    expanded
                );
            }
        );


        /*
           Cerrar menú al pulsar
           un enlace
        */

        navMenu
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () => {

                            navMenu.classList.remove(
                                "active"
                            );

                            menuToggle.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    );
                }
            );
    }


    /*
       TECLA ESC
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeProduct();

                closeCart();


                if (navMenu) {

                    navMenu.classList.remove(
                        "active"
                    );
                }
            }
        }
    );
}


/* =========================================================
   FORMATEAR PRECIO
   ========================================================= */

function formatPrice(value) {

    const number =
        Number(value || 0);


    return (
        number.toLocaleString(
            "es-CU"
        ) +
        " USD"
    );
}


/* =========================================================
   ESCAPAR HTML
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
   ESCAPAR ATRIBUTOS
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =========================================================
   NOTIFICACIÓN
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
        document.createElement(
            "div"
        );


    toast.className =
        "cs-toast";


    toast.textContent =
        message;


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.classList.add(
                "show"
            );

        },
        10
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    if (
                        toast.parentNode
                    ) {

                        toast.remove();
                    }

                },
                300
            );

        },
        2500
    );
}
