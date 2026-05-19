const MENU = `
=== CAFÉ ===
- Latte $85 (caliente 360ml / frío 500ml)
- Capuccino $85 (caliente 320ml / frío 500ml)
- Dirty Chai $85 (frío 500ml) — chai con shot doble de espresso de especialidad
- Green Matcha Latte $100 — matcha ceremonial Ujido con leche de avena Oatly
- Kyoto $90 — 4 shots de espresso con leche vaporizada y leche condensada
- Moca (Mocaccino) $85 — capuchino con carga extra de chocolate Ghirardelli
- Espresso Tonic $95 (frío 500ml) — espresso, jugo de naranja y agua tónica
- Espresso Doppio $50
- Espresso Cortado $65
- Espresso Americano $50
- Refill Espresso Americano $25 (solo en desayunos, válido 7am–2pm)

Extras café: Esencia (vainilla/caramelo/pistacho/lavanda) $10 | Leche Oatly $15 | Shot espresso extra $20 | Cold foam $10 | Proteína ISOPURE $60

=== BEBIDAS ===
- Chai Latte $85
- Dirty Chai $95
- Green Matcha Latte $100
- Blue Matcha Latte $95 — blue matcha orgánico con Oatly, crema de coco y leche condensada
- Tisanas $85 — mezcla de té con especias, flores y frutas deshidratadas
- Té $50 — infusión a elegir
- Chocolate $75 — Ghirardelli
- Refrescos $60 — Coca Cola, Coca Cola Zero, Sprite (lata 350ml)
- Agua Embotellada $20 (500ml)
- Agua de Maracuyá $55 (con agua mineral +$10)
- Limonada $55 (con agua mineral +$10)
- Limonada Mango $65
- Limonada Frutos Rojos $65
- All Limonade $65 — maracuyá, mango y frutos rojos
- Jugo de Manzana $65 — 100% natural sin azúcar
- Té Shake $60 — té negro helado con jugo de naranja
- Piña Colada sin alcohol $85

=== DESAYUNOS ===
- Chilaquiles $140 — verdes, rojos o chipotle. Con crema, queso y cebolla. Frijoles refritos.
- Club Sandwich $160 — tocino, pollo y jamón York con papas a la francesa
- Enchiladas Verdes o Rojas $160 — queso o pollo, frijoles refritos y ensalada de la casa
- Huevos Motuleños $160 — 2 huevos orgánicos sobre tortilla, frijoles refritos y jamón York
- Huevos Rancheros $140 — 2 huevos orgánicos, frijoles refritos y papas a la mexicana
- Huevos al Gusto $160 — elige: champiñones, chorizo, jamón York o espinacas. Frijoles y papas.
- Huevos Divorciados $160 — 2 huevos orgánicos con frijoles refritos y chilaquiles
- Omelette $160 — elige: champiñones, chorizo, jamón York o espinacas
- Omelette Relleno $160 — 2 huevos rellenos de chilaquiles, aguacate y ensalada de la casa
- Waffles $130 — 2 piezas con crema batida, plátano y mermelada de la casa
- Toast de Aguacate $130 — masa madre artesanal, humus orgánico, aguacate y tomate cherry
- Toast de Salmón Ahumado $230 — masa madre, aguacate, salmón ahumado, arúgula, alcaparras, huevo pochado
- Serrano Roll $160 — NY Roll con jamón serrano, cebolla caramelizada al vino tinto, espinacas y arúgula
- Yogurt Griego $130 — 200gr con granola orgánica y arándanos orgánicos
- Batido de Proteína $120 — ISOPURE con frutos rojos (con leche +$10, Oatly +$20)

Franceses:
- Petit Déjeuner $160 — Pain au Chocolat o Croissant o NY Roll + Americano con refill + jugo natural
- Croque Madame $180 — masa madre, jamón York, béchamel casera, cheddar y huevo estrellado
- Pan Francés $130 — brioche artesanal hecho en casa con fresas, arándanos y azúcar glass

Extras desayunos: Huevo orgánico (2 pzas) $40 | Pollo 100gr $55 | Tocino 60gr $40 | Aguacate $25 | Pan tostado hogaza $25 | Jamón serrano 50gr $30

=== ENTRADAS ===
- Sopa de Tomate Provenzal $95 — cremosa, con hierbas provenzales y toque picante estilo mexicano
- Sopa de Cebolla $95 — cebolla caramelizada, pan de masa madre y queso gratinado
- Fondue $160 — para 2–4 personas, quesos fundidos con vino blanco y especias
- Tabla de Charcutería $280 — para 2–4 personas: chorizo español, jamón serrano, salami italiano, cheddar, aceitunas y hogaza de masa madre

=== PLATOS FUERTES ===
- L'Entrecote a la Pimienta $460 — Rib Eye 200gr en salsa cremosa de 4 pimientos, papas a la francesa
- L'Entrecote a la Demi-Glace $460 — Rib Eye 200gr en salsa de champiñones reducida en vino blanco, puré y espárragos
- Pechuga Lombarda $280 — pechuga en cama de risotto con emulsión de ajo negro y espárragos
- Pechuga Le Cordon Blue $280 — pechuga rellena de jamón York y cheddar, salsa de champiñones, puré y espárragos
- Croque Monsieur Rústico $160 — hogaza de masa madre, jamón York, béchamel y cheddar gratinado
- Le Parisien $140 — hogaza, jamón York, cheddar añejado, mantequilla francesa y pepinillos
- Le Niçois $140 — hogaza, atún en aceite de oliva, aceitunas, tomate fresco, alcaparras y vinagreta de limón
- Le Fermier $150 — hogaza, pechuga asada, queso de cabra cremoso, cebolla caramelizada y mayonesa
- Tartin Rustique $130 — tomate y alcaparras confinados, ensalada de queso de cabra con nuez y manzana
- Ensalada L'O $220 — mix orgánico, pollo a la plancha, queso de cabra, nuez garrapiñada y manzana con vinagreta dulce

=== PASTAS ===
- Spaghetti Gamberi $195 — crema blanca con duxelle de champiñones y camarones salteados al momento
- Spaghetti La Nonna $190 — crema blanca con duxelle de champiñones, pechuga a la plancha y chícharos
- Spaghetti Bolognese $180 — boloñesa casera con carne Angus, tomate fresco y vino blanco

=== HAMBURGUESAS ===
- Hamburguesa L'O $215 — 150gr Angus, cheddar blanco fundido, tocino crujiente, cebolla caramelizada y papas
- Hamburguesa Le Cordon Blue $230 — pechuga cordon blue con salsa de champiñones, vegetales y papas
- Hamburguesa Bistró $230 — pechuga a la plancha con mostaza Dijon, hierbas de provenza, cebolla caramelizada y papas

=== MENÚ INFANTIL ===
- Hamburguesa Le Petite $130 — 75gr Angus, cheddar blanco, tocino y papas
- Tortillita Española $95 — omelette estilo español con papa confitada y jamón York
- Sandwich de Jamón $100 — jamón York, aguacate y ensalada en masa madre o pan de caja, con papas
- Sincronizadas $100 — quesadillas de cheddar y jamón York con papas
- Pios $95 — 4 nuggets de pollo con papas

=== POSTRES ===
- Crème Brûlée $140 — vainilla orgánica de Madagascar
- Affogato $85 — espresso doble con nieve de vainilla
- Pain au Chocolat / Chocolatin $70 — hojaldre francés con dos barras de chocolate negro intenso
- Panes y Postres del Día — precio variable, pregunta a nuestro equipo
- Tiramisú $120 — espresso de especialidad con queso mascarpone
- Tarta La Viña $150 — la original de San Sebastián
- Galleta Estilo New York $95 — levain con chispas de chocolate semiamargo y nueces
- New York Roll $95 — hojaldre circular con crema de pistacho y ganache de chocolate
- Croissant $65 — hojaldre laminado artesanal

Extras postres: Nieve de vainilla $55 | Crema pastelera $20 | Crema de pistacho $25 | Nata $25
`;

module.exports = MENU;
