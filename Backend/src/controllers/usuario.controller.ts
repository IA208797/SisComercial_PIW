import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../models/usuario.model';

// Registrar usuario
export const registrarUsuario = async (req: Request, res: Response) => {
    try {
        const { nombre, correo, telefono, password } = req.body;

        // Verificar si ya existe el correo
        const usuarioExistente = await Usuario.findOne({ correo });

        if (usuarioExistente) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado.'
            });
        }

        // Cifrar contraseña
        const passwordEncriptada = await bcrypt.hash(password, 10);

        // Crear usuario
        const nuevoUsuario = new Usuario({
            nombre,
            correo,
            telefono,
            password: passwordEncriptada
        });

        await nuevoUsuario.save();

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente.'
        });

    } catch (error: any) {
        console.error("ERROR REGISTRO:", error);

        res.status(500).json({
            mensaje: 'Error al registrar usuario.',
            error: error.message
        });
    }
};
// Login de usuario
export const loginUsuario = async (req: Request, res: Response) => {

    try {

        const { correo, password } = req.body;

        // Buscar usuario por correo
        const usuario = await Usuario.findOne({ correo }).select('+password');

        if (!usuario) {
            return res.status(404).json({
                mensaje: "Correo o contraseña incorrectos."
            });
        }

        // Comparar contraseña
        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: "Correo o contraseña incorrectos."
            });
        }

        // Generar token
        const token = jwt.sign(
            {
                id: usuario._id,
                correo: usuario.correo
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "2h"
            }
        );

        // Respuesta
        res.status(200).json({
            mensaje: "Login correcto.",
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });

    } catch (error: any) {

        console.error("ERROR LOGIN:", error);

        res.status(500).json({
            mensaje: "Error al iniciar sesión.",
            error: error.message
        });

    }

};