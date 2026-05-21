/* =====================================================
   L'Orangerie — main.js
   ===================================================== */

// ── Número de WhatsApp del restaurante ──────────────────
// Cambia este número cuando tengas el número oficial del restaurante
// Formato: código de país + número (sin +, sin espacios)
const RESTAURANT_WA = '14155238886';

// ── Eventos próximos ─────────────────────────────────────
// Para agregar un evento, copia el bloque entre {} y llena los datos
// Para quitar todos los eventos, deja el arreglo vacío: []
const EVENTS = [
  // {
  //   day:   '28',
  //   month: 'Jun',
  //   year:  '2025',
  //   title: 'Tarde de Jazz & Fondue',
  //   desc:  'Disfruta música jazz en vivo mientras compartes una fondue de quesos franceses con los tuyos.',
  //   time:  '6:00 PM – 9:00 PM'
  // },
];

// ── Menú completo ────────────────────────────────────────
const MENU = {
  'Café': {
    items: [
      { name: 'Latte',                   price: '$85',  desc: 'Caliente 360ml / Frío 500ml' },
      { name: 'Capuccino',               price: '$85',  desc: 'Caliente 320ml / Frío 500ml' },
      { name: 'Dirty Chai',              price: '$85',  desc: 'Frío 500ml — chai con shot doble de espresso de especialidad' },
      { name: 'Green Matcha Latte',      price: '$100', desc: 'Matcha ceremonial Ujido con leche de avena Oatly' },
      { name: 'Kyoto',                   price: '$90',  desc: '4 shots de espresso con leche vaporizada y leche condensada' },
      { name: 'Moca (Mocaccino)',         price: '$85',  desc: 'Capuchino con carga extra de chocolate Ghirardelli' },
      { name: 'Espresso Tonic',          price: '$95',  desc: 'Frío 500ml — espresso, jugo de naranja y agua tónica' },
      { name: 'Espresso Doppio',         price: '$50',  desc: '' },
      { name: 'Espresso Cortado',        price: '$65',  desc: '' },
      { name: 'Espresso Americano',      price: '$50',  desc: '' },
      { name: 'Refill Espresso Americano', price: '$25', desc: 'Solo en desayunos · válido 7am–2pm' },
    ],
    extras: 'Esencia (vainilla / caramelo / pistacho / lavanda) $10 &nbsp;·&nbsp; Leche Oatly $15 &nbsp;·&nbsp; Shot espresso extra $20 &nbsp;·&nbsp; Cold foam $10 &nbsp;·&nbsp; Proteína ISOPURE $60',
  },

  'Bebidas': {
    items: [
      { name: 'Chai Latte',             price: '$85',  desc: '' },
      { name: 'Dirty Chai',             price: '$95',  desc: '' },
      { name: 'Green Matcha Latte',     price: '$100', desc: '' },
      { name: 'Blue Matcha Latte',      price: '$95',  desc: 'Blue matcha orgánico con Oatly, crema de coco y leche condensada' },
      { name: 'Tisanas',                price: '$85',  desc: 'Mezcla de té con especias, flores y frutas deshidratadas' },
      { name: 'Té',                     price: '$50',  desc: 'Infusión a elegir' },
      { name: 'Chocolate',              price: '$75',  desc: 'Ghirardelli' },
      { name: 'Refrescos',              price: '$60',  desc: 'Coca Cola, Coca Cola Zero, Sprite (lata 350ml)' },
      { name: 'Agua Embotellada',       price: '$20',  desc: '500ml' },
      { name: 'Agua de Maracuyá',       price: '$55',  desc: 'Con agua mineral +$10' },
      { name: 'Limonada',               price: '$55',  desc: 'Con agua mineral +$10' },
      { name: 'Limonada Mango',         price: '$65',  desc: '' },
      { name: 'Limonada Frutos Rojos',  price: '$65',  desc: '' },
      { name: 'All Limonade',           price: '$65',  desc: 'Maracuyá, mango y frutos rojos' },
      { name: 'Jugo de Manzana',        price: '$65',  desc: '100% natural sin azúcar' },
      { name: 'Té Shake',               price: '$60',  desc: 'Té negro helado con jugo de naranja' },
      { name: 'Piña Colada sin alcohol',price: '$85',  desc: '' },
    ],
  },

  'Desayunos': {
    subcategories: [
      {
        title: null,
        items: [
          { name: 'Chilaquiles',               price: '$140', desc: 'Verdes, rojos o chipotle · crema, queso y cebolla · frijoles refritos' },
          { name: 'Club Sandwich',             price: '$160', desc: 'Tocino, pollo y jamón York con papas a la francesa' },
          { name: 'Enchiladas Verdes o Rojas', price: '$160', desc: 'Queso o pollo, frijoles refritos y ensalada de la casa' },
          { name: 'Huevos Motuleños',          price: '$160', desc: '2 huevos orgánicos sobre tortilla, frijoles refritos y jamón York' },
          { name: 'Huevos Rancheros',          price: '$140', desc: '2 huevos orgánicos, frijoles refritos y papas a la mexicana' },
          { name: 'Huevos al Gusto',           price: '$160', desc: 'Elige: champiñones, chorizo, jamón York o espinacas · frijoles y papas' },
          { name: 'Huevos Divorciados',        price: '$160', desc: '2 huevos orgánicos con frijoles refritos y chilaquiles' },
          { name: 'Omelette',                  price: '$160', desc: 'Elige: champiñones, chorizo, jamón York o espinacas' },
          { name: 'Omelette Relleno',          price: '$160', desc: '2 huevos rellenos de chilaquiles, aguacate y ensalada de la casa' },
          { name: 'Waffles',                   price: '$130', desc: '2 piezas con crema batida, plátano y mermelada de la casa' },
          { name: 'Toast de Aguacate',         price: '$130', desc: 'Masa madre artesanal, humus orgánico, aguacate y tomate cherry' },
          { name: 'Toast de Salmón Ahumado',   price: '$230', desc: 'Masa madre, aguacate, salmón ahumado, arúgula, alcaparras, huevo pochado' },
          { name: 'Serrano Roll',              price: '$160', desc: 'NY Roll con jamón serrano, cebolla caramelizada al vino tinto, espinacas y arúgula' },
          { name: 'Yogurt Griego',             price: '$130', desc: '200gr con granola orgánica y arándanos orgánicos' },
          { name: 'Batido de Proteína',        price: '$120', desc: 'ISOPURE con frutos rojos (con leche +$10, Oatly +$20)' },
        ],
      },
      {
        title: 'Desayunos Franceses',
        items: [
          { name: 'Petit Déjeuner', price: '$160', desc: 'Pain au Chocolat o Croissant o NY Roll + Americano con refill + jugo natural' },
          { name: 'Croque Madame', price: '$180', desc: 'Masa madre, jamón York, béchamel casera, cheddar y huevo estrellado' },
          { name: 'Pan Francés',   price: '$130', desc: 'Brioche artesanal hecho en casa con fresas, arándanos y azúcar glass' },
        ],
      },
    ],
    extras: 'Huevo orgánico (2 pzas) $40 &nbsp;·&nbsp; Pollo 100gr $55 &nbsp;·&nbsp; Tocino 60gr $40 &nbsp;·&nbsp; Aguacate $25 &nbsp;·&nbsp; Pan tostado hogaza $25 &nbsp;·&nbsp; Jamón serrano 50gr $30',
  },

  'Entradas': {
    items: [
      { name: 'Sopa de Tomate Provenzal', price: '$95',  desc: 'Cremosa, con hierbas provenzales y toque picante estilo mexicano' },
      { name: 'Sopa de Cebolla',          price: '$95',  desc: 'Cebolla caramelizada, pan de masa madre y queso gratinado' },
      { name: 'Fondue',                   price: '$160', desc: 'Para 2–4 personas · quesos fundidos con vino blanco y especias' },
      { name: 'Tabla de Charcutería',     price: '$280', desc: 'Para 2–4 personas · chorizo español, jamón serrano, salami italiano, cheddar, aceitunas y hogaza de masa madre' },
    ],
  },

  'Platos Fuertes': {
    items: [
      { name: "L'Entrecote a la Pimienta",   price: '$460', desc: 'Rib Eye 200gr en salsa cremosa de 4 pimientos, papas a la francesa' },
      { name: "L'Entrecote a la Demi-Glace", price: '$460', desc: 'Rib Eye 200gr en salsa de champiñones reducida en vino blanco, puré y espárragos' },
      { name: 'Pechuga Lombarda',            price: '$280', desc: 'Pechuga en cama de risotto con emulsión de ajo negro y espárragos' },
      { name: 'Pechuga Le Cordon Blue',      price: '$280', desc: 'Pechuga rellena de jamón York y cheddar, salsa de champiñones, puré y espárragos' },
      { name: 'Croque Monsieur Rústico',     price: '$160', desc: 'Hogaza de masa madre, jamón York, béchamel y cheddar gratinado' },
      { name: 'Le Parisien',                price: '$140', desc: 'Hogaza, jamón York, cheddar añejado, mantequilla francesa y pepinillos' },
      { name: 'Le Niçois',                  price: '$140', desc: 'Hogaza, atún en aceite de oliva, aceitunas, tomate fresco, alcaparras y vinagreta de limón' },
      { name: 'Le Fermier',                 price: '$150', desc: 'Hogaza, pechuga asada, queso de cabra cremoso, cebolla caramelizada y mayonesa' },
      { name: 'Tartin Rustique',            price: '$130', desc: 'Tomate y alcaparras confinados, ensalada de queso de cabra con nuez y manzana' },
      { name: "Ensalada L'O",              price: '$220', desc: 'Mix orgánico, pollo a la plancha, queso de cabra, nuez garrapiñada y manzana con vinagreta dulce' },
    ],
  },

  'Pastas': {
    items: [
      { name: 'Spaghetti Gamberi',   price: '$195', desc: 'Crema blanca con duxelle de champiñones y camarones salteados al momento' },
      { name: 'Spaghetti La Nonna', price: '$190', desc: 'Crema blanca con duxelle de champiñones, pechuga a la plancha y chícharos' },
      { name: 'Spaghetti Bolognese',price: '$180', desc: 'Boloñesa casera con carne Angus, tomate fresco y vino blanco' },
    ],
  },

  'Hamburguesas': {
    items: [
      { name: "Hamburguesa L'O",         price: '$215', desc: '150gr Angus, cheddar blanco fundido, tocino crujiente, cebolla caramelizada y papas' },
      { name: 'Hamburguesa Le Cordon Blue', price: '$230', desc: 'Pechuga cordon blue con salsa de champiñones, vegetales y papas' },
      { name: 'Hamburguesa Bistró',      price: '$230', desc: 'Pechuga a la plancha con mostaza Dijon, hierbas de provenza, cebolla caramelizada y papas' },
    ],
  },

  'Infantil': {
    items: [
      { name: 'Hamburguesa Le Petite', price: '$130', desc: '75gr Angus, cheddar blanco, tocino y papas' },
      { name: 'Tortillita Española',   price: '$95',  desc: 'Omelette estilo español con papa confitada y jamón York' },
      { name: 'Sandwich de Jamón',     price: '$100', desc: 'Jamón York, aguacate y ensalada en masa madre o pan de caja, con papas' },
      { name: 'Sincronizadas',         price: '$100', desc: 'Quesadillas de cheddar y jamón York con papas' },
      { name: 'Pios',                  price: '$95',  desc: '4 nuggets de pollo con papas' },
    ],
  },

  'Postres': {
    items: [
      { name: 'Crème Brûlée',                  price: '$140',    desc: 'Vainilla orgánica de Madagascar' },
      { name: 'Affogato',                       price: '$85',     desc: 'Espresso doble con nieve de vainilla' },
      { name: 'Pain au Chocolat / Chocolatin',  price: '$70',     desc: 'Hojaldre francés con dos barras de chocolate negro intenso' },
      { name: 'Panes y Postres del Día',         price: 'Variable', desc: 'Pregunta a nuestro equipo' },
      { name: 'Tiramisú',                       price: '$120',    desc: 'Espresso de especialidad con queso mascarpone' },
      { name: 'Tarta La Viña',                  price: '$150',    desc: 'La original de San Sebastián' },
      { name: 'Galleta Estilo New York',         price: '$95',     desc: 'Levain con chispas de chocolate semiamargo y nueces' },
      { name: 'New York Roll',                  price: '$95',     desc: 'Hojaldre circular con crema de pistacho y ganache de chocolate' },
      { name: 'Croissant',                      price: '$65',     desc: 'Hojaldre laminado artesanal' },
    ],
    extras: 'Nieve de vainilla $55 &nbsp;·&nbsp; Crema pastelera $20 &nbsp;·&nbsp; Crema de pistacho $25 &nbsp;·&nbsp; Nata $25',
  },
};

// ── Helpers ──────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

function itemHTML(item) {
  return `
    <div class="menu-item">
      <div class="menu-item-info">
        <div class="menu-item-name">${item.name}</div>
        ${item.desc ? `<div class="menu-item-desc">${item.desc}</div>` : ''}
      </div>
      <div class="menu-item-price">${item.price}</div>
    </div>`;
}

// ── Navigation ───────────────────────────────────────────
const navbar    = el('navbar');
const navToggle = el('navToggle');
const navLinks  = el('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 70);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Menu tabs ────────────────────────────────────────────
const menuTabs    = el('menuTabs');
const menuContent = el('menuContent');
const categories  = Object.keys(MENU);

function renderMenuCategory(activeKey) {
  // Tabs
  menuTabs.innerHTML = categories.map(cat => `
    <button class="menu-tab${cat === activeKey ? ' active' : ''}" data-cat="${cat}">${cat}</button>
  `).join('');

  menuTabs.querySelectorAll('.menu-tab').forEach(btn => {
    btn.addEventListener('click', () => renderMenuCategory(btn.dataset.cat));
  });

  // Content
  const data = MENU[activeKey];
  let html = '<div class="menu-category active">';

  if (data.subcategories) {
    data.subcategories.forEach(sub => {
      html += '<div class="menu-items">';
      if (sub.title) html += `<p class="menu-sub-title">${sub.title}</p>`;
      sub.items.forEach(item => { html += itemHTML(item); });
      html += '</div>';
    });
  } else {
    html += '<div class="menu-items">';
    data.items.forEach(item => { html += itemHTML(item); });
    html += '</div>';
  }

  if (data.extras) {
    html += `<div class="menu-extras"><h4>Extras</h4><p>${data.extras}</p></div>`;
  }

  html += '</div>';
  menuContent.innerHTML = html;
}

renderMenuCategory(categories[0]);

// ── Events ───────────────────────────────────────────────
const eventsGrid = el('eventsGrid');

if (EVENTS.length === 0) {
  eventsGrid.innerHTML = `
    <div class="events-empty">
      Próximamente nuevos eventos.<br>
      <a href="https://instagram.com/lorangeriejrz" target="_blank" rel="noopener">
        Síguenos en Instagram @lorangeriejrz para enterarte primero.
      </a>
    </div>`;
} else {
  eventsGrid.innerHTML = EVENTS.map(e => `
    <div class="event-card reveal">
      <div class="event-date">
        <span class="event-day">${e.day}</span>
        <span class="event-month">${e.month}</span>
      </div>
      <h3 class="event-title">${e.title}</h3>
      <p class="event-desc">${e.desc}</p>
      <p class="event-time">🕐 ${e.time}</p>
    </div>`).join('');
}

// ── Reservation form ─────────────────────────────────────
const resForm = el('reservationForm');
const resDate = el('resDate');

resDate.min = new Date().toISOString().split('T')[0];

resForm.addEventListener('submit', e => {
  e.preventDefault();

  const name   = el('resName').value.trim();
  const phone  = el('resPhone').value.trim();
  const date   = el('resDate').value;
  const time   = el('resTime').value;
  const guests = el('resGuests').value;
  const notes  = el('resNotes').value.trim();

  if (!date || !time || !guests) {
    alert('Por favor completa todos los campos requeridos.');
    return;
  }

  const dateFmt = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const msg = [
    `🥐 *Solicitud de Reservación — L'Orangerie*`,
    ``,
    `👤 Nombre: ${name}`,
    `📱 Teléfono: ${phone}`,
    `📅 Fecha: ${dateFmt}`,
    `🕐 Hora: ${time}`,
    `👥 Personas: ${guests}`,
    notes ? `📝 Notas: ${notes}` : null,
    ``,
    `_Enviado desde lorangerie.onrender.com_`,
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/${RESTAURANT_WA}?text=${encodeURIComponent(msg)}`, '_blank');
});

// ── Scroll reveal (Intersection Observer) ────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
