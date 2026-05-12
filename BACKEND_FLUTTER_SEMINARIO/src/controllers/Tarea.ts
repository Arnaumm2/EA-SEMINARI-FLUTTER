import { NextFunction, Request, Response } from 'express';
import TareaService from '../services/Tarea';

const createByOrganizacion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const savedTarea = await TareaService.createTareaByOrganizacion(req.params.organizacionId, req.body);
        return savedTarea ? res.status(201).json(savedTarea) : res.status(404).json({ message: 'not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readByOrganizacion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tareas = await TareaService.getTareasByOrganizacion(req.params.organizacionId);
        return res.status(200).json(tareas);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateStatusByOrganizacion = async (req: Request, res: Response) => {
  try {
    const { organizacionId, tareaId } = req.params;
    const { status } = req.body;

    const estadosValidos = ['todo', 'in_progress', 'done'];

    if (!estadosValidos.includes(status)) {
      return res.status(400).json({
        message: 'Estado de tarea no válido',
      });
    }

    const tareaActualizada = await TareaService.updateTaskStatus(
            organizacionId,
            tareaId,
            status
        );


    if (!tareaActualizada) {
      return res.status(404).json({
        message: 'Tarea no encontrada',
      });
    }

    return res.status(200).json(tareaActualizada);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al actualizar el estado de la tarea',
      error,
    });
  }
};

export default { createByOrganizacion, readByOrganizacion, updateStatusByOrganizacion};