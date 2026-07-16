import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido, ProductoCatalogo } from '../../../core/models/pedido.interface';
import { CarritoService, ArticuloCarrito } from '../../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ComponentePedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './realizarpedido.page.html'
})

export class ConfirmacionPedidoComponent implements OnInit {
  public pedidoForm: FormGroup;
  public catalogoProductos: ProductoCatalogo[] = [];
  public articulosPrecargados: ArticuloCarrito[] = [];
  public totalVisual: number = 0;
  public nombreCliente: string = 'Cliente General';

  constructor(
    private readonly fb: FormBuilder,
    private readonly pedidoService: PedidoService,
    private readonly carritoService: CarritoService,
    private readonly cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.pedidoForm = this.fb.group({
      clienteId: ['', [Validators.required]],
      clienteNombre: ['', [Validators.required]],
      articulos: this.fb.array([]),
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.articulosPrecargados = this.carritoService.obtenerValorActual();
    this.cargarCatalogo();
    this.obtenerUsuario();

  }

  // OBSOLETO
  // private cargarCatalogo(): void {
  //   this.pedidoService.obtenerProductos().subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         this.catalogoProductos = response.data;
  //         this.agregarArticulo();
  //         console.log(this.catalogoProductos[6].imagen)
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error al cargar los productos en el frontend:', err);
  //       alert('No se pudo conectar con el catálogo de productos.');
  //     }
  //   });
  // }

  private cargarCatalogo(): void {
    this.pedidoService.obtenerProductos().subscribe({
      next: (response) => {
        if (response.success) {
          this.catalogoProductos = response.data;


          this.articulos.clear();

          if (this.articulosPrecargados.length > 0) {
            this.articulosPrecargados.forEach(articulo => {
              this.agregarArticulo(articulo.productoId, articulo.cantidad);
            });
          } else {
            this.agregarArticulo();
          }

          this.calcularTotal();

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al cargar los productos en el frontend:', err);
        alert('No se pudo conectar con el catálogo de productos.');
      }
    });
  }

  get articulos(): FormArray {
    return this.pedidoForm.get('articulos') as FormArray;
  }
  //OBSOLETO
  // private crearArticuloGroup(): FormGroup {
  //   return this.fb.group({
  //     productoId: ['', [Validators.required]], // Este campo ahora se llenará vía select
  //     cantidad: [1, [Validators.required, Validators.min(1)]]
  //   });
  // }

  private crearArticuloGroup(productoIdInicial: string = '', cantidadInicial: number = 1): FormGroup {
    return this.fb.group({
      productoId: [productoIdInicial, [Validators.required]],
      cantidad: [cantidadInicial, [Validators.required, Validators.min(1)]]
    });
  }

  // OBSOLETO
  // public agregarArticulo(): void {
  //   this.articulos.push(this.crearArticuloGroup());
  //   this.calcularTotal();
  // }

  public agregarArticulo(productoId: string = '', cantidad: number = 1): void {
    this.articulos.push(this.crearArticuloGroup(productoId, cantidad));
    this.calcularTotal();
  }

  public eliminarArticulo(index: number): void {
    this.articulos.removeAt(index);
    this.calcularTotal();
  }

  // OBSOLETO
  // public calcularTotal(): void {
  //   let acumulado = 0;


  //   this.articulos.controls.forEach((control) => {
  //     const prodId = control.get('productoId')?.value;
  //     const cantidad = control.get('cantidad')?.value || 0;

  //     const productoEncontrado = this.catalogoProductos.find(p => p._id === prodId);

  //     if (productoEncontrado) {
  //       acumulado += productoEncontrado.precio * cantidad;
  //     }
  //   });

  //   this.totalVisual = acumulado;
  // }

  public calcularTotal(): void {
    let acumulado = 0;
    const nuevosArticulosCarrito: ArticuloCarrito[] = [];

    this.articulos.controls.forEach((control) => {
      const prodId = control.get('productoId')?.value;
      const cantidad = control.get('cantidad')?.value || 0;

      const productoEncontrado = this.catalogoProductos.find(p => p._id === prodId);

      if (productoEncontrado) {
        acumulado += productoEncontrado.precio * cantidad;

        if (cantidad > 0) {
          nuevosArticulosCarrito.push({
            productoId: productoEncontrado._id,
            nombre: productoEncontrado.nombre,
            precio: productoEncontrado.precio,
            cantidad: cantidad,
            imagen: productoEncontrado.imagen
          });
        }
      }
    });

    this.totalVisual = acumulado;

    // Enviamos el estado actualizado del formulario al servicio global de forma síncrona
    this.carritoService.sincronizarCarrito(nuevosArticulosCarrito);
  }

  public obtenerImagenProducto(idProducto: string): string {
    if (!idProducto) {
      return '';
    }
    const imagenProducto = this.catalogoProductos.find(p => p._id == idProducto);
    console.log(imagenProducto);
    return imagenProducto?.imagen || 'https://klipy.com/gifs/inzaynia-twitch-2/player';

  }

  public obtenerUsuario(): string {

    const datosGuardados = localStorage.getItem("usuario");

    if (datosGuardados) {
      try {
        const objetoJson = JSON.parse(datosGuardados);
        //console.log(objetoJson)
        const NombreUsuario = objetoJson.nombre;
        this.nombreCliente = NombreUsuario;
        //console.log(NomnbreUsuario)
        this.pedidoForm.patchValue({
          clienteId: objetoJson.id,
          clienteNombre: NombreUsuario
        });
        console.log(this.pedidoForm)
        return NombreUsuario;

      } catch (error) {

        console.error('Error al transformar los datos del localStorage', error);
        return '';
      }
    } else {
      console.log('No se encontró nada en el localStorage con esa llave.');
      return 'Sesión no iniciada';
    }
  }

  public onSubmit(): void {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }

    const payload: Pedido = this.pedidoForm.value;

    this.pedidoService.crearPedido(payload).subscribe({
      next: (response) => {
        //alert(`Totlal del pedido: $${response.data.total}`);
        this.pedidoForm.reset({ clienteId: '',clienteNombre: '', notas: '' });
        this.articulos.clear();
        this.agregarArticulo();
        this.router.navigate(['cliente/misPedidos']);
      },
      error: (error) => {
        alert(error.error?.message || 'Error al guardar el pedido.');
      }
    });
  }
}