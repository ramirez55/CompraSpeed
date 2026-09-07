# 🛍️ COMPRA SPEED PRO

Versión avanzada, rápida y sencilla de mantener. Es un sitio estático: funciona directamente en GitHub Pages.

## ⭐ La forma rápida de agregar productos

Todo se controla desde **`script.js`**.

Busca:

```js
const products = [
```

y copia un producto:

```js
,{
  id: 3,
  name: "Audífonos Bluetooth",
  price: "$25",
  category: "Tecnología",
  image: "productos/audifonos.jpg",
  description: "Audífonos inalámbricos."
}
```

### Fotos
Mete las fotos en la carpeta `productos/` y escribe su ruta:

`image: "productos/audifonos.jpg"`

No necesitas tocar HTML ni CSS.

### Categorías disponibles
- Perfumes
- Cuidado personal
- Tecnología
- Ropa y calzado
- Deportes
- Bebés
- Higiene

Si quieres otra categoría, agrégala en `categoryData` de `script.js`.

## 🚀 GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube `index.html`, `style.css`, `script.js` y la carpeta `productos`.
3. Ve a Settings → Pages.
4. Selecciona Deploy from a branch.
5. Elige `main` y `/ (root)`.
6. Guarda.

## 📲 WhatsApp

Ya está configurado para +53 54560076. Para cambiarlo:

```js
const WHATSAPP = "5354560076";
```

## ⚡ Rendimiento
- Sin framework pesado.
- Sin base de datos.
- Imágenes con `loading="lazy"`.
- CSS y JS separados y ligeros.
- GitHub Pages puede servirlo directamente.

## 📧 Contacto
darielramirezxlol2006@gmail.com
