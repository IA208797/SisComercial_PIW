import { Router } from "express";
import {
    realizarPedido, 
    obtenerPedidosCliente, 
    obtenerPedidosAdmin, 
    cambiarEstadoPedido, 
    obtenerProductoenPedido
} from "../controllers/pedido.controller"; 

const router = Router(); 

router.post('/RealizarPedido', realizarPedido); 

router.get('/pedidos/cliente/:clienteId', obtenerPedidosCliente);

router.get ('/admin/pedidos',obtenerPedidosAdmin); 

router.patch('/admin/pedidos/:id/estado', cambiarEstadoPedido); 

router.get('/ObtenerProductos', obtenerProductoenPedido);
export default router;