// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// //Herramientas de Werner

// //que no se me olvide cambiarlo
// const app = express();
// const puerto = 4000;

// const MONGO_URL = '';

// //mis petic
// app.use(cors());
// app.use(express.json());

// //primera prueba
// mongoose
//   .connect(MONGO_URL)
//   .then(() => console.log('Conectado correctamente a MongoDB'))
//   .catch((err) => console.error('Error al conectar con MongoDB:', err));

// //modelo, mejor no imagenes
// const Producto = mongoose.model(
//   'Producto',
//   new mongoose.Schema({
//     nombre: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     descripcion: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     precio: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     stock: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     categoria: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     fecha: {
//       type: Date,
//       default: Date.now,
//     },
//   })
// );

// //prueba 2
// app.get('/', (req, res) => {
//   res.send('Servidor de productos funcionando correctamente');
// });

// //Guardar
// app.post('/api/productos', async (req, res) => {
//   try {
//     const { nombre, descripcion, precio, stock, categoria } = req.body;

//     const nuevoProducto = new Producto({
//       nombre,
//       descripcion,
//       precio,
//       stock,
//       categoria,
//     });

//     await nuevoProducto.save();

//     res.status(201).json({
//       mensaje: 'Producto guardado correctamente',
//       datos: nuevoProducto,
//     });
//   } catch (error) {
//     console.error('Error al guardar producto:', error);
//     res.status(500).json({
//       mensaje: 'Error al guardar producto',
//       error,
//     });
//   }
// });

// //Obtener para mi menu
// app.get('/api/productos', async (req, res) => {
//   try {
//     const productos = await Producto.find({}).sort({ fecha: -1 });
//     res.status(200).json(productos);
//   } catch (error) {
//     console.error('Error al obtener productos:', error);
//     res.status(500).json({
//       mensaje: 'Error al obtener productos',
//       error,
//     });
//   }
// });

// //Puteaar
// app.put('/api/productos/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { nombre, descripcion, precio, stock, categoria } = req.body;

//     const productoActualizado = await Producto.findByIdAndUpdate(
//       id,
//       {
//         nombre,
//         descripcion,
//         precio,
//         stock,
//         categoria,
//       },
//       { new: true }
//     );

//     if (!productoActualizado) {
//       return res.status(404).json({
//         mensaje: 'Producto no encontrado',
//       });
//     }

//     res.status(200).json({
//       mensaje: 'Producto actualizado correctamente',
//       datos: productoActualizado,
//     });
//   } catch (error) {
//     console.error('Error al actualizar producto:', error);
//     res.status(500).json({
//       mensaje: 'Error al actualizar producto',
//       error,
//     });
//   }
// });

// //Borrar
// app.delete('/api/productos/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const productoEliminado = await Producto.findByIdAndDelete(id);

//     if (!productoEliminado) {
//       return res.status(404).json({
//         mensaje: 'Producto no encontrado',
//       });
//     }

//     res.status(200).json({
//       mensaje: 'Producto eliminado correctamente',
//       datos: productoEliminado,
//     });
//   } catch (error) {
//     console.error('Error al eliminar producto:', error);
//     res.status(500).json({
//       mensaje: 'Error al eliminar producto',
//       error,
//     });
//   }
// });

// //Iniciar mi pagina 
// app.listen(puerto, () => {
//   console.log(`Servidor activo en http://localhost:${puerto}`);
// });