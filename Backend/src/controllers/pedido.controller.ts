import { Request, Response } from "express";
import mongoose from "mongoose";
import { PedidoModel } from "../models/pedido.model";
import { Producto } from "../models/producto.model";

////////////Si el de Kevin funciona no usar este
export const obtenerProductoenPedido =  async (req: Request, res: Response): Promise<void> => {
    try {
        const productos = await Producto.find({}, '_id nombre precio imagen');
        res.status(200).json({
            success: true,
            data: productos
        });
    } catch (error: any) {
        console.error('Error al obtener el catálogo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos.',
            error: error.message
        });
    }
};

export const realizarPedido = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clienteId, clienteNombre, articulos, notas } = req.body;

        if (!articulos || articulos.length === 0) {
            res.status(400).json({ success: false, message: 'El pedido no puede estar vacío.' });
            return;
        }

        let totalCalculado = 0;
        const articulosProcesados = [];
        for (const item of articulos) {
            const productoBD = await Producto.findById(item.productoId);
            if (!productoBD) {
                res.status(404).json({
                    success: false,
                    message: `El producto con ID ${item.productoId} no existe en el catálogo.`
                });
                return;
            }

            
            const precioReal = productoBD.precio;
            const nombreReal = productoBD.nombre;
            totalCalculado += precioReal * item.cantidad;
            articulosProcesados.push({
                productoId: item.productoId,
                nombre: nombreReal,       
                cantidad: item.cantidad,   
                precioUnitario: precioReal 
            });
        }

        const nuevoPedido = new PedidoModel({
            clienteId,
            clienteNombre, 
            articulos: articulosProcesados,
            total: totalCalculado, 
            notas
        });

        const pedidoGuardado = await nuevoPedido.save();

        res.status(201).json({
            success: true,
            message: 'Pedido verificado y registrado con éxito.',
            data: pedidoGuardado
        });

    } catch (error: any) {
        console.error('Error al procesar el pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al procesar el pedido.',
            error: error.message
        });
    }
};

export const obtenerPedidosCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clienteId } = req.params;

    const historialPedidos = await PedidoModel.find({ clienteId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: historialPedidos
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial del usuario.',
      error: error.message
    });
  }
};


/////////////////PARTE ADMIN//////////////////////

export const obtenerPedidosAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const verPasados = req.query.pasados === 'true';
    const filtro: any = verPasados 
      ? {} 
      : { estado: { $nin: ['entregado', 'cancelado'] } };
    const pedidosCola = await PedidoModel.find(filtro).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: pedidosCola
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cola de pedidos.',
      error: error.message
    });
  }
};

export const cambiarEstadoPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    const pedidoActualizado = await PedidoModel.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true, runValidators: true }
    );

    if (!pedidoActualizado) {
      res.status(404).json({ success: false, message: 'El pedido no existe.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Pedido actualizado a: ${nuevoEstado}`,
      data: pedidoActualizado
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'No se pudo actualizar el estado del pedido.',
      error: error.message
    });
  }
};
