import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LealtadService, RespuestaVisita } from '../../../services/lealtad.service';
import { NgClass } from "../../../../../node_modules/@angular/common/types/_common_module-chunk";

@Component({
  selector: 'app-registrar-visita',
  standalone: true,
  imports: [FormsModule], 
  templateUrl: './registrar-visita.component.html'
})
export class RegistrarVisitaComponent {
  private lealtadService = inject(LealtadService);

  datosVisita = {
    cliente_id: '',
    pedido_id: '',
    total_compra: 0
  };

  // Estados de la interfaz actualizados a Signals
  procesando = signal<boolean>(false);
  resultado = signal<RespuestaVisita | null>(null);
  mensajeError = signal<string | null>(null);

  generarPedidoIdMock(): void {
    const caracteres = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    this.datosVisita.pedido_id = result;
  }

  procesarVisita(): void {
    if (!this.datosVisita.cliente_id || !this.datosVisita.pedido_id || this.datosVisita.total_compra <= 0) {
      this.mensajeError.set('Por favor, llena todos los campos. La compra debe ser mayor a $0.');
      return;
    }

    this.procesando.set(true);
    this.resultado.set(null);
    this.mensajeError.set(null);

    // Limpiamos los espacios en blanco del input del cliente (teléfono o ID)
    this.datosVisita.cliente_id = this.datosVisita.cliente_id.trim();

    this.lealtadService.registrarVisita(this.datosVisita).subscribe({
      next: (res) => {
        this.procesando.set(false);
        this.resultado.set(res);
        
        // Limpiamos los campos de compra para una simulación limpia posterior
        this.datosVisita.pedido_id = '';
        this.datosVisita.total_compra = 0;
      },
      error: (err) => {
        this.procesando.set(false);
        console.error('Error al registrar visita:', err);
        this.mensajeError.set(err.error?.message || 'Error interno al procesar la visita.');
      }
    });
  }

  // registrarVisita(): void {}

}