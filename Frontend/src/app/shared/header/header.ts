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
  private authSubscription!: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.authSubscription = this.authService.estaLogueado$.subscribe(estado => {
      this.UsuarioLogeado = estado;
    });

    this.verificarUsuario();

  }
  public verificarUsuario(): void {
    this.UsuarioLogeado=this.authService.estaLogueado()
  }

  public cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.verificarUsuario();
  }
}
