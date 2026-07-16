import { Routes } from '@angular/router';
import { ProductoComponent } from './pages/Producto/producto.component';
import { MenuProductoComponent } from './pages/Producto/menuProducto.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { CanjeRecompensasComponent } from './pages/perfil-lealtad/canje/canje-recompensas.component';
import { RegistrarVisitaComponent } from './pages/perfil-lealtad/visita/registrar-visita.component';
import { DashboardClienteComponent } from './pages/perfil-lealtad/dashboard-cliente/dashboard-cliente.component';
import { AdminPedidosComponent } from './pages/Pedidos/AdministrarPedidos/administrarPedido.page';
import { MisPedidosComponent } from './pages/Pedidos/RevisarEstadoPedido/revisarEstadoPedido.page';
import { ConfirmacionPedidoComponent } from './pages/Pedidos/RealizarPedido/realizarpedido.page';
import { Login } from './pages/usuario/login/login';
import { Registro } from './pages/usuario/registro/registro';
import { Perfil } from './pages/usuario/perfil/perfil';
import { authGuard } from './guards/auth.guard';

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
      },
      {
        path: 'pedidos',
        component: AdminPedidosComponent

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
      },
      {
        path: 'misPedidos',
        component: MisPedidosComponent,
      },
      {
        path: 'pedidos',
        component: ConfirmacionPedidoComponent
      },
      {
        path: 'perfil',
        component: Perfil,
        canActivate: [authGuard],
      },
    ]
  },

  // Registro de visitas (externo o rápido)
  {
    path: 'registrar',
    component: RegistrarVisitaComponent, // URL: /registrar
  },
  // ==============================
  // MÓDULO USUARIOS
  // ==============================
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'registro',
    component: Registro,
  },

  // RUTA COMODÍN (Protección 404)
  // Si la ruta no existe, redirige al menú de forma segura
  {
    path: '**',
    redirectTo: 'menu',
  }
];