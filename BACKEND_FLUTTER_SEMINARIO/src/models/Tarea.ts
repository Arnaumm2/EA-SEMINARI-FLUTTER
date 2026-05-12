import mongoose, { Document, Schema, Types } from 'mongoose';


export type TaskStatus = 'todo' | 'in_progress' | 'done';
export interface ITarea {
    titulo: string;
    fechaInicio: Date;
    fechaFin: Date;
    organizacionId: Types.ObjectId | string;
    usuarios: Types.ObjectId[] | string[];
    status: TaskStatus;
}

export interface ITareaModel extends ITarea, Document {}

const TareaSchema: Schema = new Schema(
    {
        titulo: { type: String, required: true },
        fechaInicio: { type: Date, required: true },
        fechaFin: { type: Date, required: true },
        organizacionId: { type: Schema.Types.ObjectId, required: true, ref: 'Organizacion' },
        usuarios: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
        status: {
            type: String,
            enum: ['todo', 'in_progress', 'done'],
            default: 'todo',
        },
    },
    {
        versionKey: false
    }
);

export default mongoose.model<ITareaModel>('Tarea', TareaSchema);