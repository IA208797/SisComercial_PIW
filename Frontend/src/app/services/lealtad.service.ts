import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILealtadFrontend } from '../core/models/lealtad.interface';
import { environment } from '../../environments/environment';

// Tipamos la respuesta exacta que configuramos en registrarVisitaYPuntos
export interface RespuestaVisita {
    mensaje: string;
    cliente: string;
    saldo_puntos: number;
    total_visitas: number;
    nivel_actual: string;
}

@Injectable({
    providedIn: 'root'
})
export class LealtadService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/lealtad`;

    // constructor(private http: HttpClient) { }

    /*
    1. Registra una visita y suma puntos por una compra
     */
    registrarVisita(datos: { cliente_id: string, pedido_id: string, total_compra: number }): Observable<RespuestaVisita> {
        return this.http.post<RespuestaVisita>(`${this.apiUrl}/visita`, datos);
    }

    /*
    2. Descuenta los puntos cuando el cliente pide una recompensa
     */
    canjearPuntos(datos: { cliente_id: string, puntos_a_descontar: number, descripcion_recompensa: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/canjear`, datos);
    }

    /*
    3. Obtiene el reporte global de lealtad para el dashboard del administrador
     */
    obtenerReporte(): Observable<any> {
        return this.http.get(`${this.apiUrl}/reporte`);
    }

    /*
    4. Método de prueba para generar un pedido_id aleatorio (mock)
     */
    obtenerClientePorId(id: string): Observable<ILealtadFrontend> {
        return this.http.get<ILealtadFrontend>(`${this.apiUrl}/cliente/${id}`);
    }
}