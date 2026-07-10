import { Component, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './producto.component.html',
})
export class ProductoComponent {

  constructor(private http: HttpClient) {
    this.obtenerProductos();
  }

  productos = signal<any[]>([]);
  productoEditandoId = signal('');

  nombre = signal('');
  descripcion = signal('');
  precio = signal('');
  stock = signal('');
  categoria = signal('');
  imagen = signal('');

  apiUrl = 'http://localhost:4000/api/productos';

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

  imagenError = computed(() => {
    const valor = this.imagen().trim();

    if (!valor) return '';

    try {
      const url = new URL(valor);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return 'La imagen debe usar una URL http o https.';
      }

      return '';
    } catch {
      return 'Escribe una URL válida para la imagen.';
    }
  });

  formularioValido = computed(() => {
    return (
      !this.nombreError() &&
      !this.descripcionError() &&
      !this.precioError() &&
      !this.stockError() &&
      !this.categoriaError() &&
      !this.imagenError()
    );
  });

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

  guardarProducto() {
    if (!this.formularioValido()) return;

    const producto = {
      nombre: this.nombre().trim(),
      descripcion: this.descripcion().trim(),
      precio: Number(this.precio()),
      stock: Number(this.stock()),
      categoria: this.categoria().trim(),
      imagen: this.imagen().trim(),
    };

    if (this.productoEditandoId()) {
      this.http
        .put(`${this.apiUrl}/${this.productoEditandoId()}`, producto)
        .subscribe({
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

  editarProducto(producto: any) {
    this.productoEditandoId.set(producto._id);
    this.nombre.set(producto.nombre ?? '');
    this.descripcion.set(producto.descripcion ?? '');
    this.precio.set(String(producto.precio ?? ''));
    this.stock.set(String(producto.stock ?? ''));
    this.categoria.set(producto.categoria ?? '');
    this.imagen.set(producto.imagen ?? '');
  }

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
    this.imagen.set('');
  }
}
