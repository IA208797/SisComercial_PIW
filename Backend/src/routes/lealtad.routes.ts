import { Router } from "express";
import {
  registrarVisitaYPuntos,
  canjearPuntos,
  obtenerReporteLealtad,
  obtenerClientePorId,
} from "../controllers/lealtad.controller";

const router = Router();

// Ruta para cuando un pedido pasa a "entregado" (Suma visita y puntos)
router.post("/visita", registrarVisitaYPuntos);

// Ruta para cuando el cliente gasta sus puntos
router.post("/canjear", canjearPuntos);

// Ruta para el panel de reportes del administrador
router.get("/reporte", obtenerReporteLealtad);

// Ruta para obtener la cuenta de lealtad de un cliente específico (para pruebas)
router.get("/cliente/:id", obtenerClientePorId);

export default router;
