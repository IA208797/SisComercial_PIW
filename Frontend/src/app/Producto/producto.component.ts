import { Component, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

//Primera prueba de mi componente
@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './producto.component.html',
})

export class ProductoComponent {

  //Obtener mis datos guardadois
  constructor(private http: HttpClient) {
    this.obtenerProductos();
  }

  //Prueba de edicion de productos
  productos = signal<any[]>([]);
  productoEditandoId = signal('');

  nombre = signal('');
  descripcion = signal('');
  precio = signal('');
  stock = signal('');
  categoria = signal('');

  //conexion
  apiUrl = 'http://localhost:4000/api/productos';

  //validaciones robadas del form
  //computed funcion de angular
  nombreError = computed(() => {
    const valor = this.nombre().trim();

    if (!valor) return 'El nombre del producto es obligatorio.';
    if (valor.length < 3) return 'El nombre debe tener mínimo 3 caracteres.';
    if (valor.length > 50) return 'El nombre no puede pasar de 50 caracteres.';
    return '';
  });

  descripcionError = computed(() => {
    const valor = this.descripcion().trim();

    if (!valor) return 'La descripción es obligatoria.';
    if (valor.length < 10) return 'La descripción debe tener mínimo 10 caracteres.';
    if (valor.length > 200) return 'La descripción no puede pasar de 200 caracteres.';
    return '';
  });

  precioError = computed(() => {
    const valor = Number(this.precio());

    if (this.precio().trim() === '') return 'El precio es obligatorio.';
    if (isNaN(valor)) return 'El precio debe ser un número.';
    if (valor <= 0) return 'El precio debe ser mayor a 0.';
    return '';
  });

  stockError = computed(() => {
    const valor = Number(this.stock());

    if (this.stock().trim() === '') return 'El stock es obligatorio.';
    if (isNaN(valor)) return 'El stock debe ser un número.';
    if (valor < 0) return 'El stock no puede ser negativo.';
    return '';
  });

  categoriaError = computed(() => {
    const valor = this.categoria().trim();

    if (!valor) return 'La categoría es obligatoria.';
    if (valor.length < 3) return 'La categoría debe tener mínimo 3 caracteres.';
    if (valor.length > 40) return 'La categoría no puede pasar de 40 caracteres.';
    return '';
  });


  //por si acasooo
  formularioValido = computed(() => {
    return (
      !this.nombreError() &&
      !this.descripcionError() &&
      !this.precioError() &&
      !this.stockError() &&
      !this.categoriaError()
    );
  });

  //En caso de que la base de datos explote
  obtenerProductos() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (respuesta) => {
        this.productos.set(respuesta);
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        alert('Error al obtener productos');
      },
    });
  }

  //Funciones del CRUD

  //Guardar
  guardarProducto() {
    if (!this.formularioValido()) return;

    const producto = {
      nombre: this.nombre().trim(),
      descripcion: this.descripcion().trim(),
      precio: Number(this.precio()),
      stock: Number(this.stock()),
      categoria: this.categoria().trim(),
    };

    //Actualizar en caso de de que exiata un produicto
    if (this.productoEditandoId()) {
      this.http.put(`${this.apiUrl}/${this.productoEditandoId()}`, producto).subscribe({
        next: () => {
          alert('Producto actualizado correctamente');
          this.limpiarFormulario();
          this.obtenerProductos();
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          alert('Error al actualizar producto');
        },
      });
    } else {
      this.http.post(this.apiUrl, producto).subscribe({
        next: () => {
          alert('Producto guardado correctamente');
          this.limpiarFormulario();
          this.obtenerProductos();
        },
        error: (error) => {
          console.error('Error al guardar producto:', error);
          alert('Error al guardar producto');
        },
      });
    }
  }

  //editar sin necesidad de guardar
  editarProducto(producto: any) {
    this.productoEditandoId.set(producto._id);
    this.nombre.set(producto.nombre);
    this.descripcion.set(producto.descripcion);
    this.precio.set(String(producto.precio));
    this.stock.set(String(producto.stock));
    this.categoria.set(producto.categoria);
  }

  //Eliminar
  eliminarProducto(id: string) {
    const confirmar = confirm('¿Seguro que deseas eliminar este producto?');

    if (!confirmar) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        alert('Producto eliminado correctamente');
        this.obtenerProductos();
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar producto');
      },
    });
  }

  limpiarFormulario() {
    this.productoEditandoId.set('');
    this.nombre.set('');
    this.descripcion.set('');
    this.precio.set('');
    this.stock.set('');
    this.categoria.set('');
  }
}