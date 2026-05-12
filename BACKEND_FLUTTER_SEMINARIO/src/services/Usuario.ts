import mongoose from 'mongoose';
import Usuario, { IUsuarioModel, IUsuario } from '../models/Usuario';
import Organizacion from '../models/Organizacion';

const createUsuario = async (data: Partial<IUsuario>): Promise<IUsuarioModel> => {
    const usuario = new Usuario({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });
    const savedUsuario = await usuario.save();

    if (savedUsuario.organizacion) {
        await Organizacion.findByIdAndUpdate(savedUsuario.organizacion, {
            $push: { usuarios: savedUsuario._id }
        });
    }

    return savedUsuario;
};

const getUsuario = async (usuarioId: string): Promise<IUsuarioModel | null> => {
    return await Usuario.findById(usuarioId).populate('organizacion');
};

const getAllUsuarios = async (): Promise<IUsuarioModel[]> => {
    return await Usuario.find().populate('organizacion');
};

const updateUsuario = async (usuarioId: string, data: Partial<IUsuario>): Promise<IUsuarioModel | null> => {
    const usuario = await Usuario.findById(usuarioId);
    if (usuario) {
        const oldOrganizacionId = usuario.organizacion;
        usuario.set(data);
        const updatedUsuario = await usuario.save();

        if (data.organizacion && oldOrganizacionId?.toString() !== data.organizacion.toString()) {
            if (oldOrganizacionId) {
                await Organizacion.findByIdAndUpdate(oldOrganizacionId, {
                    $pull: { usuarios: usuario._id }
                });
            }
            await Organizacion.findByIdAndUpdate(data.organizacion, {
                $push: { usuarios: usuario._id }
            });
        }

        return updatedUsuario;
    }
    return null;
};

const deleteUsuario = async (usuarioId: string): Promise<IUsuarioModel | null> => {
    const usuario = await Usuario.findById(usuarioId);
    if (usuario) {
        if (usuario.organizacion) {
            await Organizacion.findByIdAndUpdate(usuario.organizacion, {
                $pull: { usuarios: usuario._id }
            });
        }
        return await Usuario.findByIdAndDelete(usuarioId);
    }
    return null;
};

export default { createUsuario, getUsuario, getAllUsuarios, updateUsuario, deleteUsuario };