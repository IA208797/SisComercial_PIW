import { Request, Response } from "express";
import mongoose from "mongoose";
import { Lealtad } from "../models/lealtad.model";
import { Usuario } from "../models/usuario.model"; 

// --- FUNCIÓN HELPER (Maneja la lógica pesada y evita errores de tipado) ---
const buscarUsuarioPorIdOTelefono = async (criterio: string) => {
  const condicionesBusqueda: any[] = [
    { telefono: criterio },
    { telefono: criterio.replace(/\D/g, "") }
  ];

  if (mongoose.Types.ObjectId.isValid(criterio)) {
    condicionesBusqueda.push({ _id: criterio });
  }

  return await Usuario.findOne({ $or: condicionesBusqueda });
};


// 1. REGISTRO DE VISITAS Y SISTEMA DE PUNTOS
export const registrarVisitaYPuntos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // cliente_id aquí puede ser un teléfono (ej: "6565301122") o un ID de Mongo
    const { cliente_id, pedido_id, total_compra } = req.body;

    const usuarioExiste = await buscarUsuarioPorIdOTelefono(String(cliente_id));
    if (!usuarioExiste) {
      res.status(404).json({ message: "Cliente no encontrado en el sistema de la tienda" });
      return;
    }

    // Usamos usuarioExiste._id (el ID real de Mongo), NUNCA la variable cliente_id que viene del body
    let cuentaLealtad = await Lealtad.findOne({ cliente_id: usuarioExiste._id });

    if (!cuentaLealtad) {
      cuentaLealtad = new Lealtad({
        cliente_id: usuarioExiste._id, // Usamos el ID real
        puntos_acumulados: 0,
        total_visitas: 0,
        nivel_actual: "Regular",
        historial_transacciones: [],
      });
    }

    const puntosAGanar = Math.floor(total_compra / 10);

    cuentaLealtad.total_visitas += 1;
    cuentaLealtad.puntos_acumulados += puntosAGanar;

    cuentaLealtad.historial_transacciones.push({
      tipo: "Acumulacion",
      puntos_involucrados: puntosAGanar,
      descripcion: `Puntos ganados por consumo de $${total_compra}`,
      fecha: new Date(),
    });

    if (cuentaLealtad.total_visitas > 24) {
      cuentaLealtad.nivel_actual = "VIP";
    } else if (cuentaLealtad.total_visitas > 12) {
      cuentaLealtad.nivel_actual = "Frecuente";
    }

    cuentaLealtad.fecha_ultima_actualizacion = new Date();
    await cuentaLealtad.save();

    res.status(200).json({
      mensaje: "Visita y puntos registrados con éxito",
      cliente: usuarioExiste.nombre,
      saldo_puntos: puntosAGanar,
      total_visitas: cuentaLealtad.total_visitas,
      nivel_actual: cuentaLealtad.nivel_actual,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al procesar la visita",
      error: error.message || error,
    });
  }
};


// 2. SISTEMA DE PUNTOS (Canje de recompensas)
export const canjearPuntos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cliente_id, puntos_a_descontar, descripcion_recompensa } = req.body;

    const usuarioExiste = await buscarUsuarioPorIdOTelefono(String(cliente_id));
    if (!usuarioExiste) {
      res.status(404).json({ message: "Cliente no encontrado para realizar el canje" });
      return;
    }

    // Nuevamente, buscamos usando el ID real de MongoDB
    const cuentaLealtad = await Lealtad.findOne({ cliente_id: usuarioExiste._id });
    if (!cuentaLealtad || cuentaLealtad.puntos_acumulados < puntos_a_descontar) {
      res.status(400).json({ message: "Puntos insuficientes o cuenta no encontrada" });
      return;
    }

    cuentaLealtad.puntos_acumulados -= puntos_a_descontar;
    cuentaLealtad.historial_transacciones.push({
      tipo: "Canje",
      puntos_involucrados: -puntos_a_descontar,
      descripcion: `Canje: ${descripcion_recompensa}`,
      fecha: new Date(),
    });

    cuentaLealtad.fecha_ultima_actualizacion = new Date();
    await cuentaLealtad.save();

    res.status(200).json({ message: "Canje realizado con éxito", cuentaLealtad });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar el canje", error });
  }
};


// 3. REPORTES BÁSICOS
export const obtenerReporteLealtad = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const estadisticas = await Lealtad.aggregate([
      {
        $group: {
          _id: null,
          totalPuntosGlobales: { $sum: "$puntos_acumulados" },
          totalVisitasGlobales: { $sum: "$total_visitas" },
          clientesActivos: { $count: {} },
        },
      },
    ]);

    const distribucionNiveles = await Lealtad.aggregate([
      { $group: { _id: "$nivel_actual", cantidad: { $sum: 1 } } },
    ]);

    res.status(200).json({
      resumen: estadisticas[0] || { totalPuntosGlobales: 0, totalVisitasGlobales: 0, clientesActivos: 0 },
      niveles: distribucionNiveles,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al generar el reporte", error });
  }
};


// 4. OBTENER CUENTA DE LEALTAD POR ID DE CLIENTE O TELÉFONO
export const obtenerClientePorId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = req.params.id;
    
    // Validación de seguridad para que TypeScript sepa que query es 100% un string
    if (!query || typeof query !== 'string') {
        res.status(400).json({ message: "El ID o teléfono proporcionado no es válido." });
        return; 
    }

    const usuario = await buscarUsuarioPorIdOTelefono(query);

    if (!usuario) {
      res.status(404).json({ message: "Cuenta de usuario no encontrada con ese dato." });
      return;
    }

    const cuentaLealtad = await Lealtad.findOne({ cliente_id: usuario._id });

    if (!cuentaLealtad) {
      res.status(404).json({ message: "El usuario existe, pero aún no tiene visitas ni cuenta de lealtad." });
      return;
    }

    res.status(200).json(cuentaLealtad);
    
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};