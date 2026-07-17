import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido, ProductoCatalogo } from '../../../core/models/pedido.interface';
import { CarritoService, ArticuloCarrito } from '../../../services/carrito.service';
import { Router } from '@angular/router';
import { LealtadService } from '../../../services/lealtad.service';
import { AuthService } from '../../../services/auth.service'; // <-- Importamos el servicio Esmeralda para obtener el usuario logueado


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
  public subtotalVisual: number = 0;
  public descuentoVisual: number = 0;
  public puntosDisponibles: number = 0;
  public nivel: string = 'Regular';
  public recompensaAplicada: any = null;
  public clienteLealtadId: string | null = null;

  public catalogoRecompensas = [
    { descripcion: 'Bebida Gratis', puntos: 20 },
    { descripcion: 'Descuento del 10%', puntos: 50 },
    { descripcion: 'Producto Promocional', puntos: 100 },
    { descripcion: 'Cupón Especial VIP', puntos: 150 }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly pedidoService: PedidoService,
    private readonly carritoService: CarritoService,
    private readonly cdr: ChangeDetectorRef,
    private router: Router,
    private readonly lealtadService: LealtadService,
    private readonly authService: AuthService
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

    this.cargarDatosLealtad();
  }

  // NUEVO Función para traer los puntos del cliente actual
  private cargarDatosLealtad(): void {
    const usuario = this.authService.obtenerUsuario();
    if (usuario && usuario.id) {
      // Autocompletamos el campo clienteId en el formulario
      this.pedidoForm.patchValue({ clienteId: usuario.id });
      this.clienteLealtadId = usuario.id;

      this.lealtadService.obtenerClientePorId(usuario.id).subscribe({
        next: (data) => {
          this.puntosDisponibles = data.puntos_acumulados;
          this.nivel = data.nivel_actual;

          // LA SOLUCIÓN: Le avisamos a Angular que actualice la vista inmediatamente
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al obtener datos de lealtad:', err)
      });
    }
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

          this.catalogoProductos = response.data.filter((p: ProductoCatalogo) => p.stock > 0);

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
      let cantidad = control.get('cantidad')?.value || 0;

      const productoEncontrado = this.catalogoProductos.find(p => p._id === prodId);

      if (productoEncontrado) {
        if (cantidad > productoEncontrado.stock) {
          alert(`Solo hay ${productoEncontrado.stock} unidades de ${productoEncontrado.nombre} disponibles.`);
          cantidad = productoEncontrado.stock;
          control.get('cantidad')?.setValue(cantidad, { emitEvent: false });
        }

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

    this.subtotalVisual = acumulado;
    this.descuentoVisual = 0;

    // Aplicamos el descuento si hay una recompensa seleccionada
    if (this.recompensaAplicada) {
      if (this.recompensaAplicada.descripcion === 'Descuento del 10%') {
        this.descuentoVisual = acumulado * 0.10;
      }
      else if (this.recompensaAplicada.descripcion === 'Bebida Gratis') {
        const bebidasEnCarrito = nuevosArticulosCarrito.filter((art) => {
          const prod = this.catalogoProductos.find(p => p._id === art.productoId);

          //Esto imprimirá la categoría real que llega del backend
          console.log(`Analizando: ${prod?.nombre} | Categoría detectada: ${(prod as any)?.categoria}`);

          // Si el producto no tiene categoría (undefined), no puede ser una bebida
          if (!prod || !(prod as any).categoria) return false;

          const categoriaNormalizada = String((prod as any).categoria).toLowerCase();
          // Usamos includes() para atrapar "bebida", "bebidas", "bebidas calientes", etc.
          return categoriaNormalizada.includes('bebida');
        });

        if (bebidasEnCarrito.length > 0) {
          this.descuentoVisual = Math.min(...bebidasEnCarrito.map(b => b.precio));
        } else {
          alert('Debes agregar al menos una bebida al carrito para usar esta recompensa.');
          this.quitarRecompensa();
          return;
        }
      }
      else if (this.recompensaAplicada.descripcion === 'Producto Promocional') {
        const promosEnCarrito = nuevosArticulosCarrito.filter((art) => {
          const prod = this.catalogoProductos.find(p => p._id === art.productoId);

          console.log(`Analizando: ${prod?.nombre} | Categoría detectada: ${(prod as any)?.categoria}`);

          if (!prod || !(prod as any).categoria) return false;

          const categoriaNormalizada = String((prod as any).categoria).toLowerCase();
          return categoriaNormalizada.includes('promo');
        });

        if (promosEnCarrito.length > 0) {
          this.descuentoVisual = Math.min(...promosEnCarrito.map(p => p.precio));
        } else {
          alert('Debes agregar el producto promocional al carrito.');
          this.quitarRecompensa();
          return;
        }
      }
      else if (this.recompensaAplicada.descripcion === 'Cupón Especial VIP') {
        this.descuentoVisual = 150;
      }
    }

    this.totalVisual = Math.max(0, this.subtotalVisual - this.descuentoVisual);
    this.carritoService.sincronizarCarrito(nuevosArticulosCarrito);
  }

  public obtenerImagenProducto(idProducto: string): string {
    if (!idProducto) {
      return '';
    }
    const imagenProducto = this.catalogoProductos.find(p => p._id == idProducto);
    //console.log(imagenProducto);
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

  // Métodos para los botones de la interfaz
  public aplicarRecompensa(evento: any): void {
    const descripcion = evento.target.value;

    // Si el usuario regresa el select a "Selecciona una opción" (value vacío)
    if (!descripcion) {
      this.quitarRecompensa();
      return;
    }

    const recompensa = this.catalogoRecompensas.find(r => r.descripcion === descripcion);

    if (recompensa) {
      // Validamos si tiene los puntos suficientes
      if (this.puntosDisponibles >= recompensa.puntos) {
        this.recompensaAplicada = recompensa;
        this.calcularTotal();
      } else {
        alert('No tienes suficientes puntos para esta recompensa.');
        this.quitarRecompensa(); // Regresamos la interfaz al estado original
      }
    }
  }

  public quitarRecompensa(): void {
    this.recompensaAplicada = null;
    // Volvemos a poner el select en su estado inicial
    const select = document.getElementById('selectRecompensa') as HTMLSelectElement;
    if (select) select.value = "";
    this.calcularTotal();
  }


  public onSubmit(): void {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }

    const payload: any = this.pedidoForm.value; // Cambié a "value" para obtener los datos del formulario, era "Pedido"
    payload.total = this.totalVisual; // Aseguramos que el total enviado sea el calculado en la interfaz

    // Agregamos la categoría a cada artículo antes de enviarlo al backend
    payload.articulos = payload.articulos.map((articulo: any) => {
      // Buscamos el producto en el catálogo para extraer su categoría
      const productoCompleto = this.catalogoProductos.find(p => p._id === articulo.productoId);
      return {
        ...articulo,
        // Si lo encuentra manda la categoría, si no, manda un valor por defecto para evitar el error
        categoria: productoCompleto ? (productoCompleto as any).categoria : 'General'
      };
    });

    // Le avisamos al backend si se usó una recompensa para que descuente los puntos
    if (this.recompensaAplicada) {
      payload.recompensa_usada = {
        descripcion: this.recompensaAplicada.descripcion,
        puntos_a_descontar: this.recompensaAplicada.puntos
      };
    }

    this.pedidoService.crearPedido(payload).subscribe({
      next: (response) => {
        //alert(`Total del pedido: $${response.data.total}`);
        this.recompensaAplicada = null;
        this.descuentoVisual = 0;
        this.pedidoForm.reset({ clienteId: '', clienteNombre: '', notas: '' });
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