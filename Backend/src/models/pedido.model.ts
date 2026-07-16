import { Schema, model, Document } from 'mongoose';


interface IArticuloPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}


export interface IPedido extends Document {
  clienteId: string;
  clienteNombre: string;
  articulos: IArticuloPedido[];
  total: number;
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  notas?: string;
  fechaCreacion: Date;
}


const ArticuloPedidoSchema = new Schema<IArticuloPedido>({
  productoId: { type: String, required: true },
  nombre: { type: String, required: true, trim: true },
  cantidad: {
    type: Number,
    required: true,
    min: [1, 'La cantidad mínima es 1']
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  }
}, { _id: false });

const PedidoSchema = new Schema<IPedido>({
  clienteId: {
    type: String,
    required: [true, 'El ID del cliente es obligatorio'],
    trim: true
  },
  clienteNombre: {
    type: String,
    required: [false, 'El nombre del cliente es obligatorio'],
    trim: true
  },
  articulos: {
    type: [ArticuloPedidoSchema],
    validate: [
      (arr: any[]) => arr.length > 0,
      'El pedido debe contener al menos un artículo'
    ]
  },
  total: {
    type: Number,
    required: [true, 'El total del pedido es obligatorio'],
    min: [0, 'El total no puede ser negativo']
  },
  estado: {
    type: String,
    enum: {
      values: ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'],
      message: '{VALUE} no es un estado de pedido válido'
    },
    default: 'pendiente'
  },
  notas: { type: String, trim: true }
}, {
  timestamps: true
});

export const PedidoModel = model<IPedido>('Pedido', PedidoSchema);