import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/Auth';

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nuevoUsuario = await AuthService.register(req.body);
        return res.status(201).json(nuevoUsuario);
    } catch (error: any) {
        if (error.message === 'El correo electrónico ya está en uso') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error });
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const usuario = await AuthService.login(email, password);
        return res.status(200).json(usuario);
    } catch (error: any) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Contraseña incorrecta') {
            return res.status(401).json({ message: error.message });
        }
        return res.status(500).json({ error });
    }
};

export default { register, login };
