import { Router } from 'express';
import {
    registrarUsuario, loginUsuario
} from '../controllers/usuario.controller';

console.log(">>> usuario.routes cargado <<<");

const router = Router();

// Registrar usuario
router.post('/registro', registrarUsuario);

// Login
router.post('/login', loginUsuario);

export default router;