import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoComponent } from "./carrito/carrito.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CarritoComponent],
  templateUrl: './header.html',
})
export class Header {}
