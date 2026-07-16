import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ArticuloCarrito {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito = new BehaviorSubject<ArticuloCarrito[]>([]);
  
  public carrito$ = this.carrito.asObservable();

  constructor() {}

  public obtenerValorActual(): ArticuloCarrito[] {
    return this.carrito.getValue();
  }

  public agregarArticulo(articuloNuevo: ArticuloCarrito): void {
    const itemsActuales = this.obtenerValorActual();
    const indice = itemsActuales.findIndex(item => item.productoId === articuloNuevo.productoId);

    if (indice !== -1) {
      itemsActuales[indice].cantidad += 1;
    } else {
      itemsActuales.push(articuloNuevo);
    }

    this.carrito.next([...itemsActuales]);
  }

  public actualizarCantidad(productoId: string, cantidad: number): void {
    let itemsActuales = this.obtenerValorActual();
    const indice = itemsActuales.findIndex(item => item.productoId === productoId);

    if (indice !== -1) {
      if (cantidad <= 0) {
        itemsActuales.splice(indice, 1);
      } else {
        itemsActuales[indice].cantidad = cantidad;
      }
      this.carrito.next([...itemsActuales]);
    }
  }

  public obtenerCantidadDeProducto(productoId: string): number {
    const itemsActuales = this.obtenerValorActual();
    const item = itemsActuales.find(p => p.productoId === productoId);
    return item ? item.cantidad : 0;
  }
  public sincronizarCarrito(nuevosArticulos: ArticuloCarrito[]): void {
  this.carrito.next([...nuevosArticulos]);
  }
}