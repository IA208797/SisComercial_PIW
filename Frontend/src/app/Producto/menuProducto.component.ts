import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

//Otro componente ahueso
@Component({
  selector: 'app-menu-producto',
  standalone: true,
  // imports: [Header, Footer],
  templateUrl: './menuProducto.component.html',
}) 

export class MenuProductoComponent {
  constructor(private http: HttpClient) {
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
  }
}