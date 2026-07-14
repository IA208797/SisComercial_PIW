export interface ArticuloPedido {
  productoId: string;
  cantidad: number;
}

export interface Pedido {
  clienteId: string;
  articulos: ArticuloPedido[];
  notas?: string;
}

export interface ProductoCatalogo {
  _id: string;
  nombre: string;
  precio: number;
  imagen: string;
}