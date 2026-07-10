import { Schema, model } from "mongoose";

const usuarioSchema = new Schema({
  nombre: { type: String, required: true },
  telefono: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: [/^\d{10}$/, "El número de teléfono debe tener 10 dígitos"],
  },
  email: { type: String, required: true, unique: true },
  rol: { type: String, enum: ["cliente", "admin"], default: "cliente" },
  fecha_registro: { type: Date, default: Date.now },
});

export const Usuario = model("Usuario", usuarioSchema);
