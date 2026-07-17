import { Request, Response } from "express";
import mongoose from "mongoose";
import { PedidoModel } from "../models/pedido.model";
import { Producto } from "../models/producto.model";
import { Lealtad } from "../models/lealtad.model";

// //NOTA GLOBAL//
// La carpeta controllers contiene todos los archivos .ts que contienen todo la lógica de las funciones para la comunicación 
// con la base de datos básicamente reciben las solicitudes de la página y conectan con la base de datos para obtener lo que 
// se necesita, para una mayor organización la rutas de conexión están separadas en su propia carpeta, routes

////////////Si el de Kevin funciona no usar este
export const obtenerProductoenPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await Producto.find({}, '_id nombre precio imagen stock categoria');
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
    const { clienteId, clienteNombre, articulos, notas, recompensa_usada } = req.body;

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
      if (productoBD.stock < item.cantidad) {
        res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${productoBD.nombre}. Solo quedan ${productoBD.stock}.`
        });
      }
      productoBD.stock -= item.cantidad;
      await productoBD.save();


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

    // Aplicar el descuento directamente en el backend
    if (recompensa_usada) {
      if (recompensa_usada.descripcion === 'Descuento del 10%') {
        totalCalculado -= (totalCalculado * 0.10);
      } else if (recompensa_usada.descripcion === 'Bebida Gratis' || recompensa_usada.descripcion === 'Producto Promocional') {
        totalCalculado -= 50; // Asegúrate de que este valor coincida con la lógica de tu frontend
      } else if (recompensa_usada.descripcion === 'Cupón Especial VIP') {
        totalCalculado -= 150;
      }
      // Evitamos totales negativos
      totalCalculado = Math.max(0, totalCalculado);
    }

    const nuevoPedido = new PedidoModel({
      clienteId,
      clienteNombre,
      articulos: articulosProcesados,
      total: totalCalculado,
      notas,
      recompensa_usada
    });

    // ------------------- LÓGICA DE LEALTAD 
    if (clienteId) {
      const perfilLealtad = await Lealtad.findOne({ cliente_id: clienteId });

      if (perfilLealtad) {

        // A) Descontar puntos si usó una recompensa
        if (recompensa_usada) {
          if (perfilLealtad.puntos_acumulados < recompensa_usada.puntos_a_descontar) {
            res.status(400).json({ success: false, message: 'Puntos insuficientes por intento de fraude.' });
            return;
          }

          perfilLealtad.puntos_acumulados -= recompensa_usada.puntos_a_descontar;

          perfilLealtad.historial_transacciones.push({
            tipo: 'Canje',
            puntos_involucrados: recompensa_usada.puntos_a_descontar,
            descripcion: `Canje aplicado en pedido: ${recompensa_usada.descripcion}`,
            fecha: new Date(),
            pedido_id: nuevoPedido._id as any
          });
        }

        // B) Generar puntos por la compra actual (1 pt x cada $10 gastados)
        // Usamos Math.floor para redondear hacia abajo (Ej. $19.99 generan 1 punto)
        const puntosGanados = Math.floor(totalCalculado / 10);

        if (puntosGanados > 0) {
          perfilLealtad.puntos_acumulados += puntosGanados;

          perfilLealtad.historial_transacciones.push({
            tipo: 'Acumulacion',
            puntos_involucrados: puntosGanados,
            descripcion: `Compra de $${totalCalculado.toFixed(2)}`,
            fecha: new Date(),
            pedido_id: nuevoPedido._id as any
          });
        }

        // C) Registrar Visita Única Diaria
        const hoy = new Date();
        const ultimaVisita = new Date(perfilLealtad.fecha_ultima_actualizacion);

        // Extraemos cadenas 'YYYY-MM-DD' para comparar únicamente las fechas ignorando la hora
        const fechaHoyString = hoy.toISOString().split('T')[0];
        const ultimaVisitaString = ultimaVisita.toISOString().split('T')[0];

        if ((fechaHoyString !== ultimaVisitaString) || perfilLealtad.total_visitas === 0) {
          perfilLealtad.total_visitas += 1;
          perfilLealtad.fecha_ultima_actualizacion = hoy;
        }

        // Guardamos todos los cambios de lealtad en la base de datos
        await perfilLealtad.save();
      }
    }
    // --------------- FIN LÓGICA DE LEALTAD 

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
    const pedido = await PedidoModel.findById(id);

    if (!pedido) {
      res.status(404).json({ success: false, message: 'El pedido no existe.' });
      return;
    }

    // Prevenir doble reversión de puntos
    if (nuevoEstado === 'cancelado' && pedido.estado === 'cancelado') {
      res.status(400).json({ success: false, message: 'El pedido ya se encuentra cancelado.' });
      return;
    }

    // ================= LÓGICA DE REVERSIÓN (ROLLBACK) =================
    // Solo ejecutamos esto si la actualización fue exitosa, si cambió a cancelado, y si hay cliente
    if (pedido && nuevoEstado === 'cancelado' && pedido.clienteId) {
      const perfilLealtad = await Lealtad.findOne({ cliente_id: pedido.clienteId });

      if (perfilLealtad) {

        // A) Restar los puntos que el usuario había GANADO
        // Agregamos (|| 0) para evitar que pedidos antiguos sin total generen 'NaN'
        const totalPedido = pedido.total || 0;
        const puntosGanados = Math.floor(totalPedido / 10);

        // Validamos que sea mayor a 0 y que SÍ sea un número (!isNaN)
        if (puntosGanados > 0 && !isNaN(puntosGanados)) {
          perfilLealtad.puntos_acumulados -= puntosGanados;

          if (perfilLealtad.puntos_acumulados < 0) {
            perfilLealtad.puntos_acumulados = 0;
          }

          perfilLealtad.historial_transacciones.push({
            tipo: 'Canje',
            puntos_involucrados: puntosGanados,
            descripcion: 'Deducción por cancelación de pedido',
            fecha: new Date(),
            pedido_id: pedido._id as any
          });
        }

        // B) Reembolsar los puntos que el usuario había GASTADO
        // Verificamos de forma segura que exista el objeto y la propiedad
        if (pedido.recompensa_usada && pedido.recompensa_usada.puntos_a_descontar) {

          const puntosAReembolsar = pedido.recompensa_usada.puntos_a_descontar || 0;

          if (puntosAReembolsar > 0 && !isNaN(puntosAReembolsar)) {
            perfilLealtad.puntos_acumulados += puntosAReembolsar;

            perfilLealtad.historial_transacciones.push({
              tipo: 'Acumulacion',
              puntos_involucrados: puntosAReembolsar,
              descripcion: `Reembolso de recompensa por pedido cancelado: ${pedido.recompensa_usada.descripcion}`,
              fecha: new Date(),
              pedido_id: pedido._id as any
            });
          }
        }

        // Guardamos los cambios en el perfil de lealtad
        await perfilLealtad.save();
      }
    }
    // ================= FIN LÓGICA DE REVERSIÓN =================


    if (nuevoEstado === 'cancelado' && pedido.estado !== 'cancelado') {
      for (const item of pedido.articulos) {
        await Producto.findByIdAndUpdate(
          item.productoId,
          { $inc: { stock: item.cantidad } }
        );
      }
    }
    
    
    pedido.estado = nuevoEstado;
    const pedidoActualizado = await pedido.save();

    res.status(200).json({
      success: true,
      message: `Pedido actualizado a: ${nuevoEstado}`,
      data: pedidoActualizado
    });

  } catch (error: any) {
    console.error("Error crítico al actualizar estado:", error);
    res.status(400).json({
      success: false,
      message: 'No se pudo actualizar el estado del pedido.',
      error: error.message
    });
  }
};
