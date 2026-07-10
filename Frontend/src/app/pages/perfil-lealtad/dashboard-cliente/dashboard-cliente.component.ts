import { Component, signal, inject } from '@angular/core';
import { LealtadService } from '../../../services/lealtad.service'; // Ajusta la ruta
import { ILealtadFrontend } from '../../../core/models/lealtad.interface';
import { DatePipe } from '@angular/common';
import { Header } from "../../../shared/header/header";
import { Footer } from "../../../shared/footer/footer";
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [DatePipe, LowerCasePipe, Header, Footer],
  templateUrl: './dashboard-cliente.component.html'
})
export class DashboardClienteComponent {
  // 1. Inyectamos nuestro servicio personalizado en lugar de HttpClient directamente
  private lealtadService = inject(LealtadService);

  // 2. Definición de señales limpias para el estado de la UI
  clienteData = signal<ILealtadFrontend | null>(null);
  isLoading = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);

  buscarCuenta(id: string) {
    // 1. Limpiamos solo espacios accidentales, no borramos caracteres
    const valorBusqueda = id.trim();

    if (!valorBusqueda) return;

    // Reseteamos estados
    this.isLoading.set(true);
    this.errorMensaje.set(null);
    this.clienteData.set(null);

    // 2. Enviamos el valor tal cual al servicio
    this.lealtadService.obtenerClientePorId(valorBusqueda).subscribe({
      next: (data) => {
        this.clienteData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al consultar cliente:', err);
        // Si el backend es inteligente con el $or, simplemente dirá que no lo encontró
        this.errorMensaje.set('No se encontró ninguna cuenta con ese ID o Teléfono.');
        this.isLoading.set(false);
      }
    });
  }
}