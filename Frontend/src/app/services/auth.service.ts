import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators'; 
import { CarritoService } from './carrito.service';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private logueadoSubject = new BehaviorSubject<boolean>(!!this.obtenerToken());
  public estaLogueado$ = this.logueadoSubject.asObservable();

  constructor(
    private carritoService: CarritoService
  ) { }

  // Método privado para centralizar el guardado de datos
  private guardarSesion(respuesta: any) {
    if (respuesta.token && respuesta.usuario) {
      localStorage.setItem('token', respuesta.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
      this.logueadoSubject.next(true); // Avisa a toda la app que ya estamos dentro
    }
  }

  // Registro: Ahora guarda la sesión automáticamente al recibir respuesta
  registrar(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, datos).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  // Login: Ahora guarda la sesión automáticamente
  login(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, datos).pipe(
      tap(respuesta => this.guardarSesion(respuesta))
    );
  }

  obtenerToken() {
    return localStorage.getItem('token');
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  obtenerUsuario() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      return JSON.parse(usuario);
    }
    return null;
  }

  cerrarSesion() {
    this.carritoService.sincronizarCarrito([]);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.logueadoSubject.next(false);
  }
}