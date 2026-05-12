import express from 'express';
import controller from '../controllers/Organizacion';
import tareaController from '../controllers/Tarea';
import { Schemas, ValidateJoi } from '../middleware/Joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Organizaciones
 *     description: Endpoints CRUD de organizaciones
 *
 * components:
 *   schemas:
 *     Organizacion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ObjectId de MongoDB
 *           example: "65f1c2a1b2c3d4e5f6789013"
 *         name:
 *           type: string
 *           example: "EA Company"
 *         usuarios:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de ObjectIds de usuarios
 *           example: ["65f1c2a1b2c3d4e5f6789012"]
 *     OrganizacionCreateUpdate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "EA Company"
 *     TareaUsuarioAsignado:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ObjectId del usuario
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         name:
 *           type: string
 *           example: "Judit"
 *     Tarea:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ObjectId de MongoDB
 *           example: "65f1c2a1b2c3d4e5f6789020"
 *         titulo:
 *           type: string
 *           example: "Preparar sprint planning"
 *         fechaInicio:
 *           type: string
 *           format: date-time
 *           example: "2026-04-16T08:00:00.000Z"
 *         fechaFin:
 *           type: string
 *           format: date-time
 *           example: "2026-04-20T17:00:00.000Z"
 *         organizacionId:
 *           type: string
 *           description: ObjectId de la organización propietaria
 *           example: "65f1c2a1b2c3d4e5f6789013"
 *         usuarios:
 *           type: array
 *           description: Usuarios asignados a la tarea (poblados con name)
 *           items:
 *             $ref: '#/components/schemas/TareaUsuarioAsignado'
 *     TareaCreate:
 *       type: object
 *       required:
 *         - titulo
 *         - fechaInicio
 *         - fechaFin
 *       properties:
 *         titulo:
 *           type: string
 *           example: "Preparar sprint planning"
 *         fechaInicio:
 *           type: string
 *           format: date-time
 *           example: "2026-04-16T08:00:00.000Z"
 *         fechaFin:
 *           type: string
 *           format: date-time
 *           example: "2026-04-20T17:00:00.000Z"
 *         usuarios:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de ObjectIds de usuarios asignados
 *           example: ["65f1c2a1b2c3d4e5f6789012"]
 */

/**
 * @openapi
 * /organizaciones:
 *   post:
 *     summary: Crea una organización
 *     tags: [Organizaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizacionCreateUpdate'
 *     responses:
 *       201:
 *         description: Creado
 *       422:
 *         description: Validación fallida (Joi)
 */
router.post('/', ValidateJoi(Schemas.organizacion.create), controller.createOrganizacion);

/**
 * @openapi
 * /organizaciones/{organizacionId}/tareas:
 *   post:
 *     summary: Crea una tarea dentro de una organización
 *     tags: [Organizaciones]
 *     parameters:
 *       - in: path
 *         name: organizacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de la organización
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TareaCreate'
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarea'
 *       404:
 *         description: Organización no encontrada
 *       422:
 *         description: Validación fallida (Joi)
 */
router.post('/:organizacionId/tareas', ValidateJoi(Schemas.tarea.create), tareaController.createByOrganizacion);

/**
 * @openapi
 * /organizaciones/{organizacionId}/tareas:
 *   get:
 *     summary: Lista todas las tareas de una organización
 *     tags: [Organizaciones]
 *     parameters:
 *       - in: path
 *         name: organizacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de la organización
 *     responses:
 *       200:
 *         description: OK (array de tareas o array vacío)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarea'
 */
router.get('/:organizacionId/tareas', tareaController.readByOrganizacion);

/**
 * @openapi
 * /organizaciones/{organizacionId}:
 *   get:
 *     summary: Obtiene una organización por ID
 *     tags: [Organizaciones]
 *     parameters:
 *       - in: path
 *         name: organizacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de la organización
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizacion'
 *       404:
 *         description: No encontrado
 */
router.get('/:organizacionId', controller.readOrganizacion);

/**
 * @openapi
 * /organizaciones:
 *   get:
 *     summary: Lista todas las organizaciones
 *     tags: [Organizaciones]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organizacion'
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /organizaciones/{organizacionId}:
 *   put:
 *     summary: Actualiza una organización por ID
 *     tags: [Organizaciones]
 *     parameters:
 *       - in: path
 *         name: organizacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de la organización
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizacionCreateUpdate'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizacion'
 *       404:
 *         description: No encontrado
 *       422:
 *         description: Validación fallida (Joi)
 */
router.put('/:organizacionId', ValidateJoi(Schemas.organizacion.update), controller.updateOrganizacion);

/**
 * @openapi
 * /organizaciones/{organizacionId}/tareas/{tareaId}/status:
 *   patch:
 *     summary: Actualiza el estado de una tarea
 *     tags: [Organizaciones]
 *     parameters:
 *       - in: path
 *         name: organizacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de la organización
 *       - in: path
 *         name: tareaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 example: in_progress
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Tarea no encontrada
 */
router.patch(
  '/:organizacionId/tareas/:tareaId/status',
  tareaController.updateStatusByOrganizacion,
);

/**
 * @openapi
 * /organizaciones/{organizacionId}:
 *   delete:
 *     summary: Elimina una organización por ID
 *     tags: [Organizaciones]
 *     parameters:
 *       - in: path
 *         name: organizacionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId de la organización
 *     responses:
 *       200:
 *         description: Eliminado correctamente
 *       404:
 *         description: No encontrado
 */
router.delete('/:organizacionId', controller.deleteOrganizacion);



export default router;
