import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // <-- 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../../services/pedido.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administrarPedido.page.html'
})
export class AdminPedidosComponent implements OnInit, OnDestroy {
  public listaPedidos: Array<any> = []; 
  private subscripcionIntervalo!: Subscription;

  
  public mostrarPasados: boolean = false;

  constructor(
    private readonly pedidoService: PedidoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarColaPedidos();

    this.subscripcionIntervalo = interval(5000).subscribe(() => {
      this.cargarColaPedidos();
    });
  }

  ngOnDestroy(): void {
    if (this.subscripcionIntervalo) {
      this.subscripcionIntervalo.unsubscribe();
    }
  }

  public cargarColaPedidos(): void {
    this.pedidoService.obtenerPedidosAdmin(this.mostrarPasados).subscribe({
      next: (response) => {
        if (response.success) {
          this.listaPedidos = response.data;
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => console.error('Error al actualizar la cola:', err)
    });
  }

 ////////////////
 // Mostrar los pedidos pasados
 ///////////////
  public togglePedidosPasados(): void {
    this.mostrarPasados = !this.mostrarPasados;
    this.cargarColaPedidos(); 
  }

  public onCambiarEstado(pedido: any, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const estadoSeleccionado = selectElement.value;

    if (estadoSeleccionado === 'cancelado') {
      const confirmacion = window.confirm('¿Estás seguro de que deseas cancelar este pedido?');
      if (!confirmacion) {
        selectElement.value = pedido.estado;
        return;
      }
    }

    this.pedidoService.actualizarEstadoPedido(pedido._id, estadoSeleccionado).subscribe({
      next: () => this.cargarColaPedidos(),
      error: (err) => {
        alert('Error: ' + err.error?.error);
        selectElement.value = pedido.estado;
      }
    });
  }

  public onEntregarPedido(id: string): void {
    this.pedidoService.actualizarEstadoPedido(id, 'entregado').subscribe({
      next: () => this.cargarColaPedidos(),
      error: () => alert('No se pudo entregar el pedido.')
    });
  }
}