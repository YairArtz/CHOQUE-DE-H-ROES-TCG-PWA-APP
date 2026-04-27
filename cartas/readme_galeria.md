🃏 MÓDULO GALERÍA DE CARTAS - Choque de Héroes TCG
📋 Archivos del módulo
`galeria.html` — Módulo principal de la galería
`cartas.json` — Base de datos de cartas (editable desde GitHub)
`README_GALERIA.md` — Este archivo
---
🎨 Características implementadas
✅ Grid 3x3 con scroll infinito
✅ Búsqueda en tiempo real por nombre de carta
✅ Filtros por expansión (Todas, Base, Xantolo, Aztlán)
✅ Vista ampliada modal con animación
✅ Diseño oscuro/dorado consistente con CHH
✅ Contador de cartas dinámico
✅ Sistema modular para fácil expansión
---
📁 Estructura de carpetas recomendada
```
/CHOQUE-DE-H-ROES-TCG-PWA-APP/
├── index.html
├── galeria.html          ← NUEVO
├── cartas.json           ← NUEVO
├── cartas/               ← NUEVA CARPETA
│   ├── carta_001.jpg     (240×336px, ~30-40KB)
│   ├── carta_001_full.jpg (600×840px, ~150-200KB)
│   ├── carta_002.jpg
│   ├── carta_002_full.jpg
│   └── ...
└── logos/                ← NUEVA CARPETA (opcional)
    ├── logo_base.png
    ├── logo_xantolo.png
    └── logo_aztlan.png
```
---
🖼️ Formato de imágenes de cartas
Miniaturas (para el grid)
Tamaño: 240×336 píxeles (proporción 5:7)
Formato: JPG
Calidad: 75%
Peso: ~30-40KB por carta
Nomenclatura: `carta_001.jpg`, `carta_002.jpg`, etc.
Vista ampliada (modal)
Tamaño: 600×840 píxeles (2.5x más grande)
Formato: JPG
Calidad: 85%
Peso: ~150-200KB por carta
Nomenclatura: `carta_001_full.jpg`, `carta_002_full.jpg`, etc.
---
📝 Estructura del archivo cartas.json
```json
[
  {
    "id": "001",
    "nombre": "Koatl el Defensor",
    "tipo": "Héroe",
    "expansion": "base",
    "miniatura": "cartas/carta_001.jpg",
    "ampliada": "cartas/carta_001_full.jpg"
  },
  {
    "id": "002",
    "nombre": "Quetzalcoatl",
    "tipo": "Criatura",
    "expansion": "xantolo",
    "miniatura": "cartas/carta_002.jpg",
    "ampliada": "cartas/carta_002_full.jpg"
  }
]
```
Campos obligatorios:
`id` — Número único de 3 dígitos (001, 002, etc.)
`nombre` — Nombre de la carta
`tipo` — Tipo de carta (Héroe, Criatura, Hechizo, etc.)
`expansion` — Código de expansión: `base`, `xantolo`, `aztlan`
`miniatura` — Ruta a la imagen pequeña
`ampliada` — Ruta a la imagen grande
---
🔄 Cómo agregar nuevas cartas
Método 1: Editar directamente en GitHub
Ve a tu repositorio en GitHub
Abre el archivo `cartas.json`
Haz clic en el ícono del lápiz (✏️) para editar
Agrega la nueva carta al final del array:
```json
  ,
  {
    "id": "046",
    "nombre": "Nueva Carta",
    "tipo": "Criatura",
    "expansion": "aztlan",
    "miniatura": "cartas/carta_046.jpg",
    "ampliada": "cartas/carta_046_full.jpg"
  }
```
Sube las imágenes correspondientes a la carpeta `cartas/`
Commit y listo — la app se actualiza automáticamente
Método 2: Editar localmente
Descarga `cartas.json`
Edita con cualquier editor de texto
Sube de nuevo a GitHub junto con las imágenes
---
🎯 Agregar nuevas expansiones
Para agregar una nueva expansión (ej: "Tenochtitlan"):
En galeria.html, busca la sección de filtros:
```html
<div class="expansion-filters" id="expansionFilters">
  <button class="filter-btn active" data-expansion="todas">Todas</button>
  <button class="filter-btn" data-expansion="base">Set Base</button>
  <button class="filter-btn" data-expansion="xantolo">Xantolo</button>
  <button class="filter-btn" data-expansion="aztlan">Aztlán</button>
  <!-- AGREGAR AQUÍ: -->
  <button class="filter-btn" data-expansion="tenochtitlan">Tenochtitlan</button>
</div>
```
En cartas.json, usa ese mismo código:
```json
{
  "id": "050",
  "nombre": "Carta Nueva",
  "tipo": "Héroe",
  "expansion": "tenochtitlan",
  "miniatura": "cartas/carta_050.jpg",
  "ampliada": "cartas/carta_050_full.jpg"
}
```
---
🔗 Integrar al menú principal
En `index.html`, agrega un botón en la sección de módulos:
```html
<a class="module-card" href="galeria.html">
  <div class="module-icon">🃏</div>
  <div class="module-name">Galería de Cartas</div>
  <div class="module-desc">Explora todas las cartas del juego</div>
</a>
```
---
⚡ Optimización de rendimiento
Lazy Loading (opcional - para más de 100 cartas)
Si llegas a tener 200+ cartas, puedes implementar carga perezosa:
```javascript
// En galeria.html, agregar Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});
```
Compresión de imágenes
Usa herramientas online como:
https://tinyjpg.com/
https://squoosh.app/
Para reducir el peso sin perder calidad visual.
---
🎨 Personalización de colores
Si quieres ajustar la paleta de colores del módulo, busca estas variables en `galeria.html`:
```css
/* Color primario (verde neón) */
#00ff9d

/* Color secundario (dorado) */
#d4af37

/* Fondo oscuro */
#03050a

/* Bordes */
#1a1f2e
```
---
🐛 Resolución de problemas
Las cartas no se muestran
Verifica que las rutas en `cartas.json` sean correctas
Asegúrate de que las imágenes estén en la carpeta `cartas/`
Abre la consola del navegador (F12) para ver errores
El buscador no funciona
Verifica que `cartas.json` esté en formato JSON válido
Usa https://jsonlint.com/ para validar el JSON
Las imágenes se ven pixeladas
Asegúrate de estar usando imágenes de alta resolución
Miniaturas: mínimo 240×336px
Ampliadas: mínimo 600×840px
---
📊 Roadmap futuro (opcional)
[ ] Estadísticas de la carta en el modal
[ ] Filtro por tipo de carta (Héroe, Criatura, Hechizo)
[ ] Filtro por rareza
[ ] Modo lista (además del grid)
[ ] Favoritos
[ ] Compartir carta en redes sociales
[ ] Descarga de imagen de carta
---
🎉 ¡Listo para usar!
Una vez que:
Subas `galeria.html` a GitHub
Subas `cartas.json` a GitHub
Crees la carpeta `cartas/` con tus imágenes
Agregues el botón al menú principal
La galería estará completamente funcional 🚀
