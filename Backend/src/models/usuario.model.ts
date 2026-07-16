import { Schema, Document, model} from 'mongoose';

export interface IUsuario extends Document {
  nombre: string;
  correo: string;
  telefono: string;
  password: string;
  rol: 'cliente' | 'admin';
}

const usuarioSchema = new Schema<IUsuario>({
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    telefono: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ['cliente', 'admin'],
      default: 'cliente',
    }
  },
  {
    timestamps: true,
  }
);

export const Usuario = model<IUsuario>('Usuario', usuarioSchema);
