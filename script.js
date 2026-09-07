/*
  ==========================================================
  🚀 COMPRA SPEED — AGREGA PRODUCTOS AQUÍ
  ==========================================================
  Para añadir un producto SOLO copia un bloque, cambia los
  datos y pon tu foto dentro de /productos/.

  Ejemplo de imagen:
  image: "productos/iphone-13.jpg"
  ==========================================================
*/
const WHATSAPP = "5354560076";

const products = [
  {
    id: 1,
    name: "Producto de ejemplo",
    price: "$0",
    category: "Tecnología",
    image: "",
    description: "Cambia este producto por uno de los tuyos."
  },
  {
    id: 2,
    name: "Bonabel Agua Orquideas",
    price: "1700",
    category: "Perfumes",
    image: "",
    description: "Puedes agregar tantos productos como quieras."
  }

  /*
  COPIA DESDE AQUÍ PARA AGREGAR MÁS:

  ,{
    id: 3,
    name: "Nombre del producto",
    price: "$25",
    category: "Tecnología",
    image: "productos/nombre-foto.jpg",
    description: "Descripción corta del producto."
  }
  */
];

const categoryData = [
  ["Todos","✨"],["Perfumes","🌸"],["Cuidado personal","🧴"],["Tecnología","🎧"],
  ["Ropa y calzado","👟"],["Deportes","🏋️"],["Bebés","🍼"],["Higiene","🧼"]
];

let activeCategory = "Todos";

const $ = s => document.querySelector(s);
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function wa(p){return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola COMPRA SPEED, estoy interesado en "${p.name}". Precio: ${p.price}. ¿Está disponible?`)}`;}

function renderCats(){
  $("#cats").innerHTML = categoryData.map(([n,i])=>`<button class="cat ${n===activeCategory?"active":""}" data-cat="${esc(n)}"><i>${i}</i>${esc(n)}</button>`).join("");
  document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderCats();render();});
}

function render(){
  const q=$("#search").value.trim().toLowerCase();
  let list=products.filter(p=>(activeCategory==="Todos"||p.category===activeCategory)&&`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q));
  const sort=$("#sort").value;
  if(sort==="az")list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="za")list.sort((a,b)=>b.name.localeCompare(a.name));
  $("#count").textContent=`${list.length} producto${list.length!==1?"s":""}`;
  $("#empty").hidden=list.length>0;
  $("#grid").innerHTML=list.map(p=>`
    <article class="card">
      <div class="photo">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="placeholder">🛍️</div>`}<span class="tag">${esc(p.category)}</span></div>
      <div class="info"><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="price">${esc(p.price)}</div>
      <div class="card-actions"><button class="mini" onclick="openProduct(${p.id})">Ver detalles</button><a class="mini buy" href="${wa(p)}" target="_blank" rel="noopener">WhatsApp</a></div></div>
    </article>`).join("");
}
function openProduct(id){
 const p=products.find(x=>x.id===id);if(!p)return;
 $("#modalBody").innerHTML=`<div class="detail">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}">`:`<div class="big">🛍️</div>`}<div><small>${esc(p.category)}</small><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><div class="dprice">${esc(p.price)}</div><a class="btn orange" href="${wa(p)}" target="_blank" rel="noopener">💬 Pedir por WhatsApp</a></div></div>`;
 $("#modal").classList.add("open");$("#modal").setAttribute("aria-hidden","false");
}
function close(){ $("#modal").classList.remove("open");$("#modal").setAttribute("aria-hidden","true");}
$("#search").oninput=render;$("#sort").onchange=render;$("#close").onclick=close;$(".backdrop").onclick=close;
document.onkeydown=e=>e.key==="Escape"&&close();
$("#menu").onclick=()=>{const n=$("#nav");n.style.display=n.style.display==="flex"?"none":"flex"};
$("#year").textContent=new Date().getFullYear();
renderCats();render();
