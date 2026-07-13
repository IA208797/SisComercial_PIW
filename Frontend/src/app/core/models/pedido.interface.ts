export interface ArticuloPedido {
  productoId: string;
  cantidad: number;
}

export interface Pedido {
  clienteId: string;
  articulos: ArticuloPedido[];
  notas?: string;
}