import { Schema, model } from 'mongoose';

const itemPedidoSchema = new Schema({
  producto_id: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true }
});

const pedidoSchema = new Schema({
  cliente_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  items: [itemPedidoSchema],
  total: { type: Number, required: true },
  estado: { type: String, enum: ['pendiente', 'preparando', 'entregado'], default: 'pendiente' },
  fecha: { type: Date, default: Date.now }
});

export const Pedido = model('Pedido', pedidoSchema);