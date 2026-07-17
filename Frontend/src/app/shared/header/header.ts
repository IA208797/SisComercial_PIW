import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoComponent } from "./carrito/carrito.component";
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CarritoComponent],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  public UsuarioLogeado: boolean = false;
  public rolUsuario: string = 'cliente';
  private authSubscription!: Subscription;
  private authRolSubscription!: Subscription;
  public usuario: any;

  constructor(private authService: AuthService
  ) { this.usuario = this.authService.obtenerUsuario(); }

  ngOnInit(): void {

    this.authSubscription = this.authService.estaLogueado$.subscribe(estado => {
      this.UsuarioLogeado = estado;
      this.verificarUsuario();
    });
    // this.authRolSubscription = this.authService.rolUsuario.subscribe(Rol => {
    //   this.rolUsuario = Rol
    // })

    
  }
  public verificarUsuario(): void {
    this.verificarRol()
    this.UsuarioLogeado=this.authService.estaLogueado()
  }

  public cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.verificarUsuario();
  }

  public verificarRol(): void{
    const datosLocalStorage = this.authService.obtenerUsuario()
    if(datosLocalStorage){
      try{
        console.log(datosLocalStorage.rol)
        this.rolUsuario = datosLocalStorage.rol

      } catch(error){
         console.error('Error al transformar los datos del localStorage', error);
      }
    }
    
  }
}
