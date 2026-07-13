import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../core/models/pedido.interface';

interface ProductoCatalogo {
  _id: string;
  nombre: string;
  precio: number;
}

@Component ({
  selector: 'ComponentePedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './realizarpedido.page.html'
})

export class ConfirmacionPedidoComponent implements OnInit { 
  public pedidoForm: FormGroup;
  public catalogoProductos: ProductoCatalogo[] = [];
  public totalVisual: number = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly pedidoService: PedidoService
  ) {
    this.pedidoForm = this.fb.group({
      clienteId: ['', [Validators.required]],
      articulos: this.fb.array([]),
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  private cargarCatalogo(): void {
    this.pedidoService.obtenerProductos().subscribe({
      next: (response) => {
        if (response.success) {
          this.catalogoProductos = response.data;
          this.agregarArticulo();
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

  private crearArticuloGroup(): FormGroup {
    return this.fb.group({
      productoId: ['', [Validators.required]], // Este campo ahora se llenará vía select
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  public agregarArticulo(): void {
    this.articulos.push(this.crearArticuloGroup());
    this.calcularTotal();
  }

  public eliminarArticulo(index: number): void {
    this.articulos.removeAt(index);
    this.calcularTotal();
  }

  public calcularTotal(): void {
    let acumulado = 0;

   
    this.articulos.controls.forEach((control) => {
      const prodId = control.get('productoId')?.value;
      const cantidad = control.get('cantidad')?.value || 0;

      const productoEncontrado = this.catalogoProductos.find(p => p._id === prodId);

      if (productoEncontrado) {
        acumulado += productoEncontrado.precio * cantidad;
      }
    });

    this.totalVisual = acumulado;
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
        this.pedidoForm.reset({ clienteId: '', notas: '' });
        this.articulos.clear();
        this.agregarArticulo();
      },
      error: (error) => {
        alert(error.error?.message || 'Error al guardar el pedido.');
      }
    });
  }
}