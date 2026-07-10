import { Schema, model, Document, Types } from "mongoose";

export interface ITransaccion {
  pedido_id?: Types.ObjectId;
  tipo: "Acumulacion" | "Canje";
  puntos_involucrados: number;
  descripcion: string;
  fecha: Date;
}

export interface ILealtad extends Document {
  cliente_id: Types.ObjectId;
  puntos_acumulados: number;
  total_visitas: number;
  nivel_actual: string;
  historial_transacciones: ITransaccion[];
  fecha_ultima_actualizacion: Date;
}

const LealtadSchema = new Schema<ILealtad>({
  cliente_id: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    unique: true,
  },
  puntos_acumulados: { type: Number, default: 0 },
  total_visitas: { type: Number, default: 0 },
  nivel_actual: { type: String, default: "Regular" },
  historial_transacciones: [
    {
      pedido_id: { type: Schema.Types.ObjectId, ref: "Pedido" },
      tipo: { type: String, enum: ["Acumulacion", "Canje"], required: true },
      puntos_involucrados: { type: Number, required: true },
      descripcion: { type: String, required: true },
      fecha: { type: Date, default: Date.now },
    },
  ],
  fecha_ultima_actualizacion: { type: Date, default: Date.now },
});

export const Lealtad = model<ILealtad>("Lealtad", LealtadSchema);
