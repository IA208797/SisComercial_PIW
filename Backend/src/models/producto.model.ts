import { Schema, model, Document } from 'mongoose';

// //NOTA GLOBAL//
// La carpeta models contiene la estructura de la información que se va guardad/solicitar a la base de datos, como mongo 
// puede almacenar casi cualquier tipo de dato es mejor estar 100% seguro de lo que queremos guardar antes de hacer las
// solicitudes 

// Interfaz para TypeScript
export interface IProducto extends Document {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen: string;
  fecha: Date;
}

// Esquema de Mongoose
const ProductoSchema = new Schema<IProducto>({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  categoria: { type: String, required: true, trim: true },
  imagen: { type: String, required: false, trim: true, default: '' },
  fecha: { type: Date, default: Date.now },
});

// Exportamos el modelo para usarlo en los controladores
export const Producto = model<IProducto>('Producto', ProductoSchema);
