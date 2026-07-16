import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
// import { Header } from '../shared/header/header';
// import { Footer } from '../shared/footer/footer';

/////////Para el carrito de compras BORRAR SI NO FUNCIONA
import { CarritoService } from '../../services/carrito.service';

//Otro componente ahueso
@Component({
  selector: 'app-menu-producto',
  standalone: true,
  // imports: [Header, Footer],
  templateUrl: './menuProducto.component.html',
})

export class MenuProductoComponent {
  constructor(
    private http: HttpClient,
    private carritoService: CarritoService,
    private authService: AuthService
  ) {
    //cargar todo en cuanto suceda el click
    this.obtenerProductos();
  }

  //poner los productos de mi base en un arreglo
  //pinche angular
  productos = signal<any[]>([]);

  apiUrl = 'http://localhost:4000/api/productos';

  obtenerProductos() {
    //mostrar mis objetos
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (respuesta) => {
        this.productos.set(respuesta);
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        alert('Error al cargar el menú de productos');
      },
    });
    console.log(this.productos);
  }

  /////////Este bloque es para el carrito de compras BORRAR SI NO FUNCIONA


  public obtenerCantidad(productoId: string): number {
    return this.carritoService.obtenerCantidadDeProducto(productoId);
  }

  public agregarAlCarrito(producto: any): void {
    if (!this.authService.estaLogueado()) { 
      alert("Necesitas iniciar sesión para agregar productos al carrito");
      return;
    }

    if (producto.stock <= 0) {
      alert("Lo sentimos, este producto está agotado por el momento.");
      return;
    }

    this.carritoService.agregarArticulo({
      productoId: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      imagen: producto.imagen
    });
  }

  public modificarCantidad(productoId: string, cambio: number): void {
    const cantidadActual = this.obtenerCantidad(productoId);
    
    if (cambio > 0) {
      const catalogoActual = this.productos();
      const productoEnMenu = catalogoActual.find((p: any) => p._id === productoId);
    
      if (productoEnMenu && cantidadActual >= productoEnMenu.stock) {
        alert(`Solo hay ${productoEnMenu.stock} unidades disponibles en este momento.`);
        return; 
      }
    }
    this.carritoService.actualizarCantidad(productoId, cantidadActual + cambio);
  }

  /////////Este bloque es para el carrito de compras BORRAR SI NO FUNCIONA
}