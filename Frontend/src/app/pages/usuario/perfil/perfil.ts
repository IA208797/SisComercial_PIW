import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  usuario:any;

  constructor(
    private authService: AuthService,
    private router: Router
  ){
    this.usuario = this.authService.obtenerUsuario();
  }

  cerrarSesion(){
    this.authService.cerrarSesion();
    alert("Sesión cerrada correctamente");
    this.router.navigate(['/login']);
  }
}