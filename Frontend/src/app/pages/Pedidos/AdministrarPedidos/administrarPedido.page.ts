import { Component, OnInit, OnDestroy, signal } from '@angular/core'; 
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
  // 1. Convertimos las variables en Signals
  public listaPedidos = signal<any[]>([]); 
  public mostrarPasados = signal<boolean>(false);
  
  private subscripcionIntervalo!: Subscription;

  constructor(private readonly pedidoService: PedidoService) {}

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
    // 2. Extraemos el valor del signal con ()
    this.pedidoService.obtenerPedidosAdmin(this.mostrarPasados()).subscribe({
      next: (response) => {
        if (response.success) {
          // 3. Actualizamos la señal con .set()
          this.listaPedidos.set(response.data);
        }
      },
      error: (err) => console.error('Error al actualizar la cola:', err)
    });
  }

  public togglePedidosPasados(): void {
    // 4. Alternamos el valor del boolean y recargamos
    this.mostrarPasados.update(valorActual => !valorActual);
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