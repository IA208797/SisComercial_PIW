// ==========================================
// 1. IMPORTACIÓN DE LIBRERÍAS EXTERNAS
// ==========================================
import express, { type Request, type Response } from 'express'; // Framework para crear el servidor web HTTP
import mongoose from 'mongoose'; // ORM para conectarnos y mapear la base de datos MongoDB
import cors from 'cors'; // Middleware para permitir que aplicaciones externas (como Angular en puerto 4200) hagan peticiones
import dotenv from 'dotenv'; // Librería para leer las variables de entorno del archivo '.env'

// ==========================================
// 2. IMPORTACIÓN DE RUTAS (ARQUITECTURA MODULAR)
// ==========================================
import productoRoutes from './routes/producto.routes'; // Rutas encargadas del inventario/productos
import lealtadRoutes from './routes/lealtad.routes';   // Rutas del sistema de lealtad y puntos
import pedidosRoutes from './routes/pedido.routes';
import usuarioRoutes from './routes/usuario.routes';
// ==========================================
// 3. CONFIGURACIÓN INICIAL DEL SERVIDOR
// ==========================================
dotenv.config(); // Carga las variables del archivo '.env' en el objeto global 'process.env'

const app = express(); // Inicializamos la aplicación de Express
const puerto = process.env.PORT || 4000; // Define el puerto del backend (usa el del .env o por defecto el 4000)
const MONGO_URL = process.env.MONGO_URL; // Recupera la cadena de conexión de la base de datos

// Validación de seguridad: Si no existe la URL de la base de datos, detiene el backend de inmediato
if (!MONGO_URL) {
  console.error('Error crítico: La variable MONGO_URL no está configurada.');
  process.exit(1); // Rompe la ejecución del programa con código de error 1
}

// ==========================================
// 4. MIDDLEWARES GLOBALES (Filtros de entrada)
// ==========================================
// Los middlewares procesan las peticiones ANTES de que lleguen a tus rutas
app.use(cors()); // Permite el intercambio de recursos entre distintos orígenes (Evita el bloqueo de CORS en Angular)
app.use(express.json()); // Permite que el servidor entienda y procese datos que vengan en formato JSON (en el body de los POST)
app.use('/api/usuarios', usuarioRoutes);
// ==========================================
// 5. CONEXIÓN A LA BASE DE DATOS
// ==========================================
mongoose
  .connect(MONGO_URL) // Intenta establecer la conexión asíncrona con MongoDB
  .then(() => console.log('Conectado correctamente a MongoDB')) // Si todo sale bien, muestra este mensaje
  .catch((err) => console.error('Error al conectar con MongoDB:', err)); // Si falla (credenciales malas, base caída), muestra el error

// ==========================================
// 6. DECLARACIÓN Y MONTAJE DE ENDPOINTS (RUTAS)
// ==========================================

// Ruta raíz (Test de vida del servidor)
// URL de acceso en el archivo ".env"
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor funcionando correctamente con Arquitectura Modular TS');
});

// Montamos el módulo de Productos
// Cualquier ruta interna de 'productoRoutes' (ej: /ver) se convertirá en: http://localhost:4000/api/productos/ver
app.use('/api/productos', productoRoutes);

// Montamos el módulo de Lealtad 
// Las rutas internas se convertirán en:
// - POST: http://localhost:4000/api/lealtad/visita
// - POST: http://localhost:4000/api/lealtad/canjear
// - GET:  http://localhost:4000/api/lealtad/reporte
app.use('/api/lealtad', lealtadRoutes);


///////////MODULO PEDIDOS
app.use('/api/pedidos', pedidosRoutes);
// ==========================================
// 7. ARRANQUE DEL SERVIDOR
// ==========================================
// Le dice a la aplicación que empiece a escuchar peticiones en el puerto asignado
app.listen(puerto, () => {
  console.log(`Servidor activo en http://localhost:${puerto}`);
});
