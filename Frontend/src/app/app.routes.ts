import { Routes } from '@angular/router';
import { ProductoComponent } from './Producto/producto.component';
import { MenuProductoComponent } from './Producto/menuProducto.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { CanjeRecompensasComponent } from './pages/perfil-lealtad/canje/canje-recompensas.component';
import { RegistrarVisitaComponent } from './pages/perfil-lealtad/visita/registrar-visita.component';
import { DashboardClienteComponent } from './pages/perfil-lealtad/dashboard-cliente/dashboard-cliente.component';

export const routes: Routes = [
  // Redirección inicial
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full',
  },

  // Ruta pública del Menú
  {
    path: 'menu',
    component: MenuProductoComponent,
  },

  // MÓDULO ADMINISTRADOR (Agrupado)
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        component: DashboardAdminComponent, // URL: /admin/dashboard
      },
      {
        path: 'productos',
        component: ProductoComponent, // URL: /admin/productos
      }
    ]
  },


  // MÓDULO CLIENTE / PERFIL DE LEALTAD (Agrupado)
  {
    path: 'cliente',
    children: [
      {
        path: 'cuenta',
        component: DashboardClienteComponent, // URL: /cliente/cuenta
      },
      {
        path: 'canje',
        component: CanjeRecompensasComponent, // URL: /cliente/canje
      }
    ]
  },

  // Registro de visitas (externo o rápido)
  {
    path: 'registrar',
    component: RegistrarVisitaComponent, // URL: /registrar
  },

  // RUTA COMODÍN (Protección 404)
  // Si la ruta no existe, redirige al menú de forma segura
  {
    path: '**',
    redirectTo: 'menu',
  }
];