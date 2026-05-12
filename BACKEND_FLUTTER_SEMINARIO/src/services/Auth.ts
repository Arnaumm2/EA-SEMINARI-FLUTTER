import Usuario, { IUsuarioModel } from '../models/Usuario';
import UsuarioService from './Usuario';
import { IUsuario } from '../models/Usuario';

const register = async (data: Partial<IUsuario>): Promise<IUsuarioModel> => {
    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ email: data.email });
    if (existingUser) {
        throw new Error('El correo electrónico ya está en uso');
    }

    return await UsuarioService.createUsuario(data);
};

const login = async (email: string, password: string): Promise<IUsuarioModel> => {
    const usuario = await Usuario.findOne({ email }).populate('organizacion');

    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }

    // Comparación en texto plano
    if (usuario.password !== password) {
        throw new Error('Contraseña incorrecta');
    }

    return usuario;
};

export default { register, login };
