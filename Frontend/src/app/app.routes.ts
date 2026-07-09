import { Routes } from '@angular/router';
import { ProductoComponent } from './Producto/producto.component';
import { MenuProductoComponent } from './Producto/menuProducto.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'productos',
    pathMatch: 'full',
  },
  {
    path: 'productos',
    component: ProductoComponent,
  },
  {
    path: 'menu',
    component: MenuProductoComponent,
  },
];