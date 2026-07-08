import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productoRoutes from './routes/producto.routes'; // <-- Importamos tus rutas

dotenv.config();

const app = express();
const puerto = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error('Error crítico: La variable MONGO_URL no está configurada.');
  process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => console.log('Conectado correctamente a MongoDB'))
  .catch((err) => console.error('Error al conectar con MongoDB:', err));

// Ruta base de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('Servidor funcionando correctamente con Arquitectura Modular TS');
});

// Montamos las rutas de productos (Todas iniciarán con /api/productos)
app.use('/api/productos', productoRoutes);

// Encender servidor
app.listen(puerto, () => {
  console.log(`Servidor activo en http://localhost:${puerto}`);
});