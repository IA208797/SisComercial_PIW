import { Router } from 'express';
import {
  guardarProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto
} from '../controllers/producto.controller';

const router = Router();

router.get('/', obtenerProductos);
router.post('/', guardarProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;