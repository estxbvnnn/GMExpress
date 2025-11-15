3.1. REQUERIMIENTOS DEL MÓDULO WEB GM EXPRESS

3.1.1 Requerimientos funcionales

Mantenedor de Clientes
- Registro de nuevos clientes con información básica:
  Implementado en Register.jsx + AuthContext (campos: nombre, apellidos, RUT, correo,
  tipoUsuario) y guardado en colección "usuarios".
- Inicio de sesión seguro:
  Implementado en Login.jsx + AuthContext (email + password sobre Firebase Auth).
- Historial de compras / pedidos anteriores:
  Implementado en Orders.jsx consultando "orders" filtrado por userId, accesible desde
  la ruta protegida /mis-pedidos.

Mantenedor de Productos o Servicios
- CRUD de productos/servicios:
  Implementado en AdminProducts.jsx (crear, editar, eliminar), persistiendo en colección
  "productos". Cada producto guarda ownerId para que cada empresa vea solo sus ítems.
- Catálogo dinámico para clientes:
  Implementado en Catalog.jsx, que carga "productos" desde Firestore y los muestra por
  categoría, con nombre, descripción y precios; permite añadir al carrito.
- Clasificación por categorías:
  Implementado con CATALOG estático + colección "categorias". Cada producto guarda
  categoriaId/categoriaNombre, usado en Catalog.jsx y AdminPanel.jsx.

Gestor de Ventas
- Registro de solicitudes de compra:
  Implementado en Cart.jsx, que genera documentos en "orders" con items, cantidades,
  total, estado inicial "pendiente" y userId.
- Resumen de venta (detalle de productos, cantidades y precios):
  Implementado en Cart.jsx (previo a enviar) y luego visible en Orders.jsx y AdminPanel.jsx.
- Notificación al administrador:
  Implementado de forma básica como aparición en AdminPanel.jsx, sección Dashboard
  y Gestión de pedidos (nuevas solicitudes y listado de estados).
- Actualización de estado de venta (pendiente/proceso/entregado):
  Implementado en AdminPanel.jsx -> renderOrders + handleChangeOrderStatus
  (cambio de status en "orders").
- Reportes de ventas filtrados:
  Implementado parcialmente en AdminPanel.jsx -> renderReports (sumatoria de ventas
  entregadas). Puede extenderse con filtros por fecha y tipo de servicio.

3.1.2 Requerimientos no funcionales

Seguridad
- Autenticación con credenciales seguras:
  Implementado con Firebase Auth (email/password) en AuthContext.jsx.
- Cifrado de datos:
  Delegado a Firebase (tráfico HTTPS + almacenamiento en Google Cloud); no se implementa
  cifrado adicional en frontend.
- Perfiles de usuario y control de acceso:
  Implementado con campo "role" (cliente, empresa, admin, superadmin) en "usuarios",
  uso de ProtectedRoute.jsx y chequeos de role en AdminPanel.jsx y AdminProducts.jsx.

Disponibilidad
- Acceso desde cualquier dispositivo:
  Implementado como SPA responsive en React + Firebase Hosting.
- Respaldo automático de base de datos:
  Satisfecho por Firestore (backups gestionados a nivel de proyecto Firebase).
- Disponibilidad en jornada laboral:
  Dependiente de la infraestructura Firebase + hosting; el frontend es estático.

Usabilidad
- Interfaz intuitiva y responsiva:
  Implementado con diseño responsive en styles.css; navegación simple mediante Navbar.jsx
  y rutas claras (Home, Catálogo, Carrito, Mis Pedidos, Panel Empresa, Admin Panel).

Rendimiento
- Optimización de base de datos:
  Parcial. Se usan consultas simples con filtros (where userId, orderBy createdAt).
  "firestore.indexes.json" está preparado para definir índices adicionales si se requieren
  consultas más complejas (p.ej., filtros por fecha/estado en AdminPanel).
*/