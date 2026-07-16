import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private apiUrl = 'http://localhost:4000/api/usuarios';
  private logueadoSubject = new BehaviorSubject<boolean>(!!this.obtenerToken());
  public estaLogueado$ = this.logueadoSubject.asObservable();


  constructor(
    private http: HttpClient
  ) { }



  // Registro
  registrar(datos:any):Observable<any>{

    return this.http.post(
      `${this.apiUrl}/registro`,
      datos
    );

  }



  // Login
  login(datos:any):Observable<any>{
    this.logueadoSubject.next(true);
    return this.http.post(
      `${this.apiUrl}/login`,
      datos
    );

  }



  // Obtener token guardado
  obtenerToken(){

    return localStorage.getItem('token');

  }



  // Verificar si existe sesión
  estaLogueado():boolean{

    return !!this.obtenerToken();

  }



  // Obtener usuario actual
  obtenerUsuario(){

    const usuario = localStorage.getItem('usuario');


    if(usuario){

      return JSON.parse(usuario);

    }


    return null;

  }



  // Cerrar sesión
  cerrarSesion(){

    localStorage.removeItem('token');

    localStorage.removeItem('usuario');

    this.logueadoSubject.next(false);

  }


}