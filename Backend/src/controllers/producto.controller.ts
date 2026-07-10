import { Request, Response } from 'express';
import { Producto } from '../models/producto.model';

export const guardarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagen,
    });

    await nuevoProducto.save();

    res.status(201).json({
      mensaje: 'Producto guardado correctamente',
      datos: nuevoProducto,
    });
  } catch (error) {
    console.error('Error al guardar producto:', error);
    res.status(500).json({ mensaje: 'Error al guardar producto', error });
  }
};

export const obtenerProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await Producto.find({}).sort({ fecha: -1 });
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos', error });
  }
};

export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { nombre, descripcion, precio, stock, categoria, imagen },
      { new: true }
    );

    if (!productoActualizado) {
      res.status(404).json({ mensaje: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({
      mensaje: 'Producto actualizado correctamente',
      datos: productoActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ mensaje: 'Error al actualizar producto', error });
  }
};

export const eliminarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      res.status(404).json({ mensaje: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({
      mensaje: 'Producto eliminado correctamente',
      datos: productoEliminado,
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto', error });
  }
};
