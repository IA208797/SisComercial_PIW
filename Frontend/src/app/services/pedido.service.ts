import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from '../core/models/pedido.interface';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/pedidos`;


    //////////////////
    //PARTE USUARIO
    //////////////////

    crearPedido(pedido: Pedido): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/RealizarPedido`, pedido);
    }

    obtenerProductos(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/ObtenerProductos`);
    }

    obtenerPedidosUsuario(clienteId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/pedidos/cliente/${clienteId}`);
    }

    /////////////////
    ///PARTE ADMIN
    //////////////////

    obtenerPedidosAdmin(incluirPasados: boolean = false): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/admin/pedidos?pasados=${incluirPasados}`);
    }


    actualizarEstadoPedido(id: string, nuevoEstado: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/admin/pedidos/${id}/estado`, { nuevoEstado });
    }


}