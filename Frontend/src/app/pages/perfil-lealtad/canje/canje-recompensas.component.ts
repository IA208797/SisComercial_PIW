import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Necesario para usar ngModel
import { LealtadService } from '../../../services/lealtad.service';
import { AuthService } from '../../../services/auth.service'; // <-- Importamos el servicio Esmeralda para obtener el usuario logueado
import { ILealtadFrontend } from '../../../core/models/lealtad.interface';


interface IRecompensaCatalogo {
  descripcion: string;
  puntos: number;
}

@Component({
  selector: 'app-canje-recompensas',
  standalone: true,
  imports: [FormsModule], 
  templateUrl: './canje-recompensas.component.html'
})
export class CanjeRecompensasComponent implements OnInit { 
  private lealtadService = inject(LealtadService);
  private authService = inject(AuthService);

  clienteData = signal<ILealtadFrontend | null>(null);
  isLoading = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);

  busquedaManual = signal<boolean>(true);

  // Catálogo centralizado para evitar discrepancias de datos
  catalogoRecompensas: IRecompensaCatalogo[] = [
    { descripcion: 'Bebida Gratis', puntos: 20 },
    { descripcion: 'Descuento del 10%', puntos: 50 },
    { descripcion: 'Producto Promocional', puntos: 100 },
    { descripcion: 'Cupón Especial VIP', puntos: 150 }
  ];

  // Estructura del formulario
  datosCanje = {
    cliente_id: '',
    puntos_a_descontar: 0,
    descripcion_recompensa: ''
  };

    ngOnInit() {
    // Al abrir la página, revisamos la "mochila" del LocalStorage
    const usuarioLogueado = this.authService.obtenerUsuario();
    if (usuarioLogueado && usuarioLogueado.id) {
      this.busquedaManual.set(false); // Ocultamos el buscador manual
      this.datosCanje.cliente_id = usuarioLogueado.id;
    }else {
      console.warn("No se encontró usuario o no tiene ID para buscar.");
    }
  }

  // Estados de la interfaz controlados por Signals
  procesando = signal<boolean>(false);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);
  saldoRestante = signal<number | null>(null);

  // Escucha el cambio del select y asigna el valor exacto de puntos
  actualizarPuntosAutomaticamente(): void {
    const seleccionada = this.catalogoRecompensas.find(
      r => r.descripcion === this.datosCanje.descripcion_recompensa
    );
    
    this.datosCanje.puntos_a_descontar = seleccionada ? seleccionada.puntos : 0;
  }

  procesarCanje(): void {
    // Limpiamos espacios en blanco del cliente
    this.datosCanje.cliente_id = this.datosCanje.cliente_id.trim();

    if (!this.datosCanje.cliente_id || this.datosCanje.puntos_a_descontar <= 0 || !this.datosCanje.descripcion_recompensa) {
      this.mensajeError.set('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.procesando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    this.lealtadService.canjearPuntos(this.datosCanje).subscribe({
      next: (respuesta) => {
        this.procesando.set(false);
        this.mensajeExito.set('¡Canje realizado con éxito!');
        this.saldoRestante.set(respuesta.cuentaLealtad.puntos_acumulados);
        
        // Reseteamos el formulario de forma segura
        this.datosCanje.puntos_a_descontar = 0;
        this.datosCanje.descripcion_recompensa = '';
      },
      error: (err) => {
        this.procesando.set(false);
        console.error('Error en el canje:', err);
        this.mensajeError.set(err.error?.message || 'Error al procesar el canje de puntos.');
      }
    });
  }
}