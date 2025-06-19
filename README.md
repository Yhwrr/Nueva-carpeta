# Metropolitan Museum Gallery 🎨

Una aplicación web moderna e interactiva para explorar la colección del Metropolitan Museum of Art de Nueva York. Disfruta de una experiencia visual única para descubrir obras maestras, buscar por artistas y explorar diferentes categorías artísticas.

## 🌟 Características Principales

### 🔍 Búsqueda Avanzada
- **Búsqueda por palabras clave**: Encuentra obras específicas usando términos descriptivos
- **Filtros por categoría**: Explora pinturas, esculturas, arte americano, asiático y europeo
- **Búsqueda por artista**: Descubre todas las obras disponibles de tu artista favorito

### 🎭 Exploración de Artistas
- **Catálogo completo**: Navega por una extensa lista de artistas de la colección
- **Búsqueda de artistas**: Encuentra rápidamente artistas específicos
- **Obras por artista**: Ve todas las piezas disponibles de cada creador

### 🖼️ Galería Interactiva
- **Carga paginada**: Navega por los resultados de manera eficiente
- **Vista detallada**: Accede a información completa de cada obra
- **Obras destacadas**: Descubre piezas seleccionadas al inicio

### 💫 Experiencia Visual
- **Diseño glassmorphism**: Interfaz moderna con efectos de cristal
- **Animaciones fluidas**: Transiciones suaves y naturales
- **Diseño responsivo**: Optimizado para todos los dispositivos
- **Efectos parallax**: Fondo dinámico que responde al scroll

## 🚀 Demo en Vivo

Visita la aplicación en funcionamiento: [Metropolitan Museum Gallery](https://yhwrr.github.io/Nueva-carpeta/)

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica moderna
- **CSS3**: Estilos avanzados con efectos glassmorphism y animaciones
- **JavaScript ES6+**: Lógica de aplicación con async/await y APIs modernas
- **Tailwind CSS**: Framework de utilidades para un diseño rápido y consistente
- **Metropolitan Museum API**: Fuente de datos oficial del museo

## 📋 Funcionalidades Detalladas

### Búsqueda y Filtrado
- Búsqueda en tiempo real con validación de entrada
- Filtros predefinidos por categorías artísticas
- Manejo de estados de carga y errores
- Resultados paginados para mejor rendimiento

### Gestión de Artistas
- Carga asíncrona de artistas desde múltiples departamentos
- Sistema de filtrado local por nombre
- Normalización de nombres para búsquedas precisas
- Manejo de coincidencias parciales y variaciones

### Interfaz de Usuario
- Navegación suave entre secciones
- Modales informativos para detalles de obras
- Feedback visual en todas las interacciones
- Manejo graceful de errores de conexión

## 🎯 Arquitectura del Código

### Estructura de Archivos
```
├── index.html          # Página principal
├── css/
│   └── estilos.css     # Estilos personalizados
└── js/
    └── main.js         # Lógica de la aplicación
```

### Componentes Principales
- **API Manager**: Manejo de peticiones al Metropolitan Museum API
- **Search Engine**: Sistema de búsqueda y filtrado
- **UI Components**: Componentes reutilizables para la interfaz
- **State Management**: Gestión del estado de la aplicación

## 🔧 Instalación y Uso

### Requisitos Previos
- Navegador web moderno con soporte para ES6+
- Conexión a internet para acceder a la API del museo

### Instalación Local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/yhwrr/Nueva-carpeta.git
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd Nueva-carpeta
   ```

3. Abre `index.html` en tu navegador o usa un servidor local:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   ```

4. Visita `http://localhost:8000` en tu navegador

## 📱 Características Responsivas

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints adaptativos**: Layouts que se ajustan a diferentes tamaños de pantalla
- **Touch-friendly**: Botones e interacciones adaptadas para pantallas táctiles
- **Performance optimizada**: Carga eficiente en conexiones lentas

## 🎨 Detalles de Diseño

### Paleta de Colores
- **Primario**: Gradientes azul-púrpura (#1a1a2e → #0f3460)
- **Acentos**: Dorado (#d4af37, #ffd700)
- **Neutros**: Blancos y grises con transparencias

### Tipografía
- **Headers**: Playfair Display (elegante y clásica)
- **Cuerpo**: Inter (moderna y legible)

### Efectos Visuales
- Glassmorphism con backdrop-filter
- Animaciones CSS3 fluidas
- Sombras y brillos dinámicos
- Transiciones suaves en hover states

## 🔄 API Integration

La aplicación consume la API oficial del Metropolitan Museum:
- **Base URL**: `https://collectionapi.metmuseum.org/public/collection/v1`
- **Endpoints utilizados**:
  - `/search` - Búsqueda de obras
  - `/objects/{id}` - Detalles de obras específicas
- **Filtros aplicados**: Solo obras con imágenes disponibles

## 🚦 Manejo de Estados

### Estados de Carga
- Spinner animado durante las búsquedas
- Feedback visual en botones de acción
- Indicadores de progreso en cargas largas

### Manejo de Errores
- Mensajes informativos para errores de red
- Fallbacks para imágenes no disponibles
- Gestión graceful de respuestas vacías

## 🎯 Optimizaciones de Rendimiento

- **Lazy Loading**: Carga diferida de imágenes
- **Debouncing**: Optimización en búsquedas en tiempo real
- **Caching**: Almacenamiento temporal de resultados
- **Batch Requests**: Agrupación de peticiones para reducir latencia

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar el proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 👨‍💻 Desarrollador

**Yhwrr Suárez**
- GitHub: [@yhwrr](https://github.com/yhwrr)
- Proyecto: [Metropolitan Museum Gallery](https://yhwrr.github.io/Nueva-carpeta/)

## 🙏 Agradecimientos

- **Metropolitan Museum of Art** por proporcionar su API pública
- **Tailwind CSS** por el framework de utilidades
- **Google Fonts** por las tipografías utilizadas
- La comunidad de desarrolladores por las herramientas open source

## 📚 Recursos Adicionales

- [Metropolitan Museum API Documentation](https://metmuseum.github.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/) para referencias de JavaScript

---
