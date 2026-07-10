import { Component, OnInit, signal, inject } from '@angular/core';
import { LealtadService } from '../../services/lealtad.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from "../../shared/header/header";
import { Footer } from "../../shared/footer/footer";

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [RouterLink, CommonModule, Header, Footer], 
  templateUrl: './dashboard-admin.component.html'
})
export class DashboardAdminComponent implements OnInit {
  // 1. Inyección de dependencias moderna (reemplaza al constructor)
  private lealtadService = inject(LealtadService);

  // 2. Conversión de variables tradicionales a Signals
  resumenGlobal = signal<any>(null);
  distribucionNiveles = signal<any[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.lealtadService.obtenerReporte().subscribe({
      next: (data) => {
        // 3. Asignamos los valores recibidos utilizando el método .set() de la señal
        this.resumenGlobal.set(data.resumen);
        this.distribucionNiveles.set(data.niveles);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el reporte:', err);
        this.error.set('Hubo un problema al conectar con el servidor.');
        this.cargando.set(false);
      }
    });
  }
}