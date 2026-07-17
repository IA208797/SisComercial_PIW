import { Component, signal, inject, OnInit } from '@angular/core'; // <-- Agregamos OnInit
import { LealtadService } from '../../../services/lealtad.service';
import { AuthService } from '../../../services/auth.service'; // <-- Importamos el servicio Esmeralda para obtener el usuario logueado
import { ILealtadFrontend } from '../../../core/models/lealtad.interface';
import { DatePipe, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './dashboard-cliente.component.html'
})
export class DashboardClienteComponent implements OnInit { // <-- Implementamos la interfaz OnInit

  private lealtadService = inject(LealtadService);
  private authService = inject(AuthService); // <-- Inyectamos el servicio de autenticación

  clienteData = signal<ILealtadFrontend | null>(null);
  isLoading = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);

  // Señal extra para saber si cargó por sesión o si es una búsqueda manual
  busquedaManual = signal<boolean>(true);

  catalogoRecompensas = [
    { descripcion: 'Bebida Gratis', puntos: 20 },
    { descripcion: 'Descuento del 10%', puntos: 50 },
    { descripcion: 'Producto Promocional', puntos: 100 },
    { descripcion: 'Cupón Especial VIP', puntos: 150 }
  ];

  ngOnInit() {
    // Al abrir la página, revisamos la "mochila" del LocalStorage
    const usuarioLogueado = this.authService.obtenerUsuario();

    console.log("Datos encontrados en localStorage:", usuarioLogueado);

    if (usuarioLogueado.rol == 'admin') {

    }
    else {
      // Si hay un usuario en sesión, extraemos su identificador (revisa si tu backend manda '_id', 'id' o 'telefono')
      if (usuarioLogueado && usuarioLogueado.id) {
        this.busquedaManual.set(false); // Ocultamos el buscador manual
        this.buscarCuenta(usuarioLogueado.id); // Disparamos la búsqueda automáticamente
      } else {
        console.warn("No se encontró usuario o no tiene ID para buscar.");
      }

    }


  }

  buscarCuenta(id: string) {
    const valorBusqueda = id.trim();

    if (!valorBusqueda) return;

    this.isLoading.set(true);
    this.errorMensaje.set(null);
    this.clienteData.set(null);

    this.lealtadService.obtenerClientePorId(valorBusqueda).subscribe({
      next: (data) => {
        this.clienteData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al consultar cliente:', err);
        this.errorMensaje.set('No se encontró ninguna cuenta con ese ID o Teléfono.');
        this.isLoading.set(false);
        // Si falló la búsqueda automática, volvemos a mostrar el input manual por si acaso
        this.busquedaManual.set(true);
      }
    });
  }
}