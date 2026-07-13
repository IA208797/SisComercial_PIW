import { Router } from "express";
import {
    realizarPedido, 
    obtenerPedidosCliente, 
    obtenerPedidosAdmin, 
    cambiarEstadoPedido
} from "../controllers/pedido.controller"; 

const router = Router(); 

router.post('/api/RealizarPedido', realizarPedido); 

router.get('/api/pedidos/cliente/:clienteId', obtenerPedidosCliente);

router.get ('/api/admin/pedidos',obtenerPedidosAdmin); 

router.patch('/api/admin/pedidos/:id/estado', cambiarEstadoPedido); 

export default router;